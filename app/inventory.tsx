
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { commonStyles, colors } from '../styles/commonStyles';
import { useLanguage } from '../contexts/LanguageContext';
import { useData } from '../contexts/DataContext';
import { InventoryTransaction } from '../types';
import Icon from '../components/Icon';
import Button from '../components/Button';
import SimpleBottomSheet from '../components/BottomSheet';

export default function InventoryScreen() {
  const { t } = useLanguage();
  const { products, inventoryTransactions, addInventoryTransaction } = useData();
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'stock' | 'transactions'>('stock');

  // Form state
  const [formData, setFormData] = useState({
    productId: '',
    type: 'in' as 'in' | 'out',
    quantity: '',
    supplier: '',
    reason: '',
    notes: '',
  });

  const resetForm = () => {
    setFormData({
      productId: '',
      type: 'in',
      quantity: '',
      supplier: '',
      reason: '',
      notes: '',
    });
  };

  const handleSaveTransaction = async () => {
    if (!formData.productId || !formData.quantity) {
      Alert.alert('Error', 'Please select a product and enter quantity');
      return;
    }

    const quantity = parseInt(formData.quantity);
    if (isNaN(quantity) || quantity <= 0) {
      Alert.alert('Error', 'Please enter a valid quantity');
      return;
    }

    // Check if we have enough stock for stock-out
    if (formData.type === 'out') {
      const product = products.find(p => p.id === formData.productId);
      if (!product || product.stock < quantity) {
        Alert.alert('Error', 'Insufficient stock for this transaction');
        return;
      }
    }

    try {
      const transactionData: Omit<InventoryTransaction, 'id'> = {
        productId: formData.productId,
        type: formData.type,
        quantity,
        date: new Date(),
        supplier: formData.supplier.trim() || undefined,
        reason: formData.reason.trim() || undefined,
        notes: formData.notes.trim() || undefined,
      };

      await addInventoryTransaction(transactionData);
      
      setShowAddTransaction(false);
      resetForm();
      Alert.alert('Success', 'Transaction recorded successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to record transaction');
      console.log('Error saving transaction:', error);
    }
  };

  const getStockStatusColor = (stock: number) => {
    if (stock === 0) return colors.error;
    if (stock <= 5) return colors.warning;
    return colors.success;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const sortedTransactions = [...inventoryTransactions].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const lowStockProducts = products.filter(product => product.stock > 0 && product.stock <= 5);
  const outOfStockProducts = products.filter(product => product.stock === 0);

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
            {t('inventory')}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => setShowAddTransaction(true)}
          style={{
            backgroundColor: colors.primary,
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 8,
          }}
        >
          <Text style={{ color: colors.background, fontWeight: '600' }}>
            Add Transaction
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View style={{
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}>
        <TouchableOpacity
          style={{
            flex: 1,
            paddingVertical: 12,
            alignItems: 'center',
            borderBottomWidth: 2,
            borderBottomColor: selectedTab === 'stock' ? colors.primary : 'transparent',
          }}
          onPress={() => setSelectedTab('stock')}
        >
          <Text style={{
            color: selectedTab === 'stock' ? colors.primary : colors.textSecondary,
            fontWeight: selectedTab === 'stock' ? '600' : '400',
          }}>
            Stock Levels
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={{
            flex: 1,
            paddingVertical: 12,
            alignItems: 'center',
            borderBottomWidth: 2,
            borderBottomColor: selectedTab === 'transactions' ? colors.primary : 'transparent',
          }}
          onPress={() => setSelectedTab('transactions')}
        >
          <Text style={{
            color: selectedTab === 'transactions' ? colors.primary : colors.textSecondary,
            fontWeight: selectedTab === 'transactions' ? '600' : '400',
          }}>
            Transactions
          </Text>
        </TouchableOpacity>
      </View>

      <View style={commonStyles.content}>
        {selectedTab === 'stock' ? (
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Stock Alerts */}
            {(outOfStockProducts.length > 0 || lowStockProducts.length > 0) && (
              <View style={{ marginBottom: 16 }}>
                <Text style={[commonStyles.subtitle, { marginBottom: 12 }]}>
                  {t('stockAlerts')}
                </Text>
                
                {outOfStockProducts.map(product => (
                  <View key={product.id} style={[commonStyles.card, { 
                    marginBottom: 8, 
                    borderLeftWidth: 4, 
                    borderLeftColor: colors.error 
                  }]}>
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

                {lowStockProducts.map(product => (
                  <View key={product.id} style={[commonStyles.card, { 
                    marginBottom: 8, 
                    borderLeftWidth: 4, 
                    borderLeftColor: colors.warning 
                  }]}>
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

            {/* All Products Stock */}
            <Text style={[commonStyles.subtitle, { marginBottom: 12 }]}>
              All Products
            </Text>
            
            {products.length === 0 ? (
              <View style={[commonStyles.center, { paddingVertical: 40 }]}>
                <Icon name="cube-outline" size={48} color={colors.textSecondary} />
                <Text style={[commonStyles.textSecondary, { marginTop: 16, textAlign: 'center' }]}>
                  No products found
                </Text>
              </View>
            ) : (
              products.map(product => (
                <View key={product.id} style={commonStyles.card}>
                  <View style={commonStyles.row}>
                    <View style={{ flex: 1 }}>
                      <Text style={commonStyles.text}>{product.name}</Text>
                      <Text style={commonStyles.textSecondary}>
                        ${product.price.toFixed(2)}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{
                        fontSize: 18,
                        fontWeight: '600',
                        color: getStockStatusColor(product.stock),
                      }}>
                        {product.stock}
                      </Text>
                      <Text style={[commonStyles.textSecondary, { fontSize: 12 }]}>
                        in stock
                      </Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            {sortedTransactions.length === 0 ? (
              <View style={[commonStyles.center, { paddingVertical: 40 }]}>
                <Icon name="swap-horizontal-outline" size={48} color={colors.textSecondary} />
                <Text style={[commonStyles.textSecondary, { marginTop: 16, textAlign: 'center' }]}>
                  No transactions recorded
                </Text>
              </View>
            ) : (
              sortedTransactions.map(transaction => {
                const product = products.find(p => p.id === transaction.productId);
                return (
                  <View key={transaction.id} style={commonStyles.card}>
                    <View style={commonStyles.row}>
                      <View style={{ flex: 1 }}>
                        <Text style={commonStyles.text}>
                          {product?.name || 'Unknown Product'}
                        </Text>
                        <Text style={[
                          commonStyles.textSecondary,
                          { color: transaction.type === 'in' ? colors.success : colors.error }
                        ]}>
                          {transaction.type === 'in' ? t('stockIn') : t('stockOut')}: {transaction.quantity}
                        </Text>
                        <Text style={[commonStyles.textSecondary, { fontSize: 12 }]}>
                          {formatDate(transaction.date)} • {formatTime(transaction.date)}
                        </Text>
                        {transaction.supplier && (
                          <Text style={[commonStyles.textSecondary, { fontSize: 12 }]}>
                            Supplier: {transaction.supplier}
                          </Text>
                        )}
                        {transaction.reason && (
                          <Text style={[commonStyles.textSecondary, { fontSize: 12 }]}>
                            Reason: {transaction.reason}
                          </Text>
                        )}
                      </View>
                      <View style={{ alignItems: 'center' }}>
                        <Icon 
                          name={transaction.type === 'in' ? 'arrow-down-circle' : 'arrow-up-circle'} 
                          size={24} 
                          color={transaction.type === 'in' ? colors.success : colors.error} 
                        />
                      </View>
                    </View>
                  </View>
                );
              })
            )}
          </ScrollView>
        )}
      </View>

      {/* Add Transaction Bottom Sheet */}
      <SimpleBottomSheet
        isVisible={showAddTransaction}
        onClose={() => {
          setShowAddTransaction(false);
          resetForm();
        }}
      >
        <ScrollView style={{ padding: 16 }}>
          <Text style={[commonStyles.title, { marginBottom: 24 }]}>
            Add Inventory Transaction
          </Text>

          {/* Transaction Type */}
          <Text style={[commonStyles.subtitle, { marginBottom: 12 }]}>
            Transaction Type
          </Text>
          
          <View style={{ flexDirection: 'row', marginBottom: 16 }}>
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: formData.type === 'in' ? colors.success : colors.backgroundAlt,
                padding: 12,
                marginRight: 8,
                borderRadius: 8,
                alignItems: 'center',
              }}
              onPress={() => setFormData({ ...formData, type: 'in' })}
            >
              <Icon 
                name="arrow-down-circle" 
                size={20} 
                color={formData.type === 'in' ? colors.background : colors.text} 
              />
              <Text style={{
                color: formData.type === 'in' ? colors.background : colors.text,
                fontSize: 14,
                fontWeight: '500',
                marginTop: 4,
              }}>
                {t('stockIn')}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: formData.type === 'out' ? colors.error : colors.backgroundAlt,
                padding: 12,
                marginLeft: 8,
                borderRadius: 8,
                alignItems: 'center',
              }}
              onPress={() => setFormData({ ...formData, type: 'out' })}
            >
              <Icon 
                name="arrow-up-circle" 
                size={20} 
                color={formData.type === 'out' ? colors.background : colors.text} 
              />
              <Text style={{
                color: formData.type === 'out' ? colors.background : colors.text,
                fontSize: 14,
                fontWeight: '500',
                marginTop: 4,
              }}>
                {t('stockOut')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Product Selection */}
          <Text style={[commonStyles.subtitle, { marginBottom: 12 }]}>
            Select Product
          </Text>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
            {products.map(product => (
              <TouchableOpacity
                key={product.id}
                style={{
                  backgroundColor: formData.productId === product.id ? colors.primary : colors.backgroundAlt,
                  padding: 12,
                  marginRight: 8,
                  borderRadius: 8,
                  minWidth: 120,
                }}
                onPress={() => setFormData({ ...formData, productId: product.id })}
              >
                <Text style={{
                  color: formData.productId === product.id ? colors.background : colors.text,
                  fontSize: 14,
                  fontWeight: '600',
                }}>
                  {product.name}
                </Text>
                <Text style={{
                  color: formData.productId === product.id ? colors.background : colors.textSecondary,
                  fontSize: 12,
                }}>
                  Stock: {product.stock}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Quantity */}
          <TextInput
            style={[commonStyles.input, { marginBottom: 16 }]}
            placeholder={t('quantity')}
            value={formData.quantity}
            onChangeText={(text) => setFormData({ ...formData, quantity: text })}
            keyboardType="numeric"
          />

          {/* Supplier (for stock in) */}
          {formData.type === 'in' && (
            <TextInput
              style={[commonStyles.input, { marginBottom: 16 }]}
              placeholder={t('supplier')}
              value={formData.supplier}
              onChangeText={(text) => setFormData({ ...formData, supplier: text })}
            />
          )}

          {/* Reason (for stock out) */}
          {formData.type === 'out' && (
            <TextInput
              style={[commonStyles.input, { marginBottom: 16 }]}
              placeholder={t('reason')}
              value={formData.reason}
              onChangeText={(text) => setFormData({ ...formData, reason: text })}
            />
          )}

          {/* Notes */}
          <TextInput
            style={[commonStyles.input, { marginBottom: 24, height: 60 }]}
            placeholder="Notes (optional)"
            value={formData.notes}
            onChangeText={(text) => setFormData({ ...formData, notes: text })}
            multiline
            textAlignVertical="top"
          />

          <View style={{ flexDirection: 'row' }}>
            <Button
              text={t('cancel')}
              onPress={() => {
                setShowAddTransaction(false);
                resetForm();
              }}
              style={[{ flex: 1, marginRight: 8, backgroundColor: colors.backgroundAlt }]}
              textStyle={{ color: colors.text }}
            />
            <Button
              text={t('save')}
              onPress={handleSaveTransaction}
              style={[{ flex: 1, marginLeft: 8 }]}
            />
          </View>
        </ScrollView>
      </SimpleBottomSheet>
    </SafeAreaView>
  );
}
