
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, Sale, Expense, Customer, InventoryTransaction, DashboardStats } from '../types';
import {
  loadProducts, saveProducts,
  loadSales, saveSales,
  loadExpenses, saveExpenses,
  loadCustomers, saveCustomers,
  loadInventoryTransactions, saveInventoryTransactions
} from '../utils/storage';

interface DataContextType {
  // Data
  products: Product[];
  sales: Sale[];
  expenses: Expense[];
  customers: Customer[];
  inventoryTransactions: InventoryTransaction[];
  
  // Loading states
  loading: boolean;
  
  // Product functions
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  
  // Sale functions
  addSale: (sale: Omit<Sale, 'id'>) => Promise<void>;
  
  // Expense functions
  addExpense: (expense: Omit<Expense, 'id'>) => Promise<void>;
  
  // Customer functions
  addCustomer: (customer: Omit<Customer, 'id' | 'totalPurchases' | 'createdAt'>) => Promise<void>;
  updateCustomer: (id: string, updates: Partial<Customer>) => Promise<void>;
  
  // Inventory functions
  addInventoryTransaction: (transaction: Omit<InventoryTransaction, 'id'>) => Promise<void>;
  
  // Dashboard functions
  getDashboardStats: () => DashboardStats;
  
  // Utility functions
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [inventoryTransactions, setInventoryTransactions] = useState<InventoryTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [
        loadedProducts,
        loadedSales,
        loadedExpenses,
        loadedCustomers,
        loadedTransactions
      ] = await Promise.all([
        loadProducts(),
        loadSales(),
        loadExpenses(),
        loadCustomers(),
        loadInventoryTransactions()
      ]);

      setProducts(loadedProducts);
      setSales(loadedSales);
      setExpenses(loadedExpenses);
      setCustomers(loadedCustomers);
      setInventoryTransactions(loadedTransactions);
    } catch (error) {
      console.log('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    await loadAllData();
  };

  // Product functions
  const addProduct = async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProduct: Product = {
      ...productData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const updatedProducts = [...products, newProduct];
    setProducts(updatedProducts);
    await saveProducts(updatedProducts);
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    const updatedProducts = products.map(product =>
      product.id === id
        ? { ...product, ...updates, updatedAt: new Date() }
        : product
    );
    setProducts(updatedProducts);
    await saveProducts(updatedProducts);
  };

  const deleteProduct = async (id: string) => {
    const updatedProducts = products.filter(product => product.id !== id);
    setProducts(updatedProducts);
    await saveProducts(updatedProducts);
  };

  // Sale functions
  const addSale = async (saleData: Omit<Sale, 'id'>) => {
    const newSale: Sale = {
      ...saleData,
      id: Date.now().toString(),
    };
    
    const updatedSales = [...sales, newSale];
    setSales(updatedSales);
    await saveSales(updatedSales);

    // Update product stock
    for (const item of saleData.items) {
      await updateProduct(item.productId, {
        stock: products.find(p => p.id === item.productId)!.stock - item.quantity
      });
    }

    // Update customer total purchases if customer exists
    if (saleData.customerId) {
      const customer = customers.find(c => c.id === saleData.customerId);
      if (customer) {
        await updateCustomer(saleData.customerId, {
          totalPurchases: customer.totalPurchases + saleData.total,
          lastPurchaseDate: saleData.date,
        });
      }
    }
  };

  // Expense functions
  const addExpense = async (expenseData: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...expenseData,
      id: Date.now().toString(),
    };
    
    const updatedExpenses = [...expenses, newExpense];
    setExpenses(updatedExpenses);
    await saveExpenses(updatedExpenses);
  };

  // Customer functions
  const addCustomer = async (customerData: Omit<Customer, 'id' | 'totalPurchases' | 'createdAt'>) => {
    const newCustomer: Customer = {
      ...customerData,
      id: Date.now().toString(),
      totalPurchases: 0,
      createdAt: new Date(),
    };
    
    const updatedCustomers = [...customers, newCustomer];
    setCustomers(updatedCustomers);
    await saveCustomers(updatedCustomers);
  };

  const updateCustomer = async (id: string, updates: Partial<Customer>) => {
    const updatedCustomers = customers.map(customer =>
      customer.id === id ? { ...customer, ...updates } : customer
    );
    setCustomers(updatedCustomers);
    await saveCustomers(updatedCustomers);
  };

  // Inventory functions
  const addInventoryTransaction = async (transactionData: Omit<InventoryTransaction, 'id'>) => {
    const newTransaction: InventoryTransaction = {
      ...transactionData,
      id: Date.now().toString(),
    };
    
    const updatedTransactions = [...inventoryTransactions, newTransaction];
    setInventoryTransactions(updatedTransactions);
    await saveInventoryTransactions(updatedTransactions);

    // Update product stock
    const product = products.find(p => p.id === transactionData.productId);
    if (product) {
      const stockChange = transactionData.type === 'in' ? transactionData.quantity : -transactionData.quantity;
      await updateProduct(transactionData.productId, {
        stock: product.stock + stockChange
      });
    }
  };

  // Dashboard functions
  const getDashboardStats = (): DashboardStats => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todaysSales = sales
      .filter(sale => {
        const saleDate = new Date(sale.date);
        saleDate.setHours(0, 0, 0, 0);
        return saleDate.getTime() === today.getTime();
      })
      .reduce((sum, sale) => sum + sale.total, 0);

    const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const netProfit = totalRevenue - totalExpenses;

    const lowStockProducts = products.filter(product => product.stock > 0 && product.stock <= 5);
    const outOfStockProducts = products.filter(product => product.stock === 0);

    // Calculate top selling products
    const productSales = new Map<string, number>();
    sales.forEach(sale => {
      sale.items.forEach(item => {
        const current = productSales.get(item.productId) || 0;
        productSales.set(item.productId, current + item.quantity);
      });
    });

    const topSellingProducts = Array.from(productSales.entries())
      .map(([productId, quantity]) => ({
        product: products.find(p => p.id === productId)!,
        quantity
      }))
      .filter(item => item.product)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    return {
      todaysSales,
      totalRevenue,
      totalExpenses,
      netProfit,
      lowStockProducts,
      outOfStockProducts,
      topSellingProducts,
    };
  };

  return (
    <DataContext.Provider value={{
      products,
      sales,
      expenses,
      customers,
      inventoryTransactions,
      loading,
      addProduct,
      updateProduct,
      deleteProduct,
      addSale,
      addExpense,
      addCustomer,
      updateCustomer,
      addInventoryTransaction,
      getDashboardStats,
      refreshData,
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
