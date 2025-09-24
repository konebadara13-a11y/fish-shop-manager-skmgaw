
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product, Sale, Expense, Customer, InventoryTransaction } from '../types';

const STORAGE_KEYS = {
  PRODUCTS: 'products',
  SALES: 'sales',
  EXPENSES: 'expenses',
  CUSTOMERS: 'customers',
  INVENTORY_TRANSACTIONS: 'inventory_transactions',
};

// Generic storage functions
const saveData = async <T>(key: string, data: T[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.log(`Error saving ${key}:`, error);
    throw error;
  }
};

const loadData = async <T>(key: string): Promise<T[]> => {
  try {
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.log(`Error loading ${key}:`, error);
    return [];
  }
};

// Product storage functions
export const saveProducts = async (products: Product[]): Promise<void> => {
  await saveData(STORAGE_KEYS.PRODUCTS, products);
};

export const loadProducts = async (): Promise<Product[]> => {
  const products = await loadData<Product>(STORAGE_KEYS.PRODUCTS);
  return products.map(product => ({
    ...product,
    createdAt: new Date(product.createdAt),
    updatedAt: new Date(product.updatedAt),
  }));
};

// Sales storage functions
export const saveSales = async (sales: Sale[]): Promise<void> => {
  await saveData(STORAGE_KEYS.SALES, sales);
};

export const loadSales = async (): Promise<Sale[]> => {
  const sales = await loadData<Sale>(STORAGE_KEYS.SALES);
  return sales.map(sale => ({
    ...sale,
    date: new Date(sale.date),
  }));
};

// Expenses storage functions
export const saveExpenses = async (expenses: Expense[]): Promise<void> => {
  await saveData(STORAGE_KEYS.EXPENSES, expenses);
};

export const loadExpenses = async (): Promise<Expense[]> => {
  const expenses = await loadData<Expense>(STORAGE_KEYS.EXPENSES);
  return expenses.map(expense => ({
    ...expense,
    date: new Date(expense.date),
  }));
};

// Customer storage functions
export const saveCustomers = async (customers: Customer[]): Promise<void> => {
  await saveData(STORAGE_KEYS.CUSTOMERS, customers);
};

export const loadCustomers = async (): Promise<Customer[]> => {
  const customers = await loadData<Customer>(STORAGE_KEYS.CUSTOMERS);
  return customers.map(customer => ({
    ...customer,
    createdAt: new Date(customer.createdAt),
    lastPurchaseDate: customer.lastPurchaseDate ? new Date(customer.lastPurchaseDate) : undefined,
  }));
};

// Inventory transactions storage functions
export const saveInventoryTransactions = async (transactions: InventoryTransaction[]): Promise<void> => {
  await saveData(STORAGE_KEYS.INVENTORY_TRANSACTIONS, transactions);
};

export const loadInventoryTransactions = async (): Promise<InventoryTransaction[]> => {
  const transactions = await loadData<InventoryTransaction>(STORAGE_KEYS.INVENTORY_TRANSACTIONS);
  return transactions.map(transaction => ({
    ...transaction,
    date: new Date(transaction.date),
  }));
};

// Clear all data (for testing/reset purposes)
export const clearAllData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
  } catch (error) {
    console.log('Error clearing data:', error);
    throw error;
  }
};
