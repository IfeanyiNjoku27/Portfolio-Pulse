import { prisma } from "../config/adapter.js";
import { plaidClient } from "../config/plaid.js";
import { GraphQLError } from "graphql";
import { encrypt } from "../utils/crypto.js";
import { decrypt } from "../utils/crypto.js";

export const Resolvers = {
  // QUERIES
  Query: {
    getUser: async (_, __, context) => {
      try {
        const { uid } = context;

        if (!uid) {
          throw new GraphQLError('User is not authenticated', {
            extensions: { code: 'UNAUTHENTICATED', http: { status: 401 } },
          });
        }

        const user = await prisma.user.findUnique({
          where: { id: uid },
          include: { transactions: true },
        });

        if (!user) {
          throw new GraphQLError("User cannot be found", {
            extensions: { code: 'USER_NOT_FOUND', http: { status: 404 } },
          });
        }

        return {
          ...user,
          personalTransactions: user.transactions,
        };
      } catch (error) {
        console.error("Error fetching user:", error);
        throw new GraphQLError("Failed to fetch user data", {
          extensions: { code: 'FAILED_TO_FETCH_USER_DATA', http: { status: 500 } },
        });
      }
    },

    getSharedAccount: async (_, __, context) => {
      return await prisma.sharedAccount.findUnique({
        where: { id: context.sharedAccountId },
      });
    },

    getAllUsers: async () => {
      return await prisma.user.findMany();
    },
  },

  // MUTATIONS
  Mutation: {
    createUser: async (_, { id, firstName, email }) => {
      return await prisma.user.create({
        data: { id, firstName, email },
      });
    },

    createSharedAccount: async (_, { name, type, memberIds }) => {
      return await prisma.sharedAccount.create({
        data: {
          name,
          type,
          members: {
            connect: memberIds.map((id) => ({ id })),
          },
        },
      });
    },

    deleteUser: async (_, { id }) => {
      return await prisma.user.delete({
        where: { id },
      });
    },

    addTransaction: async (_, args) => {
      const { userId, amount, category, type, description, sharedAccountId } =
        args;
      const amountInCents = Math.round(amount * 100);

      return await prisma.transaction.create({
        data: {
          amount,
          amountInCents,
          category,
          type,
          description,
          postedBy: { connect: { id: userId } },
          ...(sharedAccountId && {
            sharedAccount: { connect: { id: sharedAccountId } },
          }),
        },
      });
    },

    // Plaid mutation
    createPlaidLinkToken: async (_, __, context) => {
      try {
        const tokenResponse = await plaidClient.linkTokenCreate({
          user: {
            client_user_id: context.uid,
          },
          client_name: "Portfolio Pulse",
          products: ["transactions"],
          country_codes: ["US", "CA"],
          language: "en",
        });

        return tokenResponse.data.link_token;
      } catch (error) {
        console.error(
          "Error creating Plaid link token: ",
          error.response?.data || error,
        );
        throw new GraphQLError("Failed to create Plaid link token", {
          extensions: { code: 'FAILED_TO_CREATE_LINK_TOKEN', http: { status: 500 } },
        });
      }
    },

    exchangePublicToken: async (_, { publicToken }, context) => {
      try {
        // send the public token to Plaid to exchange it
        const response = await plaidClient.itemPublicTokenExchange({
          public_token: publicToken
        });

        const accessToken = encrypt(response.data.access_token);
        const itemId = response.data.item_id;

        // save the permanent access token to the database
        await prisma.plaidConnection.create({
          data: {
            accessToken: accessToken,
            itemId: itemId,
            userId: context.uid,
          },
        });

        console.log(`Successfully linked bank for user ${context.uid}`);
        return true;
      } catch (error) {
        console.error(
          "Error exchanging public token:",
          error.response?.data || error,
        );
        throw new GraphQLError("Failed to exchange public token", {
          extensions: { code: 'FAILED_TO_EXCHANGE_PUBLIC_TOKEN', http: { status: 500 } },
        });
      }
    },

    syncPlaidTransactions: async (_, __, context) => {
      try {
        // get users saved plaid connection
        const connection = await prisma.plaidConnection.findFirst({
          where: { userId: context.uid },
        });

        if (!connection) throw new Error("No linked bank account found");

        const decryptedToken = decrypt(connection.accessToken);
        const cursor = connection.cursor || undefined;

        // fetch from plaid using the saved cursor 
        const response = await plaidClient.transactionsSync({
          access_token: decryptedToken,
          cursor: cursor,
        });

        // update the databse with the new cursor (bookmark) 
        await prisma.plaidConnection.update({
          where: { id: connection.id },
          data: { cursor: response.data.next_cursor },
        });       

        // Helper function to map Plaid transaction to Prisma schema
        const mapPlaidTx = (t) => {
          const isWithdrawal = t.amount > 0;
          const absAmount = Math.abs(t.amount);

          return {
            plaidId: t.transaction_id,
            amount: absAmount,
            amountInCents: Math.round(absAmount * 100),
            category:
              t.personal_finance_category?.primary ||
              t.category?.[0] ||
              "Other",
            type: isWithdrawal ? "WITHDRAWAL" : "DEPOSIT",
            description: t.name,
            date: new Date(t.date),
            pending: t.pending,
            postedById: context.uid,
          };
        };

        // Map removed transactions to delete operations
        const removedOps = response.data.removed.map((t) =>
          prisma.transaction.deleteMany({
            where: { plaidId: t.transaction_id },
          })
        );

        // Map modified transactions to update operations
        const modifiedOps = response.data.modified.map((t) =>
          prisma.transaction.updateMany({
            where: { plaidId: t.transaction_id },
            data: mapPlaidTx(t),
          })
        );

        // Map added transactions to create operations
        const addedOps = response.data.added.map((t) =>
          prisma.transaction.upsert({
            where: { plaidId: t.transaction_id },
            create: mapPlaidTx(t),
            update: mapPlaidTx(t),
          })
        );

        // Execute all operations in a transaction
        await prisma.$transaction([...removedOps, ...modifiedOps, ...addedOps]);

        console.log(
          `Successfully synced ${response.data.added.length} added, ${response.data.modified.length} modified, ${response.data.removed.length} removed transactions!`
        );
        return true;
      } catch (error) {
        console.error(
          "Error syncing transaction:",
          error.response?.data || error,
        );
        throw new GraphQLError("Failed to sync Plaid transactions", {
          extensions: { code: 'FAILED_TO_SYNC_PLAID_TRANSACTIONS', http: { status: 500 } },
        });
      }
    },
  },

  // FIELD RESOLVERS
  User: {
    personalTransactions: async (parent) => {
      return await prisma.transaction.findMany({
        where: { postedById: parent.id, sharedAccountId: null },
      });
    },
    sharedAccounts: async (parent) => {
      return await prisma.sharedAccount.findMany({
        where: { members: { some: { id: parent.id } } },
      });
    },
  },

  SharedAccount: {
    members: async (parent) => {
      return await prisma.user.findMany({
        where: { sharedAccounts: { some: { id: parent.id } } },
      });
    },
    transactions: async (parent) => {
      return await prisma.transaction.findMany({
        where: { sharedAccountId: parent.id },
      });
    },
  },
};
