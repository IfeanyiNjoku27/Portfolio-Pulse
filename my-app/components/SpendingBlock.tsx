import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CategorySummary } from '../utils/financeUtils';

interface SpendingBlockProps {
  data: CategorySummary[];
}

export default function SpendingBlock({ data }: SpendingBlockProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Spending Habits</Text>
      
      <View style={styles.card}>
        {data.map((item) => (
          <View key={item.name} style={styles.row}>
            {/* Text Label Section */}
            <View style={styles.textRow}>
              <View style={styles.labelGroup}>
                <View style={[styles.dot, { backgroundColor: item.color }]} />
                <Text style={styles.categoryName}>{item.name}</Text>
              </View>
              <Text style={styles.amountText}>
                {new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(item.total)}
              </Text>
            </View>

            {/* Bar Chart Section */}
            <View style={styles.track}>
              <View 
                style={[
                  styles.bar, 
                  { width: `${item.percentage}%`, backgroundColor: item.color }
                ]} 
              />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#8E8E93',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 16,
  },
  row: {
    marginBottom: 16,
  },
  textRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  labelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  categoryName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  amountText: {
    color: '#8E8E93',
    fontSize: 14,
  },
  track: {
    height: 6,
    backgroundColor: '#2C2C2E',
    borderRadius: 3,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: 3,
  },
});