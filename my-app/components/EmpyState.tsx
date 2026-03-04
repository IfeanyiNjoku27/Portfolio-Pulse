import React from "react";
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { EmptyStateProps } from "@/types";

export default function EmptyState({ message }: EmptyStateProps) {
    return (
        <View style={styles.container}>
            <Ionicons name="receipt-outline" size={48} color="#2C2C2E" />

            <Text style={styles.text}>{message}</Text>
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
  text: { fontSize: 16, color: '#666' }
});