export const typeDefs = `#graphql
enum AccountType {
    INDIVIDUAL
    COUPLE 
    FAMILY
}

enum TransactionType {
    DEPOSIT 
    WITHDRAWAL 
    ROUND_UP
}

#Core user type
type  User {
    id: ID!
    firstName: String!
    email: String!
    personalTransactions: [Transaction!]
    sharedAccounts: [SharedAccount!]
    plaidConnections: [PlaidConnection!]
    createdAt: String!
}

# Shared Account type (couples/families)
type SharedAccount {
    id: ID!
    name: String!               #e.g., valentines date fund, trip savings
    type: AccountType!
    members: [User!]!
    transactions: [Transaction!]
    totalBalance: Float!
    savingsGoal: Float 
    createdAt: String!
}

# Transaction Type
type Transaction {
    id: ID!
    amount: Float!
    amountInCents: Int!
    category: String! 
    type: TransactionType!
    description: String
    date: String!

# A transaction should belong to either an inidiviual user or a shared account
    postedBy: User!
    sharedAccountId: ID
}

# Type to query a users connection
    type PlaidConnection {
        id: ID!
        itemId: String!
        createdAt: String!
    }

# Queries
type Query {
#Get all users
    getAllUsers: [User!]!

#fetch a user and all nested accounts and transactions
    getUser(id: ID!): User

# Fetch a specific shared account to load its dashboard
    getSharedAccount(id: ID!): SharedAccount
}

# Mutations 
type Mutation {
    #Create a new user
    createUser(id: ID!, firstName: String!, email: String!): User!

    # Delete user and all their transactions (personal and shared)
    deleteUser(id: ID!): User!

    # Initialize new shared pool for the couple accounts 
    createSharedAccount(name: String!, type: AccountType!, memberIds: [ID!]!): SharedAccount!

    # Add transaction. if sharedAccountId is provided, it goes to shared pool
    addTransaction(
        userId: ID!
        amount: Float!
        category: String!
        type: TransactionType!
        description: String
        sharedAccountId: ID
    ): Transaction! 

    exchangePublicToken(publicToken: String! userId: ID!): Boolean!

    # Plaid link token
    createPlaidLinkToken(userId: ID!): String!

    # fetch latest transactions from plaid and saves them to database
    syncPlaidTransactions(userId: ID!): Boolean!
}
`;
