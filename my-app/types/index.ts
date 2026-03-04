export interface Transaction {
  id: string;
  amount: number;
  category: string;
  description: string | null;
  date: string;
  type: string;
}

export interface QueryData {
  getUser: {
    id: string;
    firstName: string;
    personalTransactions: Transaction[];
  };
}

//Require a label (e.g: "Total Balance") and an 'amount' (e.g: 5000)
export interface BalanceCardProp {
  balance: number;
  spent: number;
}

// empty state interface props
export interface EmptyStateProps {
  message: string;
}

// TransactionRow prop
export interface TransactionRowProp {
  transaction: {
    id: string;
    amount: number;
    category: string;
    description: string | null;
    date: string;
    type: string;
  };
}
