
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { commonStyles, colors } from '../styles/commonStyles';
import { useLanguage } from '../contexts/LanguageContext';
import { useData } from '../contexts/DataContext';
import Icon from '../components/Icon';

const screenWidth = Dimensions.get('window').width;

export default function ReportsScreen() {
  const { t } = useLanguage();
  const { sales, expenses, products } = useData();
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  const periods = [
    { key: 'daily' as const, label: t('dailyReport') },
    { key: 'weekly' as const, label: t('weeklyReport') },
    { key: 'monthly' as const, label: t('monthlyReport') },
  ];

  const getDateRange = (period: 'daily' | 'weekly' | 'monthly') => {
    const now = new Date();
    const startDate = new Date();
    
    switch (period) {
      case 'daily':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'weekly':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'monthly':
        startDate.setMonth(now.getMonth() - 1);
        break;
    }
    
    return { startDate, endDate: now };
  };

  const getFilteredData = () => {
    const { startDate, endDate } = getDateRange(selectedPeriod);
    
    const filteredSales = sales.filter(sale => {
      const saleDate = new Date(sale.date);
      return saleDate >= startDate && saleDate <= endDate;
    });
    
    const filteredExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= startDate && expenseDate <= endDate;
    });
    
    return { filteredSales, filteredExpenses };
  };

  const { filteredSales, filteredExpenses } = getFilteredData();
  
  const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const netProfit = totalRevenue - totalExpenses;

  // Sales by payment method
  const paymentMethodData = [
    {
      name: t('cash'),
      population: filteredSales.filter(s => s.paymentMethod === 'cash').reduce((sum, s) => sum + s.total, 0),
      color: colors.primary,
      legendFontColor: colors.text,
      legendFontSize: 12,
    },
    {
      name: t('mobileMoney'),
      population: filteredSales.filter(s => s.paymentMethod === 'mobileMoney').reduce((sum, s) => sum + s.total, 0),
      color: colors.success,
      legendFontColor: colors.text,
      legendFontSize: 12,
    },
    {
      name: t('bank'),
      population: filteredSales.filter(s => s.paymentMethod === 'bank').reduce((sum, s) => sum + s.total, 0),
      color: colors.warning,
      legendFontColor: colors.text,
      legendFontSize: 12,
    },
  ].filter(item => item.population > 0);

  // Top selling products
  const productSales = new Map<string, { quantity: number; revenue: number }>();
  filteredSales.forEach(sale => {
    sale.items.forEach(item => {
      const current = productSales.get(item.productId) || { quantity: 0, revenue: 0 };
      productSales.set(item.productId, {
        quantity: current.quantity + item.quantity,
        revenue: current.revenue + item.total,
      });
    });
  });

  const topProducts = Array.from(productSales.entries())
    .map(([productId, stats]) => ({
      product: products.find(p => p.id === productId)!,
      ...stats,
    }))
    .filter(item => item.product)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Daily sales trend (for line chart)
  const getDailySalesData = () => {
    const days = [];
    const salesData = [];
    const expenseData = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      
      const daySales = sales.filter(sale => {
        const saleDate = new Date(sale.date);
        return saleDate >= date && saleDate < nextDay;
      }).reduce((sum, sale) => sum + sale.total, 0);
      
      const dayExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate >= date && expenseDate < nextDay;
      }).reduce((sum, expense) => sum + expense.amount, 0);
      
      days.push(date.toLocaleDateString([], { weekday: 'short' }));
      salesData.push(daySales);
      expenseData.push(dayExpenses);
    }
    
    return { days, salesData, expenseData };
  };

  const { days, salesData, expenseData } = getDailySalesData();

  const chartConfig = {
    backgroundColor: colors.background,
    backgroundGradientFrom: colors.background,
    backgroundGradientTo: colors.background,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(33, 33, 33, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: colors.primary,
    },
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ marginRight: 16 }}
          >
            <Icon name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[commonStyles.title, { fontSize: 20 }]}>
            {t('reports')}
          </Text>
        </View>
      </View>

      <ScrollView style={commonStyles.content}>
        {/* Period Selection */}
        <View style={{ marginBottom: 16 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {periods.map(period => (
              <TouchableOpacity
                key={period.key}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  marginRight: 8,
                  borderRadius: 20,
                  backgroundColor: selectedPeriod === period.key ? colors.primary : colors.backgroundAlt,
                }}
                onPress={() => setSelectedPeriod(period.key)}
              >
                <Text style={{
                  color: selectedPeriod === period.key ? colors.background : colors.text,
                  fontSize: 14,
                  fontWeight: '500',
                }}>
                  {period.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Summary Cards */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 16 }}>
          <View style={[commonStyles.card, { width: '48%', marginBottom: 12 }]}>
            <Text style={[commonStyles.textSecondary, { fontSize: 12 }]}>
              {t('totalRevenue')}
            </Text>
            <Text style={[commonStyles.title, { fontSize: 18, color: colors.primary }]}>
              {formatCurrency(totalRevenue)}
            </Text>
          </View>

          <View style={[commonStyles.card, { width: '48%', marginBottom: 12 }]}>
            <Text style={[commonStyles.textSecondary, { fontSize: 12 }]}>
              {t('totalExpenses')}
            </Text>
            <Text style={[commonStyles.title, { fontSize: 18, color: colors.error }]}>
              {formatCurrency(totalExpenses)}
            </Text>
          </View>

          <View style={[commonStyles.card, { width: '48%' }]}>
            <Text style={[commonStyles.textSecondary, { fontSize: 12 }]}>
              {t('netProfit')}
            </Text>
            <Text style={[commonStyles.title, { 
              fontSize: 18, 
              color: netProfit >= 0 ? colors.success : colors.error 
            }]}>
              {formatCurrency(netProfit)}
            </Text>
          </View>

          <View style={[commonStyles.card, { width: '48%' }]}>
            <Text style={[commonStyles.textSecondary, { fontSize: 12 }]}>
              Transactions
            </Text>
            <Text style={[commonStyles.title, { fontSize: 18 }]}>
              {filteredSales.length}
            </Text>
          </View>
        </View>

        {/* Sales Trend Chart */}
        {salesData.some(value => value > 0) && (
          <View style={[commonStyles.card, { marginBottom: 16 }]}>
            <Text style={[commonStyles.subtitle, { marginBottom: 16 }]}>
              Sales Trend (Last 7 Days)
            </Text>
            <LineChart
              data={{
                labels: days,
                datasets: [
                  {
                    data: salesData,
                    color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
                    strokeWidth: 2,
                  },
                ],
              }}
              width={screenWidth - 64}
              height={200}
              chartConfig={chartConfig}
              bezier
              style={{
                marginVertical: 8,
                borderRadius: 16,
              }}
            />
          </View>
        )}

        {/* Payment Methods Chart */}
        {paymentMethodData.length > 0 && (
          <View style={[commonStyles.card, { marginBottom: 16 }]}>
            <Text style={[commonStyles.subtitle, { marginBottom: 16 }]}>
              Sales by Payment Method
            </Text>
            <PieChart
              data={paymentMethodData}
              width={screenWidth - 64}
              height={200}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              center={[10, 0]}
            />
          </View>
        )}

        {/* Top Selling Products */}
        {topProducts.length > 0 && (
          <View style={[commonStyles.card, { marginBottom: 16 }]}>
            <Text style={[commonStyles.subtitle, { marginBottom: 16 }]}>
              {t('topSellingProducts')}
            </Text>
            
            {topProducts.map((item, index) => (
              <View key={item.product.id} style={[
                commonStyles.row, 
                { marginBottom: 12, paddingBottom: 12 },
                index < topProducts.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }
              ]}>
                <View style={{ flex: 1 }}>
                  <Text style={commonStyles.text}>{item.product.name}</Text>
                  <Text style={commonStyles.textSecondary}>
                    Sold: {item.quantity} units
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[commonStyles.text, { fontWeight: '600', color: colors.primary }]}>
                    {formatCurrency(item.revenue)}
                  </Text>
                  <View style={[commonStyles.badge, { backgroundColor: colors.primary }]}>
                    <Text style={commonStyles.badgeText}>#{index + 1}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Recent Transactions */}
        <View style={[commonStyles.card, { marginBottom: 16 }]}>
          <Text style={[commonStyles.subtitle, { marginBottom: 16 }]}>
            Recent Sales
          </Text>
          
          {filteredSales.slice(0, 5).map(sale => (
            <View key={sale.id} style={[commonStyles.row, { marginBottom: 8 }]}>
              <View style={{ flex: 1 }}>
                <Text style={commonStyles.text}>
                  {formatCurrency(sale.total)}
                </Text>
                <Text style={commonStyles.textSecondary}>
                  {new Date(sale.date).toLocaleDateString()} • {sale.items.length} items
                </Text>
              </View>
              <Icon 
                name={
                  sale.paymentMethod === 'cash' ? 'cash-outline' :
                  sale.paymentMethod === 'mobileMoney' ? 'phone-portrait-outline' :
                  'card-outline'
                } 
                size={20} 
                color={colors.primary} 
              />
            </View>
          ))}
        </View>

        {/* Export Options */}
        <View style={[commonStyles.card, { marginBottom: 32 }]}>
          <Text style={[commonStyles.subtitle, { marginBottom: 16 }]}>
            Export Data
          </Text>
          
          <TouchableOpacity
            style={{
              backgroundColor: colors.backgroundAlt,
              padding: 12,
              borderRadius: 8,
              marginBottom: 8,
            }}
            onPress={() => {
              // TODO: Implement PDF export
              console.log('Export to PDF');
            }}
          >
            <View style={commonStyles.row}>
              <Icon name="document-text-outline" size={20} color={colors.primary} />
              <Text style={[commonStyles.text, { marginLeft: 12 }]}>
                {t('exportToPDF')}
              </Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={{
              backgroundColor: colors.backgroundAlt,
              padding: 12,
              borderRadius: 8,
            }}
            onPress={() => {
              // TODO: Implement Excel export
              console.log('Export to Excel');
            }}
          >
            <View style={commonStyles.row}>
              <Icon name="grid-outline" size={20} color={colors.success} />
              <Text style={[commonStyles.text, { marginLeft: 12 }]}>
                {t('exportToExcel')}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
