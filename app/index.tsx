
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { commonStyles, colors } from '../styles/commonStyles';
import { useLanguage } from '../contexts/LanguageContext';
import { useData } from '../contexts/DataContext';
import Icon from '../components/Icon';
import LanguageSelector from '../components/LanguageSelector';
import SimpleBottomSheet from '../components/BottomSheet';

export default function Dashboard() {
  const { t } = useLanguage();
  const { 
    products, 
    sales, 
    customers, 
    inventoryTransactions, 
    loading, 
    getDashboardStats, 
    refreshData 
  } = useData();
  const [refreshing, setRefreshing] = useState(false);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);

  const stats = getDashboardStats();

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshData();
    } catch (error) {
      console.log('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const menuItems = [
    {
      title: t('products'),
      icon: 'fish-outline',
      route: '/products',
      count: products.length,
      color: colors.primary,
    },
    {
      title: t('inventory'),
      icon: 'cube-outline',
      route: '/inventory',
      count: stats.lowStockProducts.length + stats.outOfStockProducts.length,
      color: colors.warning,
    },
    {
      title: t('sales'),
      icon: 'receipt-outline',
      route: '/sales',
      count: sales.filter(sale => {
        const today = new Date();
        const saleDate = new Date(sale.date);
        return saleDate.toDateString() === today.toDateString();
      }).length,
      color: colors.success,
    },
    {
      title: t('customers'),
      icon: 'people-outline',
      route: '/customers',
      count: customers.length,
      color: colors.accent,
    },
    {
      title: t('reports'),
      icon: 'bar-chart-outline',
      route: '/reports',
      count: 0,
      color: colors.secondary,
    },
  ];

  if (loading) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={[commonStyles.center, { flex: 1 }]}>
          <Text style={commonStyles.text}>{t('loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

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
        <Text style={[commonStyles.title, { fontSize: 24 }]}>
          Fish Shop Manager
        </Text>
        <TouchableOpacity
          onPress={() => setShowLanguageSelector(true)}
          style={{
            backgroundColor: colors.backgroundAlt,
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 8,
          }}
        >
          <Icon name="language-outline" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={commonStyles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Debug Info */}
        <View style={[commonStyles.card, { backgroundColor: colors.backgroundAlt, marginBottom: 16 }]}>
          <Text style={[commonStyles.subtitle, { marginBottom: 8 }]}>
            Debug Info
          </Text>
          <Text style={commonStyles.textSecondary}>
            Products: {products.length} | Sales: {sales.length} | Customers: {customers.length}
          </Text>
          <Text style={commonStyles.textSecondary}>
            Transactions: {inventoryTransactions.length}
          </Text>
        </View>

        {/* Today's Summary */}
        <View style={[commonStyles.card, { marginBottom: 16 }]}>
          <Text style={[commonStyles.subtitle, { marginBottom: 16 }]}>
            {t('todaysSales')}
          </Text>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ alignItems: 'center', flex: 1 }}>
              <Text style={[commonStyles.textSecondary, { fontSize: 12 }]}>
                {t('totalRevenue')}
              </Text>
              <Text style={[commonStyles.title, { fontSize: 20, color: colors.success }]}>
                {formatCurrency(stats.todaysSales)}
              </Text>
            </View>
            
            <View style={{ alignItems: 'center', flex: 1 }}>
              <Text style={[commonStyles.textSecondary, { fontSize: 12 }]}>
                Transactions
              </Text>
              <Text style={[commonStyles.title, { fontSize: 20 }]}>
                {sales.filter(sale => {
                  const today = new Date();
                  const saleDate = new Date(sale.date);
                  return saleDate.toDateString() === today.toDateString();
                }).length}
              </Text>
            </View>
            
            <View style={{ alignItems: 'center', flex: 1 }}>
              <Text style={[commonStyles.textSecondary, { fontSize: 12 }]}>
                {t('netProfit')}
              </Text>
              <Text style={[
                commonStyles.title, 
                { 
                  fontSize: 20, 
                  color: stats.netProfit >= 0 ? colors.success : colors.error 
                }
              ]}>
                {formatCurrency(stats.netProfit)}
              </Text>
            </View>
          </View>
        </View>

        {/* Stock Alerts */}
        {(stats.lowStockProducts.length > 0 || stats.outOfStockProducts.length > 0) && (
          <View style={[commonStyles.card, { marginBottom: 16 }]}>
            <Text style={[commonStyles.subtitle, { marginBottom: 12 }]}>
              {t('stockAlerts')}
            </Text>
            
            {stats.outOfStockProducts.map(product => (
              <View key={product.id} style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 8,
                borderLeftWidth: 4,
                borderLeftColor: colors.error,
                paddingLeft: 12,
                marginBottom: 8,
                backgroundColor: colors.error + '10',
                borderRadius: 8,
              }}>
                <Icon name="alert-circle-outline" size={20} color={colors.error} />
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={commonStyles.text}>{product.name}</Text>
                  <Text style={[commonStyles.textSecondary, { color: colors.error }]}>
                    {t('outOfStock')}
                  </Text>
                </View>
              </View>
            ))}

            {stats.lowStockProducts.map(product => (
              <View key={product.id} style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 8,
                borderLeftWidth: 4,
                borderLeftColor: colors.warning,
                paddingLeft: 12,
                marginBottom: 8,
                backgroundColor: colors.warning + '10',
                borderRadius: 8,
              }}>
                <Icon name="warning-outline" size={20} color={colors.warning} />
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={commonStyles.text}>{product.name}</Text>
                  <Text style={[commonStyles.textSecondary, { color: colors.warning }]}>
                    {t('lowStock')}: {product.stock} left
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Top Selling Products */}
        {stats.topSellingProducts.length > 0 && (
          <View style={[commonStyles.card, { marginBottom: 16 }]}>
            <Text style={[commonStyles.subtitle, { marginBottom: 12 }]}>
              {t('topSellingProducts')}
            </Text>
            
            {stats.topSellingProducts.map((item, index) => (
              <View key={item.product.id} style={[commonStyles.row, { marginBottom: 8 }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  <View style={{
                    backgroundColor: colors.primary,
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 12,
                  }}>
                    <Text style={{ color: colors.background, fontSize: 12, fontWeight: '600' }}>
                      {index + 1}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={commonStyles.text}>{item.product.name}</Text>
                    <Text style={commonStyles.textSecondary}>
                      {formatCurrency(item.product.price)} each
                    </Text>
                  </View>
                </View>
                <Text style={[commonStyles.text, { fontWeight: '600', color: colors.primary }]}>
                  {item.quantity} sold
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Menu Grid */}
        <View style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          marginBottom: 32,
        }}>
          {menuItems.map(item => (
            <TouchableOpacity
              key={item.title}
              style={[commonStyles.card, {
                width: '48%',
                marginBottom: 16,
                alignItems: 'center',
                paddingVertical: 24,
              }]}
              onPress={() => router.push(item.route)}
            >
              <View style={{
                backgroundColor: item.color + '20',
                width: 48,
                height: 48,
                borderRadius: 24,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 12,
              }}>
                <Icon name={item.icon as any} size={24} color={item.color} />
              </View>
              
              <Text style={[commonStyles.text, { fontWeight: '600', textAlign: 'center' }]}>
                {item.title}
              </Text>
              
              {item.count > 0 && (
                <View style={[commonStyles.badge, { marginTop: 8, backgroundColor: item.color }]}>
                  <Text style={commonStyles.badgeText}>
                    {item.count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Language Selector Bottom Sheet */}
      <SimpleBottomSheet
        isVisible={showLanguageSelector}
        onClose={() => setShowLanguageSelector(false)}
      >
        <View style={{ padding: 16 }}>
          <LanguageSelector />
        </View>
      </SimpleBottomSheet>
    </SafeAreaView>
  );
}
