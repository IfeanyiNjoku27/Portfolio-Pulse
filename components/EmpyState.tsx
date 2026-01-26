import React from "react";
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function EmptyState() {
    return (
        <View style={styles.container}>
            <Ionicons name="receipt-outline" size={48} color="#2C2C2E" />

            <Text style={styles.title}>No transactions made yet</Text>
            <Text style={styles.subtitle}>
                Spend with your card to see your round-ups grow here.
            </Text>
        </View>
    )
}





const styles = StyleSheet.create({
  container: {
    alignItems: 'center', // Center horizontally
    justifyContent: 'center', // Center vertically (if flexed)
    paddingVertical: 40,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  subtitle: {
    color: '#8E8E93',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    maxWidth: '70%', // Prevent text from hitting the very edge
  },
});