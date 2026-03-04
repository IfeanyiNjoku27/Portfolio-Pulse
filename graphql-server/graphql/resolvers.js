import { prisma } from '../config/adapter.js';

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
    }
  }, 

  // MUTATIONS
  Mutation: {
    createUser: async (_, { firstName, email }) => {
      return await prisma.user.create({
        data: { firstName, email },
      });
    },

    createSharedAccount: async (_, { name, type, memberIds }) => {
      return await prisma.sharedAccount.create({
        data: {
          name,
          type,
          members: {
            connect: memberIds.map(id => ({ id }))
          }
        },
      });
    },

    addTransaction: async (_, args) => {
      const { userId, amount, category, type, description, sharedAccountId } = args;
      const amountInCents = Math.round(amount * 100);

      return await prisma.transaction.create({
        data: {
          amount,
          amountInCents,
          category,
          type,
          description,
          postedBy: { connect: { id: userId } },
          ...(sharedAccountId && { sharedAccount: { connect: { id: sharedAccountId } } })
        }
      });
    }
  }, 

  // FIELD RESOLVERS
  User: {
    personalTransactions: async (parent) => {
      return await prisma.transaction.findMany({
        where: { postedById: parent.id, sharedAccountId: null }
      });
    },
    sharedAccounts: async (parent) => {
      return await prisma.sharedAccount.findMany({
        where: { members: { some: { id: parent.id } } }
      });
    }
  },

  SharedAccount: {
    members: async (parent) => {
      return await prisma.user.findMany({
        where: { sharedAccounts: { some: { id: parent.id } } }
      });
    },
    transactions: async (parent) => {
      return await prisma.transaction.findMany({
        where: { sharedAccountId: parent.id }
      });
    }
  }
};