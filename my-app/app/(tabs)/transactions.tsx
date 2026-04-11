// app/(tabs)/transactions.tsx
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/utils/firebaseConfig";
import TransactionRow from "@/components/TransactionRow";
import EmptyState from "@/components/EmptyState";
import { QueryData } from "@/types";

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

export default function TransactionsScreen() {
  const [userId, setUserId] = useState<string | null>(null);

  // Safely get the user ID
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) setUserId(user.uid);
    });
    return unsubscribe;
  }, []);

  // pass userId into apollo query
  const { loading, error, data } = useQuery<QueryData>(GET_USER_DATA, {
    variables: { id: userId },
    skip: !userId, // dont run query until firebase gives id
  });

  if (loading || !userId) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: "red" }}>Error loading transactions.</Text>
      </View>
    );
  }

  const transactions = data?.getUser?.personalTransactions || [];

  return (
    <View style={styles.container}>
      <Text style={styles.header}>All Transactions</Text>

      {/* massive flatlist to render transactions */}
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TransactionRow transaction={item} />}
        ListEmptyComponent={<EmptyState message="No transactions found." />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#bdb8b8", paddingHorizontal: 20 },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000000",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000000",
    marginTop: 60,
    marginBottom: 20,
  },
});
