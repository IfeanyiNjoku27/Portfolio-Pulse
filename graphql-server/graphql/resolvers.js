import { use } from "react";
import { prisma } from "../config/adapter.js";
import { plaidClient } from "../config/plaid.js";

export const Resolvers = {
  // QUERIES
  Query: {
    getUser: async (_, { id }) => {
      return await prisma.user.findUnique({
        where: { id },
      });
    },

    getSharedAccount: async (_, { id }) => {
      return await prisma.sharedAccount.findUnique({
        where: { id },
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
    createPlaidLinkToken: async (_, { userId }) => {
      try {
        const tokenResponse = await plaidClient.linkTokenCreate({
          user: {
            client_user_id: userId,
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
        throw new Error("Failed to create Plaid link token");
      }
    },

    exchangePublicToken: async (_, { publicToken, userId }) => {
      try {
        // send the public token to Plaid to exchange it
        const response = await plaidClient.itemPublicTokenExchange({
          public_token: publicToken,
        });

        const accessToken = response.data.access_token;
        const itemId = response.data.item_id;

        // save the permanent access token to the database
        await prisma.plaidConnection.create({
          data: {
            accessToken: accessToken,
            itemId: itemId,
            userId: userId,
          },
        });

        console.log(`Successfully linked bank for user ${userId}`);
        return true;
      } catch (error) {
        console.error(
          "Error exchanging public token:",
          error.response?.data || error,
        );
        throw new Error("Failed to exchange public token");
      }
    },

    syncPlaidTransactions: async (_, { userId }) => {
      try {
        // get users saved plaid connection
        const connection = await prisma.plaidConnection.findFirst({
          where: { userId: userId },
        });

        if (!connection) throw new Error("No linked bank account found");

        // fetch transaction history from plaid
        const response = await plaidClient.transactionsSync({
          access_token: connection.accessToken,
        });

        const newTransactions = response.data.added;

        // map plaid data to prisma schema
        const transactionToSave = newTransactions.map((t) => {
          const isWithdrawal = t.amount > 0;
          const absAmount = Math.abs(t.amount);

          return {
            amount: absAmount,
            amountInCents: Math.round(absAmount * 100),
            // grabbing primary categories
            category:
              t.personal_finance_category.primary || t.category?.[0] || "Other",
            type: isWithdrawal ? "WITHDRAWAL" : "DEPOSIT",
            description: t.name,
            date: new Date(t.date),
            postedById: userId,
          };
        });

        // save all to database at once
        if (transactionToSave.length > 0) {
          await prisma.transaction.createMany({
            data: transactionToSave,
          });
        }
        console.log(
          `Successfully sycned ${transactionToSave.length} transactions!`,
        );
        return true;
      } catch (error) {
        console.error("Error syncing transaction:", error.response?.data || error);
        throw new Error("Failed to sync Plaid transactions");
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
