import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { TransactionRowProp } from "@/types";

export default function TransactionRow({ transaction }: TransactionRowProp) {

  return (
    <View style={styles.row}>
      {/* Use transaction.category, transaction.amount, etc. */}
      <Text>{transaction.category}</Text>
      <Text>
        {transaction.type === "WITHDRAWAL" ? "-" : "+"}${transaction.amount}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#2C2C2E", 
  },
  leftSide: {
    flexDirection: "column",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
  date: {
    color: "#8E8E93",
    fontSize: 12,
    marginTop: 4,
  },
  amount: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
