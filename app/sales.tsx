
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { commonStyles, colors } from '../styles/commonStyles';
import { useLanguage } from '../contexts/LanguageContext';
import { useData } from '../contexts/DataContext';
import { Sale, SaleItem, PaymentMethod } from '../types';
import Icon from '../components/Icon';
import Button from '../components/Button';
import SimpleBottomSheet from '../components/BottomSheet';

export default function SalesScreen() {
  const { t } = useLanguage();
  const { products, sales, customers, addSale } = useData();
  const [showAddSale, setShowAddSale] = useState(false);
  const [selectedItems, setSelectedItems] = useState<SaleItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [notes, setNotes] = useState('');

  const paymentMethods: { key: PaymentMethod; label: string; icon: string }[] = [
    { key: 'cash', label: t('cash'), icon: 'cash-outline' },
    { key: 'mobileMoney', label: t('mobileMoney'), icon: 'phone-portrait-outline' },
    { key: 'bank', label: t('bank'), icon: 'card-outline' },
  ];

  const todaysSales = sales.filter(sale => {
    const today = new Date();
    const saleDate = new Date(sale.date);
    return saleDate.toDateString() === today.toDateString();
  });

  const totalToday = todaysSales.reduce((sum, sale) => sum + sale.total, 0);

  const handleAddItem = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = selectedItems.find(item => item.productId === productId);
    if (existingItem) {
      setSelectedItems(selectedItems.map(item =>
        item.productId === productId
          ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
          : item
      ));
    } else {
      const newItem: SaleItem = {
        productId: product.id,
        productName: product.name,
        quantity: 1,
        price: product.price,
        total: product.price,
      };
      setSelectedItems([...selectedItems, newItem]);
    }
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setSelectedItems(selectedItems.filter(item => item.productId !== productId));
    } else {
      setSelectedItems(selectedItems.map(item =>
        item.productId === productId
          ? { ...item, quantity, total: quantity * item.price }
          : item
      ));
    }
  };

  const getTotalAmount = () => {
    return selectedItems.reduce((sum, item) => sum + item.total, 0);
  };

  const handleSaveSale = async () => {
    if (selectedItems.length === 0) {
      Alert.alert('Error', 'Please add at least one item');
      return;
    }

    // Check stock availability
    for (const item of selectedItems) {
      const product = products.find(p => p.id === item.productId);
      if (!product || product.stock < item.quantity) {
        Alert.alert('Error', `Insufficient stock for ${item.productName}`);
        return;
      }
    }

    try {
      const saleData: Omit<Sale, 'id'> = {
        items: selectedItems,
        total: getTotalAmount(),
        paymentMethod,
        date: new Date(),
        customerId: selectedCustomer || undefined,
        notes: notes.trim() || undefined,
      };

      await addSale(saleData);
      
      // Reset form
      setSelectedItems([]);
      setPaymentMethod('cash');
      setSelectedCustomer('');
      setNotes('');
      setShowAddSale(false);
      
      Alert.alert('Success', 'Sale recorded successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to record sale');
      console.log('Error saving sale:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
            {t('sales')}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => setShowAddSale(true)}
          style={{
            backgroundColor: colors.primary,
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 8,
          }}
        >
          <Text style={{ color: colors.background, fontWeight: '600' }}>
            {t('recordSale')}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={commonStyles.content}>
        {/* Today's Summary */}
        <View style={[commonStyles.card, { marginBottom: 16 }]}>
          <Text style={[commonStyles.subtitle, { marginBottom: 8 }]}>
            {t('todaysSales')}
          </Text>
          <View style={commonStyles.row}>
            <View>
              <Text style={[commonStyles.textSecondary, { fontSize: 12 }]}>
                Total Sales
              </Text>
              <Text style={[commonStyles.title, { fontSize: 18, color: colors.primary }]}>
                {formatCurrency(totalToday)}
              </Text>
            </View>
            <View>
              <Text style={[commonStyles.textSecondary, { fontSize: 12 }]}>
                Transactions
              </Text>
              <Text style={[commonStyles.title, { fontSize: 18 }]}>
                {todaysSales.length}
              </Text>
            </View>
          </View>
        </View>

        {/* Sales List */}
        <ScrollView showsVerticalScrollIndicator={false}>
          {todaysSales.length === 0 ? (
            <View style={[commonStyles.center, { paddingVertical: 40 }]}>
              <Icon name="receipt-outline" size={48} color={colors.textSecondary} />
              <Text style={[commonStyles.textSecondary, { marginTop: 16, textAlign: 'center' }]}>
                No sales recorded today
              </Text>
            </View>
          ) : (
            todaysSales.map(sale => (
              <View key={sale.id} style={commonStyles.card}>
                <View style={commonStyles.row}>
                  <View style={{ flex: 1 }}>
                    <Text style={[commonStyles.text, { fontWeight: '600' }]}>
                      {formatCurrency(sale.total)}
                    </Text>
                    <Text style={commonStyles.textSecondary}>
                      {sale.items.length} items • {paymentMethods.find(p => p.key === sale.paymentMethod)?.label}
                    </Text>
                    <Text style={[commonStyles.textSecondary, { fontSize: 12 }]}>
                      {formatTime(sale.date)}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Icon 
                      name={paymentMethods.find(p => p.key === sale.paymentMethod)?.icon as any} 
                      size={20} 
                      color={colors.primary} 
                    />
                    {sale.customerId && (
                      <Text style={[commonStyles.textSecondary, { fontSize: 12, marginTop: 4 }]}>
                        Customer
                      </Text>
                    )}
                  </View>
                </View>
                
                {/* Sale Items */}
                <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border }}>
                  {sale.items.map((item, index) => (
                    <View key={index} style={[commonStyles.row, { marginBottom: 4 }]}>
                      <Text style={[commonStyles.textSecondary, { flex: 1 }]}>
                        {item.productName} x{item.quantity}
                      </Text>
                      <Text style={commonStyles.textSecondary}>
                        {formatCurrency(item.total)}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </View>

      {/* Add Sale Bottom Sheet */}
      <SimpleBottomSheet
        isVisible={showAddSale}
        onClose={() => {
          setShowAddSale(false);
          setSelectedItems([]);
          setPaymentMethod('cash');
          setSelectedCustomer('');
          setNotes('');
        }}
      >
        <ScrollView style={{ padding: 16 }}>
          <Text style={[commonStyles.title, { marginBottom: 24 }]}>
            {t('recordSale')}
          </Text>

          {/* Product Selection */}
          <Text style={[commonStyles.subtitle, { marginBottom: 12 }]}>
            Select Products
          </Text>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
            {products.filter(p => p.stock > 0).map(product => (
              <TouchableOpacity
                key={product.id}
                style={{
                  backgroundColor: colors.backgroundAlt,
                  padding: 12,
                  marginRight: 8,
                  borderRadius: 8,
                  minWidth: 120,
                }}
                onPress={() => handleAddItem(product.id)}
              >
                <Text style={[commonStyles.text, { fontSize: 14, fontWeight: '600' }]}>
                  {product.name}
                </Text>
                <Text style={[commonStyles.textSecondary, { fontSize: 12 }]}>
                  {formatCurrency(product.price)}
                </Text>
                <Text style={[commonStyles.textSecondary, { fontSize: 12 }]}>
                  Stock: {product.stock}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Selected Items */}
          {selectedItems.length > 0 && (
            <View style={{ marginBottom: 16 }}>
              <Text style={[commonStyles.subtitle, { marginBottom: 12 }]}>
                Selected Items
              </Text>
              
              {selectedItems.map(item => (
                <View key={item.productId} style={[commonStyles.card, { marginBottom: 8 }]}>
                  <View style={commonStyles.row}>
                    <View style={{ flex: 1 }}>
                      <Text style={commonStyles.text}>{item.productName}</Text>
                      <Text style={commonStyles.textSecondary}>
                        {formatCurrency(item.price)} each
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <TouchableOpacity
                        onPress={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                        style={{
                          backgroundColor: colors.backgroundAlt,
                          width: 32,
                          height: 32,
                          borderRadius: 16,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Icon name="remove" size={16} color={colors.text} />
                      </TouchableOpacity>
                      
                      <Text style={[commonStyles.text, { marginHorizontal: 16, minWidth: 20, textAlign: 'center' }]}>
                        {item.quantity}
                      </Text>
                      
                      <TouchableOpacity
                        onPress={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                        style={{
                          backgroundColor: colors.primary,
                          width: 32,
                          height: 32,
                          borderRadius: 16,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Icon name="add" size={16} color={colors.background} />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <Text style={[commonStyles.text, { fontWeight: '600', textAlign: 'right', marginTop: 8 }]}>
                    {formatCurrency(item.total)}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Payment Method */}
          <Text style={[commonStyles.subtitle, { marginBottom: 12 }]}>
            {t('paymentMethod')}
          </Text>
          
          <View style={{ flexDirection: 'row', marginBottom: 16 }}>
            {paymentMethods.map(method => (
              <TouchableOpacity
                key={method.key}
                style={{
                  flex: 1,
                  backgroundColor: paymentMethod === method.key ? colors.primary : colors.backgroundAlt,
                  padding: 12,
                  marginRight: 8,
                  borderRadius: 8,
                  alignItems: 'center',
                }}
                onPress={() => setPaymentMethod(method.key)}
              >
                <Icon 
                  name={method.icon as any} 
                  size={20} 
                  color={paymentMethod === method.key ? colors.background : colors.text} 
                />
                <Text style={{
                  color: paymentMethod === method.key ? colors.background : colors.text,
                  fontSize: 12,
                  fontWeight: '500',
                  marginTop: 4,
                }}>
                  {method.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Customer Selection */}
          {customers.length > 0 && (
            <View style={{ marginBottom: 16 }}>
              <Text style={[commonStyles.subtitle, { marginBottom: 12 }]}>
                Customer (Optional)
              </Text>
              
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <TouchableOpacity
                  style={{
                    backgroundColor: selectedCustomer === '' ? colors.primary : colors.backgroundAlt,
                    padding: 12,
                    marginRight: 8,
                    borderRadius: 8,
                  }}
                  onPress={() => setSelectedCustomer('')}
                >
                  <Text style={{
                    color: selectedCustomer === '' ? colors.background : colors.text,
                    fontSize: 14,
                    fontWeight: '500',
                  }}>
                    Walk-in
                  </Text>
                </TouchableOpacity>
                
                {customers.map(customer => (
                  <TouchableOpacity
                    key={customer.id}
                    style={{
                      backgroundColor: selectedCustomer === customer.id ? colors.primary : colors.backgroundAlt,
                      padding: 12,
                      marginRight: 8,
                      borderRadius: 8,
                    }}
                    onPress={() => setSelectedCustomer(customer.id)}
                  >
                    <Text style={{
                      color: selectedCustomer === customer.id ? colors.background : colors.text,
                      fontSize: 14,
                      fontWeight: '500',
                    }}>
                      {customer.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Notes */}
          <TextInput
            style={[commonStyles.input, { marginBottom: 24, height: 60 }]}
            placeholder="Notes (optional)"
            value={notes}
            onChangeText={setNotes}
            multiline
            textAlignVertical="top"
          />

          {/* Total and Actions */}
          {selectedItems.length > 0 && (
            <View style={[commonStyles.card, { marginBottom: 16, backgroundColor: colors.primary + '10' }]}>
              <View style={commonStyles.row}>
                <Text style={[commonStyles.subtitle, { color: colors.primary }]}>
                  {t('total')}
                </Text>
                <Text style={[commonStyles.title, { color: colors.primary }]}>
                  {formatCurrency(getTotalAmount())}
                </Text>
              </View>
            </View>
          )}

          <View style={{ flexDirection: 'row' }}>
            <Button
              text={t('cancel')}
              onPress={() => {
                setShowAddSale(false);
                setSelectedItems([]);
                setPaymentMethod('cash');
                setSelectedCustomer('');
                setNotes('');
              }}
              style={[{ flex: 1, marginRight: 8, backgroundColor: colors.backgroundAlt }]}
              textStyle={{ color: colors.text }}
            />
            <Button
              text={t('save')}
              onPress={handleSaveSale}
              style={[{ flex: 1, marginLeft: 8 }]}
            />
          </View>
        </ScrollView>
      </SimpleBottomSheet>
    </SafeAreaView>
  );
}
