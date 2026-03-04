import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { BalanceCardProp } from "@/types";

export default function BalanceCard({
  balance, 
  spent
}: BalanceCardProp) {
  return (
    <View style={styles.card}>
      <View style={styles.textContainer}>
        <Text>Balance: ${balance}</Text>
        <Text>Spent: ${spent}</Text>
      </View>
    </View>
  );
}

// Card Style
const styles = StyleSheet.create({
  card: {
    backgroundColor: "#dfdff2",
    borderRadius: 16,
    padding: 24,
    marginVertical: 20,
    marginHorizontal: 20,
  },
  textContainer: {
    marginBottom: 16,
  },
  label: {
    color: "#8E8E93",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    textTransform: "uppercase",
  },
  amount: {
    color: "#FFFFFF",
    fontSize: 36,
    fontWeight: "bold",
  },
  // New Styles for the Bar
  progressBarBackground: {
    height: 8,
    backgroundColor: "#2C2C2E", 
    borderRadius: 4,
    overflow: "hidden", // Ensures the inner bar respects the rounded corners
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#34C759", 
    borderRadius: 4,
  },
  goalText: {
    color: "#8E8E93",
    fontSize: 12,
    marginTop: 8,
    textAlign: "right", 
  },
});
