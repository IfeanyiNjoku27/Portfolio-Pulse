import React from "react";
import { View, Text, StyleSheet } from "react-native";


//Require a label (e.g: "Total Balance") and an 'amount' (e.g: 5000)
interface BalanceCardProp{
    label: string;
    amount: number;
}

export default function BalanceCard({ label, amount }: BalanceCardProp) {
    //Using Intl.NumberFormat for currency so that commas are handled automatically 
    const formattedAmount = new Intl.NumberFormat('en-CA', {
        style: 'currency',
        currency: 'CAD',
    }).format(amount)

    return (
        <View style={styles.card}>
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.amount}>{formattedAmount}</Text>
        </View>
    )
}

// Card Style
const styles = StyleSheet.create({
    card: {
    backgroundColor: '#1C1C1E', // Slightly lighter than background for contrast
    borderRadius: 16,
    padding: 24,
    marginVertical: 20, // Space above and below the card
    marginHorizontal: 20, // Space on the sides
    // Shadow for iOS (adds depth)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  label: {
    color: '#8E8E93', // Grey text for the label
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  amount: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: 'bold',
  },
});