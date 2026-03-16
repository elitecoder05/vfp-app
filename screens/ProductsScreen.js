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

function Thumb({ images }) {
  if (images && images.length > 0) {
    return (
      <View style={styles.thumbBox}>
        <Image source={{ uri: images[0] }} style={styles.thumbImg} />
      </View>
    );
  }
  return <View style={styles.thumbBox}><Text style={styles.thumbDash}>—</Text></View>;
}

function ActiveBadge({ isActive }) {
  return (
    <View style={[styles.badge, isActive ? styles.badgeActive : styles.badgeInactive]}>
      <Text style={[styles.badgeText, isActive ? styles.badgeTextActive : styles.badgeTextInactive]}>{isActive ? 'Active' : 'Inactive'}</Text>
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
  const [uploadingImage, setUploadingImage] = useState(false);

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

  const formatPrice = (value) => `₹${Number(value || 0).toFixed(2)}`;

  const uploadImage = async (imageUri) => {
    try {
      setUploadingImage(true);
      const fileName = imageUri.split('/').pop() || `image_${Date.now()}.jpg`;
      const fileType = 'image/jpeg';
      
      const uploadData = await generateUploadUrl(fileName, fileType, 'products');
      
      // Upload to S3
      const response = await fetch(uploadData.uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': fileType,
        },
        body: await fetch(imageUri).then(r => r.blob()),
      });
      
      if (response.ok) {
        return uploadData.fileUrl;
      }
      throw new Error('Upload failed');
    } catch (err) {
      console.error('Error uploading image:', err);
      Alert.alert('Upload Failed', 'Failed to upload image');
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

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
          <View style={styles.titleRow}>
            <View>
              <Text style={styles.screenTitle}>Products</Text>
              <Text style={styles.screenSubtitle}>Manage products, their details, and inventory.</Text>
            </View>
            <TouchableOpacity style={styles.addButton} activeOpacity={0.85} onPress={() => setShowAddModal(true)}>
              <MaterialCommunityIcons name="plus" size={17} color={COLORS.white} />
              <Text style={styles.addButtonText}>Add Product</Text>
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
            <View style={styles.tableCard}>
              <ScrollView horizontal showsHorizontalScrollIndicator>
                <View>
                  <View style={styles.tableHeaderRow}>
                    <Text style={[styles.tableHeaderText, styles.imageCol]}>Image</Text>
                    <Text style={[styles.tableHeaderText, styles.nameCol]}>Name</Text>
                    <Text style={[styles.tableHeaderText, styles.skuCol]}>SKU</Text>
                    <Text style={[styles.tableHeaderText, styles.categoryCol]}>Category</Text>
                    <Text style={[styles.tableHeaderText, styles.priceCol]}>Price</Text>
                    <Text style={[styles.tableHeaderText, styles.statusCol]}>Status</Text>
                    <Text style={[styles.tableHeaderText, styles.actionCol]}>Actions</Text>
                  </View>
                  {products.map((product) => (
                    <View key={product._id} style={styles.tableBodyRow}>
                      <View style={[styles.imageCol, styles.imageColWrap]}>
                        <Thumb images={product.images} />
                      </View>
                      <Text style={[styles.tableBodyTextStrong, styles.nameCol]}>{product.name}</Text>
                      <Text style={[styles.tableBodyTextMuted, styles.skuCol]}>{product.sku}</Text>
                      <Text style={[styles.tableBodyTextMuted, styles.categoryCol]}>{product.category}</Text>
                      <Text style={[styles.tableBodyTextStrong, styles.priceCol]}>{formatPrice(product.price)}</Text>
                      <View style={styles.statusCol}>
                        <ActiveBadge isActive={product.isActive} />
                      </View>
                      <View style={[styles.actionCol, styles.actionRow]}>
                        <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7} onPress={() => openEdit(product)}>
                          <MaterialCommunityIcons name="pencil-outline" size={16} color="#555" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7} onPress={() => { setSelectedProduct(product); setShowDeleteModal(true); }}>
                          <MaterialCommunityIcons name="trash-can-outline" size={16} color="#e53935" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}

          <Text style={styles.paginationSummary}>Showing {showingStart} to {showingEnd} of {totalItems} products</Text>
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
          <View style={styles.deleteModalCard}>
            <Text style={styles.deleteTitle}>Confirm Delete</Text>
            <Text style={styles.deleteMessage}>Are you sure you want to delete the product "{selectedProduct?.name}"? This action cannot be undone.</Text>
            <View style={styles.deleteActionRow}>
              <TouchableOpacity style={styles.cancelModalBtn} onPress={() => setShowDeleteModal(false)}>
                <Text style={styles.cancelModalBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteConfirmBtn} onPress={confirmDelete} disabled={submitting}>
                {submitting ? <ActivityIndicator size="small" color="#e53935" /> : <Text style={styles.deleteConfirmBtnText}>Delete</Text>}
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
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  screenTitle: { fontSize: 22, fontWeight: '700', color: '#161616' },
  screenSubtitle: { marginTop: 3, fontSize: 13, color: '#6d6d6d' },
  addButton: { height: 36, borderRadius: 10, backgroundColor: '#2453e6', paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  addButtonText: { fontSize: 13, fontWeight: '600', color: COLORS.white },
  stateBox: { padding: 40, alignItems: 'center', justifyContent: 'center' },
  stateText: { marginTop: 12, fontSize: 14, color: '#6d6d6d', textAlign: 'center' },
  retryBtn: { marginTop: 12, paddingHorizontal: 20, paddingVertical: 8, borderRadius: 8, backgroundColor: '#2453e6' },
  retryBtnText: { fontSize: 14, fontWeight: '600', color: COLORS.white },
  tableCard: { backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.xl, borderWidth: 1, borderColor: COLORS.gray200, overflow: 'hidden' },
  tableHeaderRow: { flexDirection: 'row', alignItems: 'center', minHeight: 52, borderBottomWidth: 1, borderBottomColor: COLORS.gray200, backgroundColor: '#fff', paddingHorizontal: 10 },
  tableBodyRow: { flexDirection: 'row', alignItems: 'center', minHeight: 74, borderBottomWidth: 1, borderBottomColor: COLORS.gray200, paddingHorizontal: 10, backgroundColor: '#fff' },
  tableHeaderText: { fontSize: 15, fontWeight: '700', color: '#222' },
  tableBodyTextStrong: { fontSize: 15, fontWeight: '600', color: '#222' },
  tableBodyTextMuted: { fontSize: 15, color: '#676767' },
  imageCol: { width: 74 },
  nameCol: { width: 210 },
  skuCol: { width: 160 },
  categoryCol: { width: 160 },
  priceCol: { width: 120 },
  statusCol: { width: 126 },
  actionCol: { width: 120 },
  imageColWrap: { justifyContent: 'center' },
  thumbBox: { width: 52, height: 52, borderRadius: 8, borderWidth: 1, borderColor: '#dfdfdf', backgroundColor: '#f6f6f6', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginRight: 12 },
  thumbImg: { width: '100%', height: '100%' },
  thumbDash: { fontSize: 20, color: '#aaa' },
  badge: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  badgeActive: { backgroundColor: '#2453e6' },
  badgeInactive: { backgroundColor: '#fce4ec' },
  badgeText: { fontSize: 12, fontWeight: '700' },
  badgeTextActive: { color: COLORS.white },
  badgeTextInactive: { color: '#c62828' },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  iconBtn: { width: 30, height: 30, borderRadius: 7, borderWidth: 1, borderColor: '#dfdfdf', backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center' },
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
  deleteModalCard: { width: '94%', maxWidth: 760, backgroundColor: COLORS.white, borderRadius: 22, borderWidth: 1, borderColor: '#d8d8d8', overflow: 'hidden', padding: 24 },
  deleteTitle: { fontSize: 46, fontWeight: '700', color: '#111' },
  deleteMessage: { marginTop: 18, fontSize: 24, lineHeight: 34, color: '#6d6d6d' },
  deleteActionRow: { marginTop: 22, flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  deleteConfirmBtn: { minHeight: 48, borderRadius: 14, backgroundColor: '#fbe8e8', paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center' },
  deleteConfirmBtnText: { fontSize: 22, fontWeight: '600', color: '#e53935' },
});