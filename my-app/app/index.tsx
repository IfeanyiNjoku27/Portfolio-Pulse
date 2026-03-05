import { Redirect } from "expo-router";
import {
  Text,
  View,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import BalanceCard from "@/components/BalanceCard";
import TransactionRow from "@/components/TransactionRow";
import EmptyState from "@/components/EmpyState";
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
  }, [data]);

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
        <Text>Error loading data: {error.message}</Text>
      </View>
    );

  const transactions = data?.getUser?.personalTransactions || [];
  // 5. Render the UI
  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>
          Welcome, {data?.getUser?.firstName || "User"}
        </Text>
        {/* Sign Out Button */}
        <TouchableOpacity onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
      {userId && <PlaidLinkButton userId={userId} />}

      <BalanceCard balance={totalBalance} spent={totalSpent} />

      <Text style={styles.subHeader}>Recent Transactions</Text>

      {transactions.length === 0 ? (
        <EmptyState message="No transactions yet. Start tracking!" />
      ) : (
        transactions.map((tx: any) => (
          <TransactionRow key={tx.id} transaction={tx} />
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#000000" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#000000" },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginTop: 40,
    marginBottom: 20,
  },
  header: { fontSize: 24, fontWeight: "bold", color: "#FFFFFF" },
  signOutText: { color: "#FF3B30", fontSize: 16, fontWeight: "600" },
  subHeader: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
    marginTop: 20,
    color: "#FFFFFF"
  },
});
