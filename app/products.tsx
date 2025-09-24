
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { commonStyles, colors } from '../styles/commonStyles';
import { useLanguage } from '../contexts/LanguageContext';
import { useData } from '../contexts/DataContext';
import { Product, ProductCategory } from '../types';
import Icon from '../components/Icon';
import Button from '../components/Button';
import SimpleBottomSheet from '../components/BottomSheet';

export default function ProductsScreen() {
  const { t } = useLanguage();
  const { products, addProduct, updateProduct, deleteProduct } = useData();
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: 'freshFish' as ProductCategory,
    price: '',
    stock: '',
    description: '',
  });

  const categories: { key: ProductCategory | 'all'; label: string }[] = [
    { key: 'all', label: 'All Categories' },
    { key: 'freshFish', label: t('freshFish') },
    { key: 'frozenFish', label: t('frozenFish') },
    { key: 'drinks', label: t('drinks') },
    { key: 'spices', label: t('spices') },
    { key: 'otherGroceries', label: t('otherGroceries') },
  ];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'freshFish',
      price: '',
      stock: '',
      description: '',
    });
    setEditingProduct(null);
  };

  const handleAddProduct = () => {
    resetForm();
    setShowAddProduct(true);
  };

  const handleEditProduct = (product: Product) => {
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price.toString(),
      stock: product.stock.toString(),
      description: product.description || '',
    });
    setEditingProduct(product);
    setShowAddProduct(true);
  };

  const handleSaveProduct = async () => {
    if (!formData.name.trim() || !formData.price || !formData.stock) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const productData = {
        name: formData.name.trim(),
        category: formData.category,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        description: formData.description.trim(),
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
      } else {
        await addProduct(productData);
      }

      setShowAddProduct(false);
      resetForm();
    } catch (error) {
      Alert.alert('Error', 'Failed to save product');
      console.log('Error saving product:', error);
    }
  };

  const handleDeleteProduct = (product: Product) => {
    Alert.alert(
      t('deleteProduct'),
      `Are you sure you want to delete "${product.name}"?`,
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProduct(product.id);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete product');
              console.log('Error deleting product:', error);
            }
          },
        },
      ]
    );
  };

  const getStockStatusColor = (stock: number) => {
    if (stock === 0) return colors.error;
    if (stock <= 5) return colors.warning;
    return colors.success;
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
            {t('products')}
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleAddProduct}
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
        {/* Search and Filter */}
        <View style={{ marginBottom: 16 }}>
          <TextInput
            style={[commonStyles.input, { marginBottom: 12 }]}
            placeholder={t('search')}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map(category => (
              <TouchableOpacity
                key={category.key}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  marginRight: 8,
                  borderRadius: 20,
                  backgroundColor: selectedCategory === category.key ? colors.primary : colors.backgroundAlt,
                }}
                onPress={() => setSelectedCategory(category.key)}
              >
                <Text style={{
                  color: selectedCategory === category.key ? colors.background : colors.text,
                  fontSize: 14,
                  fontWeight: '500',
                }}>
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Products List */}
        <ScrollView showsVerticalScrollIndicator={false}>
          {filteredProducts.length === 0 ? (
            <View style={[commonStyles.center, { paddingVertical: 40 }]}>
              <Icon name="fish-outline" size={48} color={colors.textSecondary} />
              <Text style={[commonStyles.textSecondary, { marginTop: 16, textAlign: 'center' }]}>
                No products found
              </Text>
            </View>
          ) : (
            filteredProducts.map(product => (
              <View key={product.id} style={commonStyles.card}>
                <View style={commonStyles.row}>
                  <View style={{ flex: 1 }}>
                    <Text style={commonStyles.text}>{product.name}</Text>
                    <Text style={commonStyles.textSecondary}>
                      {categories.find(c => c.key === product.category)?.label}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                      <Text style={[commonStyles.text, { fontWeight: '600' }]}>
                        ${product.price.toFixed(2)}
                      </Text>
                      <Text style={{
                        marginLeft: 16,
                        color: getStockStatusColor(product.stock),
                        fontWeight: '500',
                      }}>
                        Stock: {product.stock}
                      </Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row' }}>
                    <TouchableOpacity
                      onPress={() => handleEditProduct(product)}
                      style={{ padding: 8, marginRight: 8 }}
                    >
                      <Icon name="create-outline" size={20} color={colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDeleteProduct(product)}
                      style={{ padding: 8 }}
                    >
                      <Icon name="trash-outline" size={20} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </View>

      {/* Add/Edit Product Bottom Sheet */}
      <SimpleBottomSheet
        isVisible={showAddProduct}
        onClose={() => {
          setShowAddProduct(false);
          resetForm();
        }}
      >
        <View style={{ padding: 16 }}>
          <Text style={[commonStyles.title, { marginBottom: 24 }]}>
            {editingProduct ? t('editProduct') : t('addProduct')}
          </Text>

          <TextInput
            style={[commonStyles.input, { marginBottom: 16 }]}
            placeholder={t('productName')}
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
          />

          <View style={{ marginBottom: 16 }}>
            <Text style={[commonStyles.textSecondary, { marginBottom: 8 }]}>
              {t('category')}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {categories.slice(1).map(category => (
                <TouchableOpacity
                  key={category.key}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    marginRight: 8,
                    borderRadius: 20,
                    backgroundColor: formData.category === category.key ? colors.primary : colors.backgroundAlt,
                  }}
                  onPress={() => setFormData({ ...formData, category: category.key as ProductCategory })}
                >
                  <Text style={{
                    color: formData.category === category.key ? colors.background : colors.text,
                    fontSize: 14,
                    fontWeight: '500',
                  }}>
                    {category.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={{ flexDirection: 'row', marginBottom: 16 }}>
            <TextInput
              style={[commonStyles.input, { flex: 1, marginRight: 8 }]}
              placeholder={t('price')}
              value={formData.price}
              onChangeText={(text) => setFormData({ ...formData, price: text })}
              keyboardType="numeric"
            />
            <TextInput
              style={[commonStyles.input, { flex: 1, marginLeft: 8 }]}
              placeholder={t('stock')}
              value={formData.stock}
              onChangeText={(text) => setFormData({ ...formData, stock: text })}
              keyboardType="numeric"
            />
          </View>

          <TextInput
            style={[commonStyles.input, { marginBottom: 24, height: 80 }]}
            placeholder={t('description')}
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            multiline
            textAlignVertical="top"
          />

          <View style={{ flexDirection: 'row' }}>
            <Button
              text={t('cancel')}
              onPress={() => {
                setShowAddProduct(false);
                resetForm();
              }}
              style={[{ flex: 1, marginRight: 8, backgroundColor: colors.backgroundAlt }]}
              textStyle={{ color: colors.text }}
            />
            <Button
              text={t('save')}
              onPress={handleSaveProduct}
              style={[{ flex: 1, marginLeft: 8 }]}
            />
          </View>
        </View>
      </SimpleBottomSheet>
    </SafeAreaView>
  );
}
