
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { commonStyles, colors } from '../styles/commonStyles';
import { useLanguage } from '../contexts/LanguageContext';
import { useData } from '../contexts/DataContext';
import { Customer } from '../types';
import Icon from '../components/Icon';
import Button from '../components/Button';
import SimpleBottomSheet from '../components/BottomSheet';

export default function CustomersScreen() {
  const { t } = useLanguage();
  const { customers, sales, addCustomer, updateCustomer } = useData();
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    email: '',
    address: '',
  });

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (customer.phoneNumber && customer.phoneNumber.includes(searchQuery)) ||
    (customer.email && customer.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const resetForm = () => {
    setFormData({
      name: '',
      phoneNumber: '',
      email: '',
      address: '',
    });
    setEditingCustomer(null);
  };

  const handleAddCustomer = () => {
    resetForm();
    setShowAddCustomer(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setFormData({
      name: customer.name,
      phoneNumber: customer.phoneNumber || '',
      email: customer.email || '',
      address: customer.address || '',
    });
    setEditingCustomer(customer);
    setShowAddCustomer(true);
  };

  const handleSaveCustomer = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter customer name');
      return;
    }

    try {
      const customerData = {
        name: formData.name.trim(),
        phoneNumber: formData.phoneNumber.trim() || undefined,
        email: formData.email.trim() || undefined,
        address: formData.address.trim() || undefined,
      };

      if (editingCustomer) {
        await updateCustomer(editingCustomer.id, customerData);
      } else {
        await addCustomer(customerData);
      }

      setShowAddCustomer(false);
      resetForm();
    } catch (error) {
      Alert.alert('Error', 'Failed to save customer');
      console.log('Error saving customer:', error);
    }
  };

  const getCustomerStats = (customerId: string) => {
    const customerSales = sales.filter(sale => sale.customerId === customerId);
    const totalSpent = customerSales.reduce((sum, sale) => sum + sale.total, 0);
    const totalOrders = customerSales.length;
    const lastPurchase = customerSales.length > 0 
      ? new Date(Math.max(...customerSales.map(sale => new Date(sale.date).getTime())))
      : null;

    return { totalSpent, totalOrders, lastPurchase };
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
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
            {t('customers')}
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleAddCustomer}
          style={{
            backgroundColor: colors.primary,
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 8,
          }}
        >
          <Text style={{ color: colors.background, fontWeight: '600' }}>
            {t('add')}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={commonStyles.content}>
        {/* Search */}
        <TextInput
          style={[commonStyles.input, { marginBottom: 16 }]}
          placeholder={t('search')}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        {/* Summary */}
        <View style={[commonStyles.card, { marginBottom: 16 }]}>
          <Text style={[commonStyles.subtitle, { marginBottom: 8 }]}>
            Customer Summary
          </Text>
          <View style={commonStyles.row}>
            <View>
              <Text style={[commonStyles.textSecondary, { fontSize: 12 }]}>
                Total Customers
              </Text>
              <Text style={[commonStyles.title, { fontSize: 18, color: colors.primary }]}>
                {customers.length}
              </Text>
            </View>
            <View>
              <Text style={[commonStyles.textSecondary, { fontSize: 12 }]}>
                Active This Month
              </Text>
              <Text style={[commonStyles.title, { fontSize: 18 }]}>
                {customers.filter(customer => {
                  if (!customer.lastPurchaseDate) return false;
                  const lastMonth = new Date();
                  lastMonth.setMonth(lastMonth.getMonth() - 1);
                  return new Date(customer.lastPurchaseDate) > lastMonth;
                }).length}
              </Text>
            </View>
          </View>
        </View>

        {/* Customers List */}
        <ScrollView showsVerticalScrollIndicator={false}>
          {filteredCustomers.length === 0 ? (
            <View style={[commonStyles.center, { paddingVertical: 40 }]}>
              <Icon name="people-outline" size={48} color={colors.textSecondary} />
              <Text style={[commonStyles.textSecondary, { marginTop: 16, textAlign: 'center' }]}>
                {searchQuery ? 'No customers found' : 'No customers added yet'}
              </Text>
            </View>
          ) : (
            filteredCustomers.map(customer => {
              const stats = getCustomerStats(customer.id);
              return (
                <TouchableOpacity
                  key={customer.id}
                  style={commonStyles.card}
                  onPress={() => handleEditCustomer(customer)}
                >
                  <View style={commonStyles.row}>
                    <View style={{ flex: 1 }}>
                      <Text style={[commonStyles.text, { fontWeight: '600' }]}>
                        {customer.name}
                      </Text>
                      
                      {customer.phoneNumber && (
                        <Text style={commonStyles.textSecondary}>
                          📞 {customer.phoneNumber}
                        </Text>
                      )}
                      
                      {customer.email && (
                        <Text style={commonStyles.textSecondary}>
                          ✉️ {customer.email}
                        </Text>
                      )}
                      
                      <View style={{ flexDirection: 'row', marginTop: 8 }}>
                        <View style={{ marginRight: 16 }}>
                          <Text style={[commonStyles.textSecondary, { fontSize: 12 }]}>
                            Total Spent
                          </Text>
                          <Text style={[commonStyles.text, { fontWeight: '600', color: colors.primary }]}>
                            {formatCurrency(stats.totalSpent)}
                          </Text>
                        </View>
                        
                        <View>
                          <Text style={[commonStyles.textSecondary, { fontSize: 12 }]}>
                            Orders
                          </Text>
                          <Text style={[commonStyles.text, { fontWeight: '600' }]}>
                            {stats.totalOrders}
                          </Text>
                        </View>
                      </View>
                      
                      {stats.lastPurchase && (
                        <Text style={[commonStyles.textSecondary, { fontSize: 12, marginTop: 4 }]}>
                          Last purchase: {formatDate(stats.lastPurchase)}
                        </Text>
                      )}
                    </View>
                    
                    <View style={{ alignItems: 'center' }}>
                      <Icon name="person-circle-outline" size={32} color={colors.primary} />
                      {stats.totalOrders > 0 && (
                        <View style={[commonStyles.badge, { marginTop: 4 }]}>
                          <Text style={commonStyles.badgeText}>
                            {stats.totalOrders > 10 ? 'VIP' : 'Regular'}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      </View>

      {/* Add/Edit Customer Bottom Sheet */}
      <SimpleBottomSheet
        isVisible={showAddCustomer}
        onClose={() => {
          setShowAddCustomer(false);
          resetForm();
        }}
      >
        <ScrollView style={{ padding: 16 }}>
          <Text style={[commonStyles.title, { marginBottom: 24 }]}>
            {editingCustomer ? 'Edit Customer' : t('addCustomer')}
          </Text>

          <TextInput
            style={[commonStyles.input, { marginBottom: 16 }]}
            placeholder={t('customerName')}
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
          />

          <TextInput
            style={[commonStyles.input, { marginBottom: 16 }]}
            placeholder={t('phoneNumber')}
            value={formData.phoneNumber}
            onChangeText={(text) => setFormData({ ...formData, phoneNumber: text })}
            keyboardType="phone-pad"
          />

          <TextInput
            style={[commonStyles.input, { marginBottom: 16 }]}
            placeholder={t('email')}
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            style={[commonStyles.input, { marginBottom: 24, height: 80 }]}
            placeholder={t('address')}
            value={formData.address}
            onChangeText={(text) => setFormData({ ...formData, address: text })}
            multiline
            textAlignVertical="top"
          />

          <View style={{ flexDirection: 'row' }}>
            <Button
              text={t('cancel')}
              onPress={() => {
                setShowAddCustomer(false);
                resetForm();
              }}
              style={[{ flex: 1, marginRight: 8, backgroundColor: colors.backgroundAlt }]}
              textStyle={{ color: colors.text }}
            />
            <Button
              text={t('save')}
              onPress={handleSaveCustomer}
              style={[{ flex: 1, marginLeft: 8 }]}
            />
          </View>
        </ScrollView>
      </SimpleBottomSheet>
    </SafeAreaView>
  );
}
