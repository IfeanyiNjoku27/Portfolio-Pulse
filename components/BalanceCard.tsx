import React from "react";
import { View, Text, StyleSheet } from "react-native";

//Require a label (e.g: "Total Balance") and an 'amount' (e.g: 5000)
interface BalanceCardProp {
  label: string;
  amount: number;
  goalAmount: number;
}

export default function BalanceCard({
  label,
  amount,
  goalAmount,
}: BalanceCardProp) {
  //Using Intl.NumberFormat for currency so that commas are handled automatically
  const formattedAmount = new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
  }).format(amount);

  // Calculate percentage (0 to 100)
  // Using Math.min to ensure the bar never goes past 100% width
  const progressPercent = Math.min(amount / goalAmount) * 100;

  return (
    <View style={styles.card}>
      <View style={styles.textContainer}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.amount}>{formattedAmount}</Text>
      </View>

      {/* Progress Bar Container */}
      <View style={styles.progressBarBackground}>
        <View 
            style={[
                styles.progressBarFill,
                { width: `${progressPercent}%` }
            ]}
        />
      </View>

      <Text style={styles.goalText}>
        Target: ${goalAmount}
      </Text>
    </View>
  );
}

// Card Style
const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1C1C1E",
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
    backgroundColor: "#2C2C2E", // Dark Grey Track
    borderRadius: 4,
    overflow: "hidden", // Ensures the inner bar respects the rounded corners
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#34C759", // Apple Green / Wealthsimple Green
    borderRadius: 4,
  },
  goalText: {
    color: "#8E8E93",
    fontSize: 12,
    marginTop: 8,
    textAlign: "right", // Align text to the right
  },
});
