import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, RefreshControl, SafeAreaView, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { createProduct, deleteProduct, generateUploadUrl, getProducts, updateProduct } from '../api/api-methods';
import { BORDER_RADIUS, COLORS, SPACING } from '../constants/theme';

const PAGE_SIZE = 10;

const EMPTY_FORM = {
  name: '',
  sku: '',
  unit: '',
  category: '',
  price: '0',
  weight: '0',
  description: '',
  dimensionLength: '',
  dimensionWidth: '',
  dimensionHeight: '',
  dimensionUnit: '',
  imageUrlInput: '',
  imageUrls: [],
  active: true,
};

function ProductCard({ product, onEdit, onDelete }) {
  const formatPrice = (value) => `₹${Number(value || 0).toFixed(2)}`;
  
  return (
    <View style={styles.productCard}>
      <View style={styles.cardRow1}>
        <View style={styles.productInfo}>
          {product.images && product.images.length > 0 ? (
            <Image source={{ uri: product.images[0] }} style={styles.productImage} />
          ) : (
            <View style={styles.productImagePlaceholder}>
              <MaterialCommunityIcons name="package-variant" size={24} color="#9e9e9e" />
            </View>
          )}
          <View style={styles.productDetails}>
            <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
            <Text style={styles.productSku}>SKU: {product.sku}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, product.isActive ? styles.badgeActive : styles.badgeInactive]}>
          <Text style={[styles.statusBadgeText, product.isActive ? styles.badgeTextActive : styles.badgeTextInactive]}>
            {product.isActive ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>
      
      <View style={styles.cardMetaRow}>
        <MaterialCommunityIcons name="tag-outline" size={13} color="#888" />
        <Text style={styles.cardMeta}> {product.category || 'N/A'}</Text>
        <Text style={styles.dot}>  ·  </Text>
        <MaterialCommunityIcons name="currency-inr" size={13} color="#888" />
        <Text style={styles.cardMeta}> {formatPrice(product.price)}</Text>
      </View>
      
      <View style={styles.cardMetaRow}>
        <MaterialCommunityIcons name="cube-outline" size={13} color="#888" />
        <Text style={styles.cardMeta}> {product.unit || 'N/A'}</Text>
        <Text style={styles.dot}>  ·  </Text>
        <MaterialCommunityIcons name="weight" size={13} color="#888" />
        <Text style={styles.cardMeta}> {product.weight || 0} kg</Text>
      </View>
      
      {product.description ? (
        <View style={styles.cardMetaRow}>
          <MaterialCommunityIcons name="text" size={13} color="#888" />
          <Text style={styles.cardMeta} numberOfLines={1}> {product.description}</Text>
        </View>
      ) : null}
      
      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7} onPress={() => onEdit(product)}>
          <MaterialCommunityIcons name="pencil-outline" size={17} color="#555" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7} onPress={() => onDelete(product)}>
          <MaterialCommunityIcons name="trash-can-outline" size={17} color="#e53935" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function ProductsScreen() {
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [addForm, setAddForm] = useState(EMPTY_FORM);
  const [editForm, setEditForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  const fetchProducts = async (page = currentPage) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getProducts(page, PAGE_SIZE);
      setProducts(response.data || []);
      setTotalPages(response.pagination?.totalPages || 1);
      setTotalItems(response.pagination?.totalItems || 0);
    } catch (err) {
      setError('Failed to fetch products');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchProducts(currentPage);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProducts(currentPage);
  }, [currentPage]);

  const addImageUrlToForm = (form, setter) => {
    if (!form.imageUrlInput.trim()) return;
    setter({
      ...form,
      imageUrls: [...form.imageUrls, form.imageUrlInput.trim()],
      imageUrlInput: '',
    });
  };

  const openEdit = (product) => {
    setSelectedProduct(product);
    setEditForm({
      name: product.name || '',
      sku: product.sku || '',
      unit: product.unit || '',
      category: product.category || '',
      price: String(product.price ?? 0),
      weight: String(product.weight ?? 0),
      description: product.description || '',
      dimensionLength: product.dimensions?.length ? String(product.dimensions.length) : '',
      dimensionWidth: product.dimensions?.width ? String(product.dimensions.width) : '',
      dimensionHeight: product.dimensions?.height ? String(product.dimensions.height) : '',
      dimensionUnit: product.dimensions?.unit || '',
      imageUrlInput: '',
      imageUrls: product.images || [],
      active: product.isActive !== false,
    });
    setShowEditModal(true);
  };

  const submitCreate = async () => {
    if (!addForm.name.trim()) {
      Alert.alert('Missing Data', 'Product name is required');
      return;
    }
    if (!addForm.sku.trim()) {
      Alert.alert('Missing Data', 'SKU is required');
      return;
    }

    const payload = {
      name: addForm.name.trim(),
      sku: addForm.sku.trim(),
      unit: addForm.unit.trim(),
      description: addForm.description.trim(),
      category: addForm.category.trim(),
      price: Number(addForm.price) || 0,
      weight: Number(addForm.weight) || 0,
      dimensions: {
        length: Number(addForm.dimensionLength) || 0,
        width: Number(addForm.dimensionWidth) || 0,
        height: Number(addForm.dimensionHeight) || 0,
        unit: addForm.dimensionUnit.trim() || 'cm',
      },
      images: addForm.imageUrls,
      isActive: addForm.active,
    };

    try {
      setSubmitting(true);
      await createProduct(payload);
      setAddForm(EMPTY_FORM);
      setShowAddModal(false);
      fetchProducts(1);
      setCurrentPage(1);
      Alert.alert('Success', 'Product created successfully');
    } catch (err) {
      Alert.alert('Create Failed', err.response?.data?.message || 'Unable to create product');
    } finally {
      setSubmitting(false);
    }
  };

  const submitEdit = async () => {
    if (!selectedProduct?._id) return;
    if (!editForm.name.trim()) {
      Alert.alert('Missing Data', 'Product name is required');
      return;
    }
    if (!editForm.sku.trim()) {
      Alert.alert('Missing Data', 'SKU is required');
      return;
    }

    const payload = {
      name: editForm.name.trim(),
      sku: editForm.sku.trim(),
      unit: editForm.unit.trim(),
      description: editForm.description.trim(),
      category: editForm.category.trim(),
      price: Number(editForm.price) || 0,
      weight: Number(editForm.weight) || 0,
      dimensions: {
        length: Number(editForm.dimensionLength) || 0,
        width: Number(editForm.dimensionWidth) || 0,
        height: Number(editForm.dimensionHeight) || 0,
        unit: editForm.dimensionUnit.trim() || 'cm',
      },
      images: editForm.imageUrls,
      isActive: editForm.active,
    };

    try {
      setSubmitting(true);
      await updateProduct(selectedProduct._id, payload);
      setShowEditModal(false);
      setSelectedProduct(null);
      fetchProducts(currentPage);
      Alert.alert('Success', 'Product updated successfully');
    } catch (err) {
      Alert.alert('Update Failed', err.response?.data?.message || 'Unable to update product');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!selectedProduct?._id) return;
    try {
      setSubmitting(true);
      await deleteProduct(selectedProduct._id);
      setShowDeleteModal(false);
      setSelectedProduct(null);
      fetchProducts(currentPage);
      Alert.alert('Success', 'Product deleted successfully');
    } catch (err) {
      Alert.alert('Delete Failed', err.response?.data?.message || 'Unable to delete product');
    } finally {
      setSubmitting(false);
    }
  };

  const showingStart = products.length ? (currentPage - 1) * PAGE_SIZE + 1 : 0;
  const showingEnd = products.length ? showingStart + products.length - 1 : 0;

  const ProductModalForm = ({ title, form, setForm, primaryLabel, onPrimaryPress, onClose, showActiveToggle }) => (
    <View style={styles.modalCard}>
      <View style={styles.modalHeader}>
        <Text style={styles.modalTitle}>{title}</Text>
        <TouchableOpacity onPress={onClose} style={styles.modalCloseBtn}>
          <MaterialCommunityIcons name="close" size={20} color="#222" />
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.modalBody} contentContainerStyle={styles.modalBodyContent}>
        <View style={styles.formGrid}>
          <View style={styles.formCol}>
            <Text style={styles.inputLabel}>Name *</Text>
            <TextInput value={form.name} onChangeText={(v) => setForm({ ...form, name: v })} style={styles.inputBox} placeholder="Product name" placeholderTextColor="#999" />
          </View>
          <View style={styles.formCol}>
            <Text style={styles.inputLabel}>SKU *</Text>
            <TextInput value={form.sku} onChangeText={(v) => setForm({ ...form, sku: v })} style={styles.inputBox} placeholder="SKU" placeholderTextColor="#999" />
          </View>
          <View style={styles.formCol}>
            <Text style={styles.inputLabel}>Unit *</Text>
            <TextInput value={form.unit} onChangeText={(v) => setForm({ ...form, unit: v })} style={styles.inputBox} placeholder="e.g., pieces, kg" placeholderTextColor="#999" />
          </View>
          <View style={styles.formCol}>
            <Text style={styles.inputLabel}>Category *</Text>
            <TextInput value={form.category} onChangeText={(v) => setForm({ ...form, category: v })} style={styles.inputBox} placeholder="Category" placeholderTextColor="#999" />
          </View>
          <View style={styles.formCol}>
            <Text style={styles.inputLabel}>Price *</Text>
            <TextInput value={form.price} onChangeText={(v) => setForm({ ...form, price: v })} style={styles.inputBox} keyboardType="decimal-pad" placeholder="0" placeholderTextColor="#999" />
          </View>
          <View style={styles.formCol}>
            <Text style={styles.inputLabel}>Weight</Text>
            <TextInput value={form.weight} onChangeText={(v) => setForm({ ...form, weight: v })} style={styles.inputBox} keyboardType="decimal-pad" placeholder="0" placeholderTextColor="#999" />
          </View>
        </View>

        <Text style={styles.inputLabel}>Description</Text>
        <TextInput value={form.description} onChangeText={(v) => setForm({ ...form, description: v })} style={styles.textArea} multiline placeholder="Product description" placeholderTextColor="#999" />

        <Text style={styles.inputLabel}>Dimensions</Text>
        <View style={styles.dimensionRow}>
          <TextInput value={form.dimensionLength} onChangeText={(v) => setForm({ ...form, dimensionLength: v })} style={styles.dimensionInput} placeholder="Length" placeholderTextColor="#9a9a9a" keyboardType="decimal-pad" />
          <TextInput value={form.dimensionWidth} onChangeText={(v) => setForm({ ...form, dimensionWidth: v })} style={styles.dimensionInput} placeholder="Width" placeholderTextColor="#9a9a9a" keyboardType="decimal-pad" />
          <TextInput value={form.dimensionHeight} onChangeText={(v) => setForm({ ...form, dimensionHeight: v })} style={styles.dimensionInput} placeholder="Height" placeholderTextColor="#9a9a9a" keyboardType="decimal-pad" />
          <TextInput value={form.dimensionUnit} onChangeText={(v) => setForm({ ...form, dimensionUnit: v })} style={styles.dimensionInput} placeholder="Unit" placeholderTextColor="#9a9a9a" />
        </View>

        <Text style={styles.inputLabel}>Images</Text>
        <View style={styles.urlRow}>
          <TextInput value={form.imageUrlInput} onChangeText={(v) => setForm({ ...form, imageUrlInput: v })} style={[styles.inputBox, styles.urlInput]} placeholder="Paste image URL" placeholderTextColor="#9a9a9a" />
          <TouchableOpacity style={styles.secondaryMiniBtn} onPress={() => addImageUrlToForm(form, setForm)}>
            <Text style={styles.secondaryMiniBtnText}>Add URL</Text>
          </TouchableOpacity>
        </View>

        {form.imageUrls.length > 0 && (
          <View style={styles.urlPillContainer}>
            {form.imageUrls.map((url, idx) => (
              <View key={`${url}-${idx}`} style={styles.urlPill}>
                <Text style={styles.urlPillText} numberOfLines={1}>{url}</Text>
                <TouchableOpacity onPress={() => setForm({ ...form, imageUrls: form.imageUrls.filter((_, i) => i !== idx) })}>
                  <MaterialCommunityIcons name="close-circle" size={16} color="#c62828" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {showActiveToggle && (
          <View style={styles.activeRow}>
            <Switch value={form.active} onValueChange={(v) => setForm({ ...form, active: v })} trackColor={{ false: '#ccc', true: '#8db2ff' }} thumbColor={form.active ? '#2453e6' : '#f4f3f4'} />
            <Text style={styles.activeText}>Active</Text>
          </View>
        )}
      </ScrollView>
      <View style={styles.modalFooter}>
        <TouchableOpacity style={styles.primaryModalBtn} onPress={onPrimaryPress} disabled={submitting}>
          {submitting ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.primaryModalBtnText}>{primaryLabel}</Text>}
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelModalBtn} onPress={onClose}>
          <Text style={styles.cancelModalBtnText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <MaterialCommunityIcons name="package-variant" size={20} color={COLORS.textPrimary} style={styles.headerIcon} />
          <Text style={styles.headerTitle}>Product Management</Text>
        </View>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2453e6']}
            tintColor="#2453e6"
          />
        }
      >
        <View style={styles.innerContent}>
          <View style={styles.titleToolbar}>
            <View style={styles.titleBlock}>
              <Text style={styles.screenTitle}>Products</Text>
              <Text style={styles.screenSubtitle}>Manage products, their details, and inventory.</Text>
            </View>
          </View>

          <View style={styles.toolbar}>
            <View style={styles.filterButton}>
              <Text style={styles.filterButtonText}>All Products</Text>
              <MaterialCommunityIcons name="chevron-down" size={16} color={COLORS.textPrimary} />
            </View>
            <TouchableOpacity style={styles.createButton} activeOpacity={0.85} onPress={() => setShowAddModal(true)}>
              <MaterialCommunityIcons name="plus" size={17} color={COLORS.white} />
              <Text style={styles.createButtonText}>Add Product</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.stateBox}>
              <ActivityIndicator size="large" color="#2453e6" />
              <Text style={styles.stateText}>Loading products...</Text>
            </View>
          ) : error ? (
            <View style={styles.stateBox}>
              <MaterialCommunityIcons name="alert-circle-outline" size={40} color="#e53935" />
              <Text style={styles.stateText}>{error}</Text>
              <TouchableOpacity style={styles.retryBtn} onPress={() => fetchProducts(currentPage)}>
                <Text style={styles.retryBtnText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : products.length === 0 ? (
            <View style={styles.stateBox}>
              <MaterialCommunityIcons name="package-variant" size={40} color="#9e9e9e" />
              <Text style={styles.stateText}>No products found</Text>
            </View>
          ) : (
            <View style={styles.cardList}>
              {products.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onEdit={openEdit}
                  onDelete={(product) => { setSelectedProduct(product); setShowDeleteModal(true); }}
                />
              ))}
            </View>
          )}

          <Text style={styles.paginationSummary}>
            Showing {showingStart} to {showingEnd} of {totalItems} products
          </Text>
          <View style={styles.paginationRow}>
            <TouchableOpacity style={[styles.paginationButton, currentPage === 1 && styles.paginationButtonDisabled]} onPress={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} activeOpacity={0.85}>
              <Text style={[styles.paginationButtonText, currentPage === 1 && styles.paginationButtonTextDisabled]}>Previous</Text>
            </TouchableOpacity>
            <View style={styles.pageIndicator}>
              <Text style={styles.pageIndicatorText}>Page {currentPage} of {totalPages}</Text>
            </View>
            <TouchableOpacity style={[styles.paginationButton, currentPage === totalPages && styles.paginationButtonDisabled]} onPress={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} activeOpacity={0.85}>
              <Text style={[styles.paginationButtonText, currentPage === totalPages && styles.paginationButtonTextDisabled]}>Next</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <Modal visible={showAddModal} transparent animationType="fade" onRequestClose={() => setShowAddModal(false)}>
        <View style={styles.modalBackdrop}>
          <ProductModalForm
            title="Add New Product"
            form={addForm}
            setForm={setAddForm}
            primaryLabel="Create Product"
            onPrimaryPress={submitCreate}
            onClose={() => setShowAddModal(false)}
            showActiveToggle={true}
          />
        </View>
      </Modal>

      <Modal visible={showEditModal} transparent animationType="fade" onRequestClose={() => setShowEditModal(false)}>
        <View style={styles.modalBackdrop}>
          <ProductModalForm
            title="Edit Product"
            form={editForm}
            setForm={setEditForm}
            primaryLabel="Update Product"
            onPrimaryPress={submitEdit}
            onClose={() => setShowEditModal(false)}
            showActiveToggle={true}
          />
        </View>
      </Modal>

      <Modal visible={showDeleteModal} transparent animationType="fade" onRequestClose={() => setShowDeleteModal(false)}>
        <View style={styles.modalBackdropCenter}>
          <View style={styles.confirmCard}>
            <Text style={styles.confirmTitle}>Confirm Delete</Text>
            <Text style={styles.confirmMessage}>
              Are you sure you want to delete the product "{selectedProduct?.name}"? This action cannot be undone.
            </Text>
            <View style={styles.confirmActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowDeleteModal(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteBtn} onPress={confirmDelete} disabled={submitting}>
                {submitting ? <ActivityIndicator size="small" color="#e53935" /> : <Text style={styles.deleteBtnText}>Delete</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  header: { paddingHorizontal: SPACING.xl, paddingVertical: SPACING.lg, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.gray200 },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center' },
  headerIcon: { marginRight: SPACING.md },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  content: { flex: 1, backgroundColor: '#fcfcfa' },
  innerContent: { paddingHorizontal: 16, paddingTop: 22, paddingBottom: 40 },
  titleToolbar: { marginBottom: 4 },
  titleBlock: {},
  screenTitle: { fontSize: 22, fontWeight: '700', color: '#161616' },
  screenSubtitle: { marginTop: 3, fontSize: 13, lineHeight: 19, color: '#6d6d6d' },
  toolbar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, marginBottom: 14 },
  filterButton: { height: 36, borderRadius: 10, borderWidth: 1, borderColor: '#dfdfdf', backgroundColor: COLORS.white, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 6 },
  filterButtonText: { fontSize: 13, fontWeight: '500', color: '#151515' },
  createButton: { height: 36, borderRadius: 10, backgroundColor: '#2453e6', paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 5 },
  createButtonText: { fontSize: 13, fontWeight: '600', color: COLORS.white },
  cardList: { gap: 10 },
  productCard: { backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.lg, borderWidth: 1, borderColor: COLORS.gray200, padding: 14 },
  cardRow1: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  productInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  productImage: { width: 52, height: 52, borderRadius: 8, marginRight: 12 },
  productImagePlaceholder: { width: 52, height: 52, borderRadius: 8, backgroundColor: '#f6f6f6', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  productDetails: { flex: 1 },
  productName: { fontSize: 16, fontWeight: '700', color: '#151515' },
  productSku: { fontSize: 13, color: '#676767', marginTop: 2 },
  statusBadge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  badgeActive: { backgroundColor: '#2453e6' },
  badgeInactive: { backgroundColor: '#fce4ec' },
  statusBadgeText: { fontSize: 12, fontWeight: '600' },
  badgeTextActive: { color: COLORS.white },
  badgeTextInactive: { color: '#c62828' },
  cardMetaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  cardMeta: { fontSize: 13, color: '#555' },
  dot: { fontSize: 13, color: '#ccc' },
  cardActions: { flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 8 },
  iconBtn: { width: 34, height: 34, borderRadius: 8, borderWidth: 1, borderColor: '#dfdfdf', backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center' },
  stateBox: { padding: 40, alignItems: 'center', justifyContent: 'center' },
  stateText: { marginTop: 12, fontSize: 14, color: '#6d6d6d', textAlign: 'center' },
  retryBtn: { marginTop: 12, paddingHorizontal: 20, paddingVertical: 8, borderRadius: 8, backgroundColor: '#2453e6' },
  retryBtnText: { fontSize: 14, fontWeight: '600', color: COLORS.white },
  paginationSummary: { marginTop: 24, fontSize: 14, color: '#6d6d6d' },
  paginationRow: { marginTop: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  paginationButton: { minWidth: 80, height: 32, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1, borderColor: '#dfdfdf', backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center' },
  paginationButtonDisabled: { backgroundColor: '#fbfbfb' },
  paginationButtonText: { fontSize: 14, fontWeight: '600', color: '#111111' },
  paginationButtonTextDisabled: { color: '#a6a6a6' },
  pageIndicator: { minWidth: 120, height: 36, borderRadius: 8, borderWidth: 1, borderColor: '#dfdfdf', backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center' },
  pageIndicatorText: { fontSize: 14, fontWeight: '600', color: '#151515' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', padding: 10, justifyContent: 'center' },
  modalCard: { maxHeight: '94%', backgroundColor: COLORS.white, borderRadius: 16, borderWidth: 1, borderColor: '#dcdcdc', overflow: 'hidden' },
  modalHeader: { minHeight: 56, borderBottomWidth: 1, borderBottomColor: '#ececec', paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  modalTitle: { fontSize: 32, fontWeight: '700', color: '#111' },
  modalCloseBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  modalBody: { flex: 1 },
  modalBodyContent: { padding: 14, paddingBottom: 24 },
  formGrid: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 14, rowGap: 10 },
  formCol: { width: '48%' },
  inputLabel: { fontSize: 16, fontWeight: '600', color: '#222', marginBottom: 8, marginTop: 2 },
  inputBox: { minHeight: 46, borderRadius: 12, borderWidth: 1, borderColor: '#d6d6d6', backgroundColor: '#fff', paddingHorizontal: 12, fontSize: 17, color: '#111' },
  textArea: { minHeight: 76, borderRadius: 12, borderWidth: 1, borderColor: '#d6d6d6', backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, color: '#111', textAlignVertical: 'top' },
  dimensionRow: { flexDirection: 'row', gap: 10 },
  dimensionInput: { flex: 1, minHeight: 44, borderRadius: 12, borderWidth: 1, borderColor: '#d6d6d6', backgroundColor: '#fff', paddingHorizontal: 12, fontSize: 16, color: '#111' },
  urlRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  urlInput: { flex: 1 },
  secondaryMiniBtn: { minHeight: 40, borderRadius: 12, borderWidth: 1, borderColor: '#d3d3d3', paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  secondaryMiniBtnText: { fontSize: 16, fontWeight: '600', color: '#222' },
  urlPillContainer: { marginTop: 10, gap: 6 },
  urlPill: { minHeight: 34, borderRadius: 8, backgroundColor: '#f4f4f4', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 10, gap: 8 },
  urlPillText: { flex: 1, fontSize: 12, color: '#444' },
  activeRow: { marginTop: 10, flexDirection: 'row', alignItems: 'center', gap: 10 },
  activeText: { fontSize: 18, fontWeight: '500', color: '#111' },
  modalFooter: { borderTopWidth: 1, borderTopColor: '#ececec', padding: 12, flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  primaryModalBtn: { minHeight: 40, borderRadius: 12, backgroundColor: '#2453e6', paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center' },
  primaryModalBtnText: { fontSize: 17, fontWeight: '700', color: COLORS.white },
  cancelModalBtn: { minHeight: 40, borderRadius: 12, borderWidth: 1, borderColor: '#d2d2d2', backgroundColor: '#fff', paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center' },
  cancelModalBtnText: { fontSize: 17, color: '#111' },
  modalBackdropCenter: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center', padding: 16 },
  confirmCard: { width: '94%', maxWidth: 760, backgroundColor: COLORS.white, borderRadius: 22, borderWidth: 1, borderColor: '#d8d8d8', overflow: 'hidden', padding: 24 },
  confirmTitle: { fontSize: 46, fontWeight: '700', color: '#111' },
  confirmMessage: { marginTop: 18, fontSize: 24, lineHeight: 34, color: '#6d6d6d' },
  confirmActions: { marginTop: 22, flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  cancelBtn: { minHeight: 48, borderRadius: 14, borderWidth: 1, borderColor: '#d2d2d2', backgroundColor: '#fff', paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center' },
  cancelBtnText: { fontSize: 22, color: '#111' },
  deleteBtn: { minHeight: 48, borderRadius: 14, backgroundColor: '#fbe8e8', paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center' },
  deleteBtnText: { fontSize: 22, fontWeight: '600', color: '#e53935' },
});