
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { commonStyles, colors } from '../styles/commonStyles';
import { useLanguage } from '../contexts/LanguageContext';
import { useData } from '../contexts/DataContext';
import Icon from '../components/Icon';
import SimpleBottomSheet from '../components/BottomSheet';
import LanguageSelector from '../components/LanguageSelector';

export default function Dashboard() {
  const { t } = useLanguage();
  const { getDashboardStats, loading, refreshData } = useData();
  const [refreshing, setRefreshing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const stats = getDashboardStats();

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const navigationItems = [
    { key: 'products', title: t('products'), icon: 'fish-outline', route: '/products' },
    { key: 'inventory', title: t('inventory'), icon: 'cube-outline', route: '/inventory' },
    { key: 'sales', title: t('sales'), icon: 'card-outline', route: '/sales' },
    { key: 'customers', title: t('customers'), icon: 'people-outline', route: '/customers' },
    { key: 'reports', title: t('reports'), icon: 'bar-chart-outline', route: '/reports' },
  ];

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
        <Text style={[commonStyles.title, { fontSize: 20 }]}>
          🐟 Fish Shop Manager
        </Text>
        <TouchableOpacity
          onPress={() => setShowSettings(true)}
          style={{
            padding: 8,
            borderRadius: 8,
            backgroundColor: colors.backgroundAlt,
          }}
        >
          <Icon name="settings-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={commonStyles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Stats Cards */}
        <View style={commonStyles.section}>
          <Text style={commonStyles.subtitle}>{t('dashboard')}</Text>
          
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            <View style={[commonStyles.card, { width: '48%', marginBottom: 12 }]}>
              <Text style={[commonStyles.textSecondary, { fontSize: 12 }]}>
                {t('todaysSales')}
              </Text>
              <Text style={[commonStyles.title, { fontSize: 18, color: colors.primary }]}>
                {formatCurrency(stats.todaysSales)}
              </Text>
            </View>

            <View style={[commonStyles.card, { width: '48%', marginBottom: 12 }]}>
              <Text style={[commonStyles.textSecondary, { fontSize: 12 }]}>
                {t('netProfit')}
              </Text>
              <Text style={[commonStyles.title, { 
                fontSize: 18, 
                color: stats.netProfit >= 0 ? colors.success : colors.error 
              }]}>
                {formatCurrency(stats.netProfit)}
              </Text>
            </View>

            <View style={[commonStyles.card, { width: '48%' }]}>
              <Text style={[commonStyles.textSecondary, { fontSize: 12 }]}>
                {t('lowStock')}
              </Text>
              <Text style={[commonStyles.title, { fontSize: 18, color: colors.warning }]}>
                {stats.lowStockProducts.length}
              </Text>
            </View>

            <View style={[commonStyles.card, { width: '48%' }]}>
              <Text style={[commonStyles.textSecondary, { fontSize: 12 }]}>
                {t('outOfStock')}
              </Text>
              <Text style={[commonStyles.title, { fontSize: 18, color: colors.error }]}>
                {stats.outOfStockProducts.length}
              </Text>
            </View>
          </View>
        </View>

        {/* Stock Alerts */}
        {(stats.lowStockProducts.length > 0 || stats.outOfStockProducts.length > 0) && (
          <View style={commonStyles.section}>
            <Text style={commonStyles.subtitle}>{t('stockAlerts')}</Text>
            
            {stats.outOfStockProducts.map(product => (
              <View key={product.id} style={[commonStyles.card, { borderLeftWidth: 4, borderLeftColor: colors.error }]}>
                <View style={commonStyles.row}>
                  <View style={{ flex: 1 }}>
                    <Text style={commonStyles.text}>{product.name}</Text>
                    <Text style={[commonStyles.textSecondary, { color: colors.error }]}>
                      {t('outOfStock')}
                    </Text>
                  </View>
                  <Icon name="alert-circle-outline" size={24} color={colors.error} />
                </View>
              </View>
            ))}

            {stats.lowStockProducts.map(product => (
              <View key={product.id} style={[commonStyles.card, { borderLeftWidth: 4, borderLeftColor: colors.warning }]}>
                <View style={commonStyles.row}>
                  <View style={{ flex: 1 }}>
                    <Text style={commonStyles.text}>{product.name}</Text>
                    <Text style={[commonStyles.textSecondary, { color: colors.warning }]}>
                      {t('lowStock')}: {product.stock} left
                    </Text>
                  </View>
                  <Icon name="warning-outline" size={24} color={colors.warning} />
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Top Selling Products */}
        {stats.topSellingProducts.length > 0 && (
          <View style={commonStyles.section}>
            <Text style={commonStyles.subtitle}>{t('topSellingProducts')}</Text>
            
            {stats.topSellingProducts.map((item, index) => (
              <View key={item.product.id} style={commonStyles.card}>
                <View style={commonStyles.row}>
                  <View style={{ flex: 1 }}>
                    <Text style={commonStyles.text}>{item.product.name}</Text>
                    <Text style={commonStyles.textSecondary}>
                      Sold: {item.quantity} units
                    </Text>
                  </View>
                  <View style={[commonStyles.badge, { backgroundColor: colors.primary }]}>
                    <Text style={commonStyles.badgeText}>#{index + 1}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Quick Actions */}
        <View style={commonStyles.section}>
          <Text style={commonStyles.subtitle}>Quick Actions</Text>
          
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {navigationItems.map(item => (
              <TouchableOpacity
                key={item.key}
                style={[commonStyles.card, { 
                  width: '48%', 
                  marginBottom: 12,
                  alignItems: 'center',
                  paddingVertical: 20,
                }]}
                onPress={() => router.push(item.route as any)}
              >
                <Icon name={item.icon as any} size={32} color={colors.primary} />
                <Text style={[commonStyles.text, { marginTop: 8, textAlign: 'center' }]}>
                  {item.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Settings Bottom Sheet */}
      <SimpleBottomSheet
        isVisible={showSettings}
        onClose={() => setShowSettings(false)}
      >
        <View style={{ padding: 16 }}>
          <Text style={[commonStyles.title, { marginBottom: 24 }]}>
            {t('settings')}
          </Text>
          
          <LanguageSelector />
          
          <TouchableOpacity
            style={[commonStyles.card, { marginTop: 24 }]}
            onPress={() => {
              setShowSettings(false);
              router.push('/reports');
            }}
          >
            <View style={commonStyles.row}>
              <Icon name="bar-chart-outline" size={24} color={colors.primary} />
              <Text style={[commonStyles.text, { marginLeft: 12 }]}>
                {t('reports')}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </SimpleBottomSheet>
    </SafeAreaView>
  );
}
