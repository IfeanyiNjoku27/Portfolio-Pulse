/**
 * This calculates the spare change (round-up) from a transaction amount.
 * Example: $3.45 -> $0.55 round-up to reach $4.00
 */

// Category Interface 
export interface CategorySummary {
  name: string;
  total: number;
  percentage: number; // 0 to 100
  color: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  Food: '#FF9500',       
  Transport: '#5856D6',   
  Entertainment: '#FF2D55', 
  Grocery: '#34C759',     
  Other: '#8E8E93',      
};

export const getSpendingByCategory = (transactions: any[]): CategorySummary[] => {
  // 1. Calculate Grand Total of spending (not round-ups)
  const grandTotal = transactions.reduce((sum, t) => sum + t.amount, 0);

  // 2. Group and Sum by Category
  const categoryTotals: Record<string, number> = {};
  
  transactions.forEach((t) => {
    const cat = t.category || 'Other';
    // If category exists add to it; otherwise start at 0
    categoryTotals[cat] = (categoryTotals[cat] || 0) + t.amount;
  });

  // 3. Convert to Array and Calculate Percentages
  const results = Object.keys(categoryTotals).map((catName) => {
    const total = categoryTotals[catName];
    return {
      name: catName,
      total: total,
      percentage: (total / grandTotal) * 100,
      color: CATEGORY_COLORS[catName] || CATEGORY_COLORS['Other'],
    };
  });

  // 4. Sort by highest spending first
  return results.sort((a, b) => b.total - a.total);
};

// 1. Logic to calculate a single round up
export const calculateRoundUp = (amount: number): number => {
    // Convert to cents to avoid floating point errors 
    const amountInCents = Math.round(amount * 100);

    // Find next whole dollar cieling
    const ceilingInCents = Math.ceil(amountInCents / 100) * 100;

    // If it's already a whole dollar (e.g. 5.00) round up is 0
    if (amountInCents === ceilingInCents) return 0;

    // Return the difference in dollars
    return (ceilingInCents - amountInCents) / 100;
}

// 2. Logic to reduce the entire list into a total balance 
export const calculateTotalSavings = (transaction: { amount: number }[]): number => {
    return transaction.reduce((acc, transaction) => {
        // For each transaction, calculate the spare change
        const spareChange = calculateRoundUp(transaction.amount);

        // Add it to the accumulator 
        return acc + spareChange;
    }, 0);
};