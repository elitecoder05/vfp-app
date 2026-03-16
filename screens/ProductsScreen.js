import React, { useMemo, useState } from 'react';
import { Image, Modal, SafeAreaView, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { BORDER_RADIUS, COLORS, SPACING } from '../constants/theme';

const PAGE_SIZE = 10;

const INITIAL_PRODUCT_ROWS = [
  { id: 'PROD0018', name: 'Product 18', imageType: 'icon', category: 'Sports', price: 473, status: 'Active', unit: 'CTN', weight: '30', description: 'Description for Product 18', dimensionLength: '98', dimensionWidth: '103', dimensionHeight: '73', dimensionUnit: 'cm', imageUrls: [] },
  { id: 'PROD0019', name: 'Product 19', imageType: 'empty', category: 'Books', price: 959, status: 'Active', unit: 'CTN', weight: '20', description: 'Description for Product 19', dimensionLength: '50', dimensionWidth: '50', dimensionHeight: '50', dimensionUnit: 'cm', imageUrls: [] },
  { id: 'PROD0020', name: 'Product 20', imageType: 'photo', category: 'Home & Garden', price: 901, status: 'Active', unit: 'liters', weight: '10', description: 'Description for Product 20', dimensionLength: '20', dimensionWidth: '10', dimensionHeight: '15', dimensionUnit: 'cm', imageUrls: [] },
  { id: 'PROD0017', name: 'Product 17', imageType: 'empty', category: 'Toys', price: 705, status: 'Active', unit: 'PCS', weight: '8', description: '', dimensionLength: '', dimensionWidth: '', dimensionHeight: '', dimensionUnit: '', imageUrls: [] },
  { id: 'PROD0016', name: 'Product 16', imageType: 'empty', category: 'Electronics', price: 287, status: 'Active', unit: 'PCS', weight: '6', description: '', dimensionLength: '', dimensionWidth: '', dimensionHeight: '', dimensionUnit: '', imageUrls: [] },
  { id: 'PROD0015', name: 'Product 15', imageType: 'empty', category: 'Home & Garden', price: 262, status: 'Active', unit: 'PCS', weight: '5', description: '', dimensionLength: '', dimensionWidth: '', dimensionHeight: '', dimensionUnit: '', imageUrls: [] },
  { id: 'PROD0014', name: 'Product 14', imageType: 'empty', category: 'Automotive', price: 871, status: 'Active', unit: 'PCS', weight: '12', description: '', dimensionLength: '', dimensionWidth: '', dimensionHeight: '', dimensionUnit: '', imageUrls: [] },
  { id: 'PROD0013', name: 'Product 13', imageType: 'empty', category: 'Toys', price: 223, status: 'Active', unit: 'PCS', weight: '4', description: '', dimensionLength: '', dimensionWidth: '', dimensionHeight: '', dimensionUnit: '', imageUrls: [] },
  { id: 'PROD0012', name: 'Product 12', imageType: 'empty', category: 'Books', price: 450, status: 'Active', unit: 'PCS', weight: '3', description: '', dimensionLength: '', dimensionWidth: '', dimensionHeight: '', dimensionUnit: '', imageUrls: [] },
  { id: 'PROD0011', name: 'Product 11', imageType: 'empty', category: 'Electronics', price: 670, status: 'Active', unit: 'PCS', weight: '5', description: '', dimensionLength: '', dimensionWidth: '', dimensionHeight: '', dimensionUnit: '', imageUrls: [] },
  { id: 'PROD0010', name: 'Product 10', imageType: 'empty', category: 'Sports', price: 380, status: 'Inactive', unit: 'PCS', weight: '6', description: '', dimensionLength: '', dimensionWidth: '', dimensionHeight: '', dimensionUnit: '', imageUrls: [] },
  { id: 'PROD0009', name: 'Product 9', imageType: 'empty', category: 'Toys', price: 520, status: 'Active', unit: 'PCS', weight: '5', description: '', dimensionLength: '', dimensionWidth: '', dimensionHeight: '', dimensionUnit: '', imageUrls: [] },
  { id: 'PROD0008', name: 'Product 8', imageType: 'empty', category: 'Beauty', price: 195, status: 'Active', unit: 'PCS', weight: '3', description: '', dimensionLength: '', dimensionWidth: '', dimensionHeight: '', dimensionUnit: '', imageUrls: [] },
  { id: 'PROD0007', name: 'Product 7', imageType: 'empty', category: 'Automotive', price: 840, status: 'Active', unit: 'PCS', weight: '7', description: '', dimensionLength: '', dimensionWidth: '', dimensionHeight: '', dimensionUnit: '', imageUrls: [] },
  { id: 'PROD0006', name: 'Product 6', imageType: 'empty', category: 'Home & Garden', price: 310, status: 'Active', unit: 'PCS', weight: '4', description: '', dimensionLength: '', dimensionWidth: '', dimensionHeight: '', dimensionUnit: '', imageUrls: [] },
  { id: 'PROD0005', name: 'Product 5', imageType: 'empty', category: 'Electronics', price: 990, status: 'Inactive', unit: 'PCS', weight: '9', description: '', dimensionLength: '', dimensionWidth: '', dimensionHeight: '', dimensionUnit: '', imageUrls: [] },
  { id: 'PROD0004', name: 'Product 4', imageType: 'empty', category: 'Books', price: 175, status: 'Active', unit: 'PCS', weight: '2', description: '', dimensionLength: '', dimensionWidth: '', dimensionHeight: '', dimensionUnit: '', imageUrls: [] },
  { id: 'PROD0003', name: 'Product 3', imageType: 'empty', category: 'Toys', price: 655, status: 'Active', unit: 'PCS', weight: '5', description: '', dimensionLength: '', dimensionWidth: '', dimensionHeight: '', dimensionUnit: '', imageUrls: [] },
  { id: 'PROD0002', name: 'Product 2', imageType: 'empty', category: 'Sports', price: 430, status: 'Active', unit: 'PCS', weight: '4', description: '', dimensionLength: '', dimensionWidth: '', dimensionHeight: '', dimensionUnit: '', imageUrls: [] },
  { id: 'PROD0001', name: 'Product 1', imageType: 'empty', category: 'Beauty', price: 280, status: 'Active', unit: 'PCS', weight: '3', description: '', dimensionLength: '', dimensionWidth: '', dimensionHeight: '', dimensionUnit: '', imageUrls: [] },
];

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

function Thumb({ imageType }) {
  if (imageType === 'photo') {
    return (
      <View style={styles.thumbBox}>
        <Image source={{ uri: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=120&q=80' }} style={styles.thumbImg} />
      </View>
    );
  }
  if (imageType === 'icon') {
    return <View style={styles.thumbBox}><MaterialCommunityIcons name="truck-fast-outline" size={26} color="#90a4c6" /></View>;
  }
  return <View style={styles.thumbBox}><Text style={styles.thumbDash}>—</Text></View>;
}

function ActiveBadge({ status }) {
  const active = status === 'Active';
  return (
    <View style={[styles.badge, active ? styles.badgeActive : styles.badgeInactive]}>
      <Text style={[styles.badgeText, active ? styles.badgeTextActive : styles.badgeTextInactive]}>{status}</Text>
    </View>
  );
}

export default function ProductsScreen() {
  const [products, setProducts] = useState(INITIAL_PRODUCT_ROWS);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [addForm, setAddForm] = useState(EMPTY_FORM);
  const [editForm, setEditForm] = useState(EMPTY_FORM);

  const totalPages = Math.max(1, Math.ceil(products.length / PAGE_SIZE));
  const pageStart  = (currentPage - 1) * PAGE_SIZE;
  const pageRows   = useMemo(() => products.slice(pageStart, pageStart + PAGE_SIZE), [products, pageStart]);
  const showingStart = pageRows.length ? pageStart + 1 : 0;
  const showingEnd   = Math.min(pageStart + PAGE_SIZE, products.length);

  const formatPrice = (value) => `₹${Number(value || 0).toFixed(2)}`;

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
      name: product.name,
      sku: product.id,
      unit: product.unit || '',
      category: product.category || '',
      price: String(product.price ?? 0),
      weight: String(product.weight ?? 0),
      description: product.description || '',
      dimensionLength: product.dimensionLength || '',
      dimensionWidth: product.dimensionWidth || '',
      dimensionHeight: product.dimensionHeight || '',
      dimensionUnit: product.dimensionUnit || '',
      imageUrlInput: '',
      imageUrls: product.imageUrls || [],
      active: product.status !== 'Inactive',
    });
    setShowEditModal(true);
  };

  const submitCreate = () => {
    const sku = addForm.sku.trim() || `PROD${String(products.length + 1).padStart(4, '0')}`;
    const next = {
      id: sku,
      name: addForm.name.trim() || 'New Product',
      imageType: addForm.imageUrls.length ? 'photo' : 'empty',
      category: addForm.category.trim() || 'General',
      price: Number(addForm.price || 0),
      status: addForm.active ? 'Active' : 'Inactive',
      unit: addForm.unit.trim(),
      weight: addForm.weight,
      description: addForm.description,
      dimensionLength: addForm.dimensionLength,
      dimensionWidth: addForm.dimensionWidth,
      dimensionHeight: addForm.dimensionHeight,
      dimensionUnit: addForm.dimensionUnit,
      imageUrls: addForm.imageUrls,
    };
    setProducts((prev) => [next, ...prev]);
    setAddForm(EMPTY_FORM);
    setShowAddModal(false);
    setCurrentPage(1);
  };

  const submitEdit = () => {
    if (!selectedProduct) return;
    setProducts((prev) =>
      prev.map((row) =>
        row.id === selectedProduct.id
          ? {
              ...row,
              id: editForm.sku.trim() || row.id,
              name: editForm.name.trim() || row.name,
              category: editForm.category.trim() || row.category,
              price: Number(editForm.price || 0),
              status: editForm.active ? 'Active' : 'Inactive',
              unit: editForm.unit,
              weight: editForm.weight,
              description: editForm.description,
              dimensionLength: editForm.dimensionLength,
              dimensionWidth: editForm.dimensionWidth,
              dimensionHeight: editForm.dimensionHeight,
              dimensionUnit: editForm.dimensionUnit,
              imageUrls: editForm.imageUrls,
              imageType: editForm.imageUrls.length ? 'photo' : row.imageType,
            }
          : row
      )
    );
    setShowEditModal(false);
    setSelectedProduct(null);
  };

  const confirmDelete = () => {
    if (!selectedProduct) return;
    setProducts((prev) => prev.filter((row) => row.id !== selectedProduct.id));
    setShowDeleteModal(false);
    setSelectedProduct(null);
  };

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
            <TextInput value={form.name} onChangeText={(v) => setForm({ ...form, name: v })} style={styles.inputBox} />
          </View>
          <View style={styles.formCol}>
            <Text style={styles.inputLabel}>SKU *</Text>
            <TextInput value={form.sku} onChangeText={(v) => setForm({ ...form, sku: v })} style={styles.inputBox} />
          </View>
          <View style={styles.formCol}>
            <Text style={styles.inputLabel}>Unit *</Text>
            <TextInput value={form.unit} onChangeText={(v) => setForm({ ...form, unit: v })} style={styles.inputBox} />
          </View>
          <View style={styles.formCol}>
            <Text style={styles.inputLabel}>Category *</Text>
            <TextInput value={form.category} onChangeText={(v) => setForm({ ...form, category: v })} style={styles.inputBox} />
          </View>
          <View style={styles.formCol}>
            <Text style={styles.inputLabel}>Price *</Text>
            <TextInput value={form.price} onChangeText={(v) => setForm({ ...form, price: v })} style={styles.inputBox} keyboardType="decimal-pad" />
          </View>
          <View style={styles.formCol}>
            <Text style={styles.inputLabel}>Weight</Text>
            <TextInput value={form.weight} onChangeText={(v) => setForm({ ...form, weight: v })} style={styles.inputBox} keyboardType="decimal-pad" />
          </View>
        </View>

        <Text style={styles.inputLabel}>Description</Text>
        <TextInput value={form.description} onChangeText={(v) => setForm({ ...form, description: v })} style={styles.textArea} multiline />

        <Text style={styles.inputLabel}>Dimensions</Text>
        <View style={styles.dimensionRow}>
          <TextInput value={form.dimensionLength} onChangeText={(v) => setForm({ ...form, dimensionLength: v })} style={styles.dimensionInput} placeholder="Length" placeholderTextColor="#9a9a9a" />
          <TextInput value={form.dimensionWidth} onChangeText={(v) => setForm({ ...form, dimensionWidth: v })} style={styles.dimensionInput} placeholder="Width" placeholderTextColor="#9a9a9a" />
          <TextInput value={form.dimensionHeight} onChangeText={(v) => setForm({ ...form, dimensionHeight: v })} style={styles.dimensionInput} placeholder="Height" placeholderTextColor="#9a9a9a" />
          <TextInput value={form.dimensionUnit} onChangeText={(v) => setForm({ ...form, dimensionUnit: v })} style={styles.dimensionInput} placeholder="Unit" placeholderTextColor="#9a9a9a" />
        </View>

        <Text style={styles.inputLabel}>Images</Text>
        <View style={styles.urlRow}>
          <TextInput value={form.imageUrlInput} onChangeText={(v) => setForm({ ...form, imageUrlInput: v })} style={[styles.inputBox, styles.urlInput]} placeholder="Paste image URL" placeholderTextColor="#9a9a9a" />
          <TouchableOpacity style={styles.secondaryMiniBtn} onPress={() => addImageUrlToForm(form, setForm)}>
            <Text style={styles.secondaryMiniBtnText}>Add URL</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.fileInputMock} activeOpacity={0.9}>
          <Text style={styles.fileInputMockText}>Choose Files  </Text>
          <Text style={styles.fileInputMockSub}>No file chosen</Text>
        </TouchableOpacity>

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
        <TouchableOpacity style={styles.primaryModalBtn} onPress={onPrimaryPress}>
          <Text style={styles.primaryModalBtnText}>{primaryLabel}</Text>
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

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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
                {pageRows.map((product) => (
                  <View key={product.id} style={styles.tableBodyRow}>
                    <View style={[styles.imageCol, styles.imageColWrap]}>
                      <Thumb imageType={product.imageType} />
                    </View>
                    <Text style={[styles.tableBodyTextStrong, styles.nameCol]}>{product.name}</Text>
                    <Text style={[styles.tableBodyTextMuted, styles.skuCol]}>{product.id}</Text>
                    <Text style={[styles.tableBodyTextMuted, styles.categoryCol]}>{product.category}</Text>
                    <Text style={[styles.tableBodyTextStrong, styles.priceCol]}>{formatPrice(product.price)}</Text>
                    <View style={styles.statusCol}>
                      <ActiveBadge status={product.status} />
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

          <Text style={styles.paginationSummary}>Showing {showingStart} to {showingEnd} of {products.length} products</Text>
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
              <TouchableOpacity style={styles.deleteConfirmBtn} onPress={confirmDelete}>
                <Text style={styles.deleteConfirmBtnText}>Delete</Text>
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
  fileInputMock: { marginTop: 10, minHeight: 44, borderRadius: 10, borderWidth: 1, borderColor: '#d6d6d6', backgroundColor: '#fafafa', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10 },
  fileInputMockText: { fontSize: 17, fontWeight: '600', color: '#111' },
  fileInputMockSub: { fontSize: 17, color: '#333' },
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