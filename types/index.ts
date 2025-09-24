
export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  stock: number;
  description?: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ProductCategory = 'freshFish' | 'frozenFish' | 'drinks' | 'spices' | 'otherGroceries';

export interface InventoryTransaction {
  id: string;
  productId: string;
  type: 'in' | 'out';
  quantity: number;
  date: Date;
  supplier?: string;
  reason?: string;
  notes?: string;
}

export interface Sale {
  id: string;
  items: SaleItem[];
  total: number;
  paymentMethod: PaymentMethod;
  date: Date;
  customerId?: string;
  notes?: string;
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

export type PaymentMethod = 'cash' | 'mobileMoney' | 'bank';

export interface Expense {
  id: string;
  category: ExpenseCategory;
  amount: number;
  description: string;
  date: Date;
  notes?: string;
}

export type ExpenseCategory = 'transport' | 'ice' | 'rent' | 'utilities' | 'other';

export interface Customer {
  id: string;
  name: string;
  phoneNumber?: string;
  email?: string;
  address?: string;
  totalPurchases: number;
  lastPurchaseDate?: Date;
  createdAt: Date;
}

export interface DashboardStats {
  todaysSales: number;
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  lowStockProducts: Product[];
  outOfStockProducts: Product[];
  topSellingProducts: { product: Product; quantity: number }[];
}

export interface ReportData {
  period: 'daily' | 'weekly' | 'monthly';
  startDate: Date;
  endDate: Date;
  sales: Sale[];
  expenses: Expense[];
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  topProducts: { product: Product; quantity: number; revenue: number }[];
}
