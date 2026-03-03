import { HeaderTitle } from "@react-navigation/elements";
import { Text, View, StyleSheet, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BalanceCard from "@/components/BalanceCard";
import TransactionRow from "@/components/TransactionRow";
import { calculateTotalSavings, getSpendingByCategory } from "@/utils/financeUtils";
import EmptyState from "@/components/EmpyState";
import SpendingBlock from "@/components/SpendingBlock";
import { useMemo } from "react";

// Define Mock Data for TransactionRow
const MOCK_TRANSACTIONS = [
  { id: '1', title: 'Starbucks', amount: 5.45, date: 'Jan 23', category: 'Food' },
  { id: '2', title: 'Uber', amount: 12.20, date: 'Jan 22', category: 'Transport' },
  { id: '3', title: 'Netflix', amount: 16.99, date: 'Jan 20', category: 'Entertainment' },
  { id: '4', title: 'Loblaws', amount: 45.12, date: 'Jan 18', category: 'Grocery' },
  { id: '5', title: 'Spotify', amount: 10.99, date: 'Jan 15', category: 'Entertainment' },
  { id: '6', title: 'Tim Hortons', amount: 3.25, date: 'Jan 14', category: 'Food' },
  { id: '7', title: 'Uber Eats', amount: 68.77, date: 'Jan 26', category: 'Food'},
];

export default function Home() {
  // useMemo ensures it is only recalculated if MOCK_TRANSACTIONS changes
  // This prevents the math from running on every single re-render.
  const totalSavings = useMemo(() => {
    return calculateTotalSavings(MOCK_TRANSACTIONS);
  }, []);

  // Calculate spending data
  const spendingData = useMemo(() => {
    return getSpendingByCategory(MOCK_TRANSACTIONS);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Area */}
      <View style={styles.headerContainer}>
        <Text style={styles.HeaderTitle}>Portfolio Pulse</Text>
      </View>

      {/* Balance Card */}
      <BalanceCard label="Date Fund" amount={totalSavings} goalAmount={25} />

      {/* Spending Block */}
      <SpendingBlock data={spendingData} />

      {/* Recent Activity Section */}
      <View style={styles.listContainer}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>

        {/* Transaction Row Flatlist*/}
        <FlatList
          data={MOCK_TRANSACTIONS}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TransactionRow
              id={item.id}
              title={item.title}
              amount={item.amount}
              date={item.date}
            />
          )}
          // Empty List Component
          ListEmptyComponent={EmptyState}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0E0E0E",
  },
  headerContainer: {
    paddingHorizontal: 20, //adds spacing to the left and right
    marginTop: 10,
  },
  HeaderTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  listContainer: {
    flex: 1, // Takes remaining space
    paddingHorizontal: 20,
    marginTop: 10,
  },
  sectionTitle: {
    color: "#8E8E93",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 10,
    textTransform: "uppercase",
  },
  text: {
    fontFamily: "Conchin",
    fontSize: 20,
    color: "#912",
  },
});
