# Portolio Pulse 📈

A high perfomance dashboard built with **React Native (Expo)** and **Typescript**, focused on a financial data integrity and mobile first architecture. 

**Logic Used**
**1. Integer Math:** All monetary values are processed as integers (cents) to guarantee precision. 
**2. Round Up Logic:** A custom engine calculates the "spare change" from transactions to simulate automated savings. 

**📱 Features**
* **Dynamic Dashboard:** Real time calculation of total "Date Fund" savings.
* **Goal Tracking:** Visual progress bar that clamps values to 100% to prevent UI overflows
* **Empty State:** UX friendly "Zero Data" handling to guide new users.
* **Dark Mode Native:** Styled for modern mobile aesthetics. 


## 💡 Key Technical Decisions

### 1. Type Safety via Interfaces
I utilized TypeScript interfaces to enforce a strict contract between parent and child components. This prevents runtime crashes by catching data type mismatches at compile time which is critical for a banking application where data reliability is important.

### 2. Data Transformation & Analytics
I implemented a custom aggregation engine (`utils/financeUtils.ts`) that transforms raw transaction streams into meaningful insights. 
* **Categorization:** The app reduces the transaction array into category buckets (Food, Transport, etc.).
* **Sorting:** It automatically ranks spending habits from highest to lowest to give users immediate value.

### 3. Zero Dependency Visualization
Instead of importing a heavy charting library, I engineered the **Spending Breakdown Bar Chart** from scratch using React Native primitives (`View` and Flexbox).
* **Why?** This ensures 60fps performance and allows for good control over the "Dark Mode" aesthetic without fighting default library styles.

### 4. Memory Management
Instead of using a standard `ScrollView`, which renders all data at once, I implemented a `FlatList`. This uses **virtualization** to recycle view components as the user scrolls, ensuring the app maintains 60fps even with thousands of transactions.

### 5. The "Round-Up" Algorithm
Located in `utils/financeUtils.ts`, the core logic adheres to pure function principles:
```typescript
// Example of the integer-math approach used
const calculateRoundUp = (amount: number): number => {
  const amountInCents = Math.round(amount * 100);
  const ceilingInCents = Math.ceil(amountInCents / 100) * 100;
  return (ceilingInCents - amountInCents) / 100;
};

