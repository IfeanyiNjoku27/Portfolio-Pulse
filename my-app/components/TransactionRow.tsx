import React from "react";
import { View, Text, StyleSheet } from "react-native";

// Prop
interface TransactionRowProp {
    id: string;
    title: string;
    amount: number;
    date: string;
}

export default function TransactionRow({ title, amount, date }: TransactionRowProp) {
    // Format the currency
    const formattedAmount = new Intl.NumberFormat('en-CA', {
        style: "currency",
        currency: "CAD",
    }).format(amount);

    return (
        <View style={styles.row}>
            <View style={styles.leftSide}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.date}>{date}</Text>
            </View>
            <Text style={styles.amount}>{formattedAmount}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row', // Align children left-to-right
    justifyContent: 'space-between', // Push leftSide to left, amount to right
    alignItems: 'center', // Vertically center content
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E', // Subtle separator line
  },
  leftSide: {
    flexDirection: 'column',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  date: {
    color: '#8E8E93',
    fontSize: 12,
    marginTop: 4,
  },
  amount: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});