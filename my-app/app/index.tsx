import { HeaderTitle } from "@react-navigation/elements";
import {
  Text,
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BalanceCard from "@/components/BalanceCard";
import TransactionRow from "@/components/TransactionRow";
import {
  calculateTotalSavings,
  getSpendingByCategory,
} from "@/utils/financeUtils";
import EmptyState from "@/components/EmpyState";
import SpendingBlock from "@/components/SpendingBlock";
import { useMemo } from "react";
import { useQuery } from "@apollo/client/react";
import { gql } from "@apollo/client";
import { QueryData } from "@/types";

// Define graphql query
const GET_USER_DATA = gql`
  query GetUserData {
    getUser(id: "f1bd5a2c-8b69-4c0e-b06c-b1b2c18faff3") {
    id
    firstName
      personalTransactions {
        id
        description
        amount
        category
        date
        type
      }
  }
}
`;

export default function Home() {
  const { loading, error, data } = useQuery<QueryData>(GET_USER_DATA);

  //useMemo to handle live data and calculations
  const { totalBalance, totalSpent } = useMemo(() => {
    let balance = 0;
    let spent = 0;

    if (data?.getUser.personalTransactions) {
      data.getUser.personalTransactions.forEach((tx: any) => {
        if(tx.type === 'DEPOSIT') {
          balance += tx.amount;
        } else if (tx.type === 'WITHDRAWAL') {
          balance -= tx.amount;
          spent += tx.amount;
        }
    });
    }
    return { totalBalance: balance, totalSpent: spent };
  }, [data]);

  // UI states
  if (loading) return <View style={styles.centered}><ActivityIndicator size="large" /></View>;
  if (error) return <View style={styles.centered}><Text>Error loading data: {error.message}</Text></View>;

  const transactions = data?.getUser?.personalTransactions || [];

  // 5. Render the UI
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Welcome back, {data?.getUser?.firstName}</Text>
      
      <BalanceCard balance={totalBalance} spent={totalSpent} />

      <Text style={styles.subHeader}>Recent Transactions</Text>
      
      {transactions.length === 0 ? (
        <EmptyState message="No transactions yet. Start tracking!" />
      ) : (
        transactions.map((tx: any) => (
          <TransactionRow 
            key={tx.id} 
            transaction={tx} 
          />
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, marginTop: 40 },
  subHeader: { fontSize: 18, fontWeight: '600', marginBottom: 10, marginTop: 20 }
});