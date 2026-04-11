import { Redirect } from "expo-router";
import {
  Text,
  View,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import BalanceCard from "@/components/BalanceCard";
import TransactionRow from "@/components/TransactionRow";
import EmptyState from "@/components/EmptyState";
import SpendingBlock from "@/components/SpendingBlock";
import { formatCurrency } from "@/utils/financeUtils";
import {
  calculateRoundUp,
  getSpendingByCategory,
  calculateTotalSavings,
} from "@/utils/financeUtils";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "expo-router";
import { auth } from "@/utils/firebaseConfig";
import { useMemo, useState, useEffect } from "react";
import { useQuery } from "@apollo/client/react";
import { gql } from "@apollo/client";
import { QueryData } from "@/types";
import PlaidLinkButton from "@/components/PlaidLinkButton";

// Define graphql query
const GET_USER_DATA = gql`
  query GetUserData($id: ID!) {
    getUser(id: $id) {
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
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // firebase checks to see who is logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid); //set active user id
      } else {
        router.replace("/login"); // send them to login if not authenticated
      }
      setIsAuthLoading(false);
    });

    return unsubscribe;
  }, []);

  // pass userId into apollo query
  const {
    loading: queryLoading,
    error,
    data,
  } = useQuery<QueryData>(GET_USER_DATA, {
    variables: { id: userId },
    skip: !userId, // dont run query until firebase gives id
  });

  const transactions = data?.getUser?.personalTransactions || [];

  //useMemo to handle live data and calculations
  const { totalBalance, totalSpent } = useMemo(() => {
    let balance = 0;
    let spent = 0;

    if (data?.getUser.personalTransactions) {
      data.getUser.personalTransactions.forEach((tx: any) => {
        if (tx.type === "DEPOSIT") {
          balance += tx.amount;
        } else if (tx.type === "WITHDRAWAL") {
          balance -= tx.amount;
          spent += tx.amount;
        }
      });
    }
    return { totalBalance: balance, totalSpent: spent };
  }, [transactions]);

  // Calculation utlilites
  const spareChangeSaved = calculateTotalSavings(transactions);

  // Format the numbers for the Balance Card
  const formattedBalance = formatCurrency(totalBalance);
  const formattedSpent = formatCurrency(totalSpent);

  // Category data
  const categoryData = useMemo(
    () => getSpendingByCategory(transactions),
    [transactions],
  );

  // recent transactions
  const recentTransactions = transactions.slice(0, 5);

  // signout function
  const handleSignOut = async () => {
    await signOut(auth);
  };

  // loading states
  if (isAuthLoading || queryLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }
  if (error)
    return (
      <View style={styles.centered}>
        <Text style={{ color: "red" }}>
          Error loading data: {error.message}
        </Text>
      </View>
    );

  // 5. Render the UI
  return (
    <ScrollView
      style={styles.headerContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerRow}>
        <Text style={styles.header}>
          Welcome, {data?.getUser?.firstName || "User"}
        </Text>
        <TouchableOpacity onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {userId && <PlaidLinkButton userId={userId} />}

      <BalanceCard balance={formattedBalance} spent={formattedSpent} />

      {/* Spare Change UI */}
      <View style={styles.spareChangeCard}>
        <Text style={styles.spareChangeTitle}>Spare Change Saved</Text>
        <Text style={styles.spareChangeAmount}>
          ${spareChangeSaved.toFixed(2)}
        </Text>
      </View>

      {/* Spending Block UI */}
      <View style={styles.spendingBlockContainer}>
        <Text style={styles.subHeader}>Spending by Category</Text>
        <SpendingBlock data={categoryData} />
      </View>

      {/* Recent Transactions Section */}
      <View style={styles.recentHeaderRow}>
        <Text style={styles.subHeader}>Recent Transactions</Text>
        <TouchableOpacity onPress={() => router.push("/transactions")}>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>

      {recentTransactions.length === 0 ? (
        <EmptyState message="No transactions yet. Start tracking!" />
      ) : (
        recentTransactions.map((tx: any) => (
          <TransactionRow key={tx.id} transaction={tx} />
        ))
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#bdb8b8", paddingHorizontal: 20 },
  headerContainer: { paddingBottom: 10 },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000000",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginTop: 60, // Adjusted for SafeArea
    marginBottom: 20,
  },
  header: { fontSize: 24, fontWeight: "bold", color: "#000000" }, // Changed to black for contrast against grey background
  signOutText: { color: "#FF3B30", fontSize: 16, fontWeight: "600" },
  subHeader: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
    marginTop: 20,
    color: "#000000",
  },
  spareChangeCard: {
    backgroundColor: "#000000",
    padding: 15,
    borderRadius: 12,
    marginTop: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  spareChangeTitle: { color: "#FFFFFF", fontSize: 16, fontWeight: "500" },
  spareChangeAmount: { color: "#34C759", fontSize: 18, fontWeight: "bold" },
  spendingBlockContainer: {
    marginTop: 10,
  },
  recentHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 10,
  },
  seeAllText: {
    color: "#007AFF",
    fontWeight: "600",
    fontSize: 14,
  },
});
