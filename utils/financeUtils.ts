/**
 * This calculates the spare change (round-up) from a transaction amount.
 * Example: $3.45 -> $0.55 round-up to reach $4.00
 */

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

        // Add it to our accumulator 
        return acc + spareChange;
    }, 0);
};