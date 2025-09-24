
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Language = 'en' | 'fr';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  en: {
    // Navigation
    dashboard: 'Dashboard',
    products: 'Products',
    inventory: 'Inventory',
    sales: 'Sales',
    customers: 'Customers',
    reports: 'Reports',
    settings: 'Settings',
    
    // Dashboard
    todaysSales: "Today's Sales",
    topSellingProducts: 'Top Selling Products',
    stockAlerts: 'Stock Alerts',
    totalRevenue: 'Total Revenue',
    totalExpenses: 'Total Expenses',
    netProfit: 'Net Profit',
    lowStock: 'Low Stock',
    outOfStock: 'Out of Stock',
    
    // Products
    addProduct: 'Add Product',
    editProduct: 'Edit Product',
    deleteProduct: 'Delete Product',
    productName: 'Product Name',
    category: 'Category',
    price: 'Price',
    stock: 'Stock',
    description: 'Description',
    freshFish: 'Fresh Fish',
    frozenFish: 'Frozen Fish',
    drinks: 'Drinks',
    spices: 'Spices',
    otherGroceries: 'Other Groceries',
    
    // Inventory
    stockIn: 'Stock In',
    stockOut: 'Stock Out',
    quantity: 'Quantity',
    date: 'Date',
    supplier: 'Supplier',
    reason: 'Reason',
    
    // Sales
    recordSale: 'Record Sale',
    paymentMethod: 'Payment Method',
    cash: 'Cash',
    mobileMoney: 'Mobile Money',
    bank: 'Bank',
    total: 'Total',
    
    // Expenses
    recordExpense: 'Record Expense',
    transport: 'Transport',
    ice: 'Ice',
    rent: 'Rent',
    utilities: 'Utilities',
    other: 'Other',
    
    // Customers
    addCustomer: 'Add Customer',
    customerName: 'Customer Name',
    phoneNumber: 'Phone Number',
    email: 'Email',
    address: 'Address',
    
    // Reports
    dailyReport: 'Daily Report',
    weeklyReport: 'Weekly Report',
    monthlyReport: 'Monthly Report',
    exportToPDF: 'Export to PDF',
    exportToExcel: 'Export to Excel',
    
    // Common
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    search: 'Search',
    filter: 'Filter',
    sort: 'Sort',
    confirm: 'Confirm',
    yes: 'Yes',
    no: 'No',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    warning: 'Warning',
    
    // Language
    language: 'Language',
    english: 'English',
    french: 'French',
    selectLanguage: 'Select Language',
  },
  fr: {
    // Navigation
    dashboard: 'Tableau de bord',
    products: 'Produits',
    inventory: 'Inventaire',
    sales: 'Ventes',
    customers: 'Clients',
    reports: 'Rapports',
    settings: 'Paramètres',
    
    // Dashboard
    todaysSales: 'Ventes du jour',
    topSellingProducts: 'Produits les plus vendus',
    stockAlerts: 'Alertes de stock',
    totalRevenue: 'Revenus totaux',
    totalExpenses: 'Dépenses totales',
    netProfit: 'Bénéfice net',
    lowStock: 'Stock faible',
    outOfStock: 'Rupture de stock',
    
    // Products
    addProduct: 'Ajouter un produit',
    editProduct: 'Modifier le produit',
    deleteProduct: 'Supprimer le produit',
    productName: 'Nom du produit',
    category: 'Catégorie',
    price: 'Prix',
    stock: 'Stock',
    description: 'Description',
    freshFish: 'Poissons frais',
    frozenFish: 'Poissons congelés',
    drinks: 'Boissons',
    spices: 'Épices',
    otherGroceries: 'Autres produits',
    
    // Inventory
    stockIn: 'Entrées',
    stockOut: 'Sorties',
    quantity: 'Quantité',
    date: 'Date',
    supplier: 'Fournisseur',
    reason: 'Raison',
    
    // Sales
    recordSale: 'Enregistrer une vente',
    paymentMethod: 'Méthode de paiement',
    cash: 'Espèces',
    mobileMoney: 'Mobile Money',
    bank: 'Banque',
    total: 'Total',
    
    // Expenses
    recordExpense: 'Enregistrer une dépense',
    transport: 'Transport',
    ice: 'Glace',
    rent: 'Loyer',
    utilities: 'Services publics',
    other: 'Autre',
    
    // Customers
    addCustomer: 'Ajouter un client',
    customerName: 'Nom du client',
    phoneNumber: 'Numéro de téléphone',
    email: 'Email',
    address: 'Adresse',
    
    // Reports
    dailyReport: 'Rapport quotidien',
    weeklyReport: 'Rapport hebdomadaire',
    monthlyReport: 'Rapport mensuel',
    exportToPDF: 'Exporter en PDF',
    exportToExcel: 'Exporter en Excel',
    
    // Common
    save: 'Enregistrer',
    cancel: 'Annuler',
    delete: 'Supprimer',
    edit: 'Modifier',
    add: 'Ajouter',
    search: 'Rechercher',
    filter: 'Filtrer',
    sort: 'Trier',
    confirm: 'Confirmer',
    yes: 'Oui',
    no: 'Non',
    loading: 'Chargement...',
    error: 'Erreur',
    success: 'Succès',
    warning: 'Avertissement',
    
    // Language
    language: 'Langue',
    english: 'Anglais',
    french: 'Français',
    selectLanguage: 'Sélectionner la langue',
  },
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('language');
      if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'fr')) {
        setLanguageState(savedLanguage as Language);
      }
    } catch (error) {
      console.log('Error loading language:', error);
    }
  };

  const setLanguage = async (lang: Language) => {
    try {
      await AsyncStorage.setItem('language', lang);
      setLanguageState(lang);
    } catch (error) {
      console.log('Error saving language:', error);
    }
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
