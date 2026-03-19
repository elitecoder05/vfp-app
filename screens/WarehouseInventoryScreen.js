import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { createInventory, deleteInventory, getInventory, updateInventory } from '../api/api-methods';
import { BORDER_RADIUS, COLORS, SPACING } from '../constants/theme';

const PAGE_SIZE = 10;
const ITEM_TYPES = ['Product', 'Raw Material'];

const toTitleCase = (value = '') =>
  value
    .toString()
    .split('_')
    .map((part) => (part ? part.charAt(0).toUpperCase() + part.slice(1).toLowerCase() : ''))
    .join(' ');

const mapInventoryItem = (row) => ({
  id: row._id,
  warehouseId: row.warehouse_id?._id || '',
  warehouse: row.warehouse_id?.name || 'N/A',
  itemType: toTitleCase(row.item_type),
  itemId: row.item_id || '',
  itemName: row.itemName || 'N/A',
  itemCode: row.sku || 'N/A',
  unit: row.unit || '',
  stock: Number(row.stock_quantity || 0),
  reserved: Number(row.reserved_quantity || 0),
  minStock: Number(row.min_stock_level || 0),
  maxStock: Number(row.max_stock_level || 0),
});

const toInventoryPayload = (form) => ({
  warehouse_id: form.warehouseId.trim(),
  item_type: form.itemType.toLowerCase().replace(' ', '_'),
  item_id: form.itemId.trim(),
  itemName: form.itemName.trim(),
  sku: form.itemCode.trim().toUpperCase(),
  stock_quantity: Number(form.stock || 0),
  reserved_quantity: Number(form.reserved || 0),
  min_stock_level: Number(form.minStock || 0),
  max_stock_level: Number(form.maxStock || 0),
});

const EMPTY_FORM = {
  warehouseId: '',
  warehouse: '',
  itemType: 'Product',
  itemId: '',
  itemName: '',
  itemCode: '',
  stock: '0',
  reserved: '0',
  minStock: '10',
  maxStock: '0',
};

function getStatus(stock, minStock) {
  return stock <= minStock ? 'Low Stock' : 'In Stock';
}

function StatusBadge({ stock, minStock }) {
  const inStock = getStatus(stock, minStock) === 'In Stock';
  const status = inStock ? 'In Stock' : 'Low Stock';

  return (
    <View style={[styles.badge, inStock ? styles.badgeInStock : styles.badgeLowStock]}>
      <Text style={[styles.badgeText, inStock ? styles.badgeTextInStock : styles.badgeTextLowStock]}>{status}</Text>
    </View>
  );
}

function InventoryFormModal({
  title,
  form,
  setForm,
  primaryLabel,
  onPrimaryPress,
  onClose,
  submitting,
  compact,
}) {
  const [showItemTypeOptions, setShowItemTypeOptions] = useState(false);

  return (
    <View style={[styles.formModalCard, compact && styles.formModalCardCompact]}>
      <View style={styles.formModalHeader}>
        <Text style={[styles.formModalTitle, compact && styles.formModalTitleCompact]}>{title}</Text>
        <TouchableOpacity onPress={onClose} activeOpacity={0.8}>
          <MaterialCommunityIcons name="close" size={22} color="#1f1f1f" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.formModalBody} contentContainerStyle={styles.formModalBodyContent}>
        <Text style={styles.formLabel}>Warehouse ID *</Text>
        <TextInput
          value={form.warehouseId}
          onChangeText={(value) => setForm((current) => ({ ...current, warehouseId: value }))}
          style={styles.formInput}
          placeholder="Enter warehouse id"
          placeholderTextColor="#9d9d9d"
        />

        <Text style={styles.formLabel}>Warehouse Name *</Text>
        <TextInput
          value={form.warehouse}
          onChangeText={(value) => setForm((current) => ({ ...current, warehouse: value }))}
          style={styles.formInput}
          placeholder="Enter warehouse name"
          placeholderTextColor="#9d9d9d"
        />

        <Text style={styles.formLabel}>Item Type</Text>
        <View style={styles.dropdownWrap}>
          <TouchableOpacity
            style={styles.selectTrigger}
            activeOpacity={0.85}
            onPress={() => setShowItemTypeOptions((open) => !open)}
          >
            <Text style={styles.selectTriggerText}>{form.itemType}</Text>
            <MaterialCommunityIcons
              name={showItemTypeOptions ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#6e6e6e"
            />
          </TouchableOpacity>
          {showItemTypeOptions ? (
            <View style={styles.optionList}>
              {ITEM_TYPES.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={styles.optionItem}
                  onPress={() => {
                    setForm((current) => ({ ...current, itemType: type }));
                    setShowItemTypeOptions(false);
                  }}
                >
                  <Text style={styles.optionItemText}>{type}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : null}
        </View>

        <Text style={styles.formLabel}>Item ID *</Text>
        <TextInput
          value={form.itemId}
          onChangeText={(value) => setForm((current) => ({ ...current, itemId: value }))}
          style={styles.formInput}
          placeholder="Enter item id"
          placeholderTextColor="#9d9d9d"
        />

        <Text style={styles.formLabel}>Item Name *</Text>
        <TextInput
          value={form.itemName}
          onChangeText={(value) => setForm((current) => ({ ...current, itemName: value }))}
          style={styles.formInput}
          placeholder="Enter item name"
          placeholderTextColor="#9d9d9d"
        />

        <Text style={styles.formLabel}>Item Code *</Text>
        <TextInput
          value={form.itemCode}
          onChangeText={(value) => setForm((current) => ({ ...current, itemCode: value }))}
          style={styles.formInput}
          placeholder="Enter item code"
          placeholderTextColor="#9d9d9d"
          autoCapitalize="characters"
        />

        <View style={[styles.formGrid, compact && styles.formGridCompact]}>
          <View style={[styles.formCol, compact && styles.formColCompact]}>
            <Text style={styles.formLabel}>Stock Quantity *</Text>
            <TextInput
              value={form.stock}
              onChangeText={(value) => setForm((current) => ({ ...current, stock: value.replace(/[^0-9]/g, '') }))}
              style={styles.formInput}
              keyboardType="number-pad"
              placeholder="0"
              placeholderTextColor="#9d9d9d"
            />
          </View>

          <View style={[styles.formCol, compact && styles.formColCompact]}>
            <Text style={styles.formLabel}>Min Stock Level *</Text>
            <TextInput
              value={form.minStock}
              onChangeText={(value) => setForm((current) => ({ ...current, minStock: value.replace(/[^0-9]/g, '') }))}
              style={styles.formInput}
              keyboardType="number-pad"
              placeholder="10"
              placeholderTextColor="#9d9d9d"
            />
          </View>
        </View>

        <Text style={styles.formLabel}>Max Stock Level</Text>
        <TextInput
          value={form.maxStock}
          onChangeText={(value) => setForm((current) => ({ ...current, maxStock: value.replace(/[^0-9]/g, '') }))}
          style={styles.formInput}
          keyboardType="number-pad"
          placeholder="0"
          placeholderTextColor="#9d9d9d"
        />
      </ScrollView>

      <View style={styles.formModalFooter}>
        <TouchableOpacity
          style={[styles.primaryBtn, submitting && styles.primaryBtnDisabled]}
          onPress={onPrimaryPress}
          activeOpacity={0.85}
          disabled={submitting}
        >
          {submitting ? <ActivityIndicator size="small" color="#ffffff" /> : <Text style={styles.primaryBtnText}>{primaryLabel}</Text>}
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryBtn} onPress={onClose} activeOpacity={0.85} disabled={submitting}>
          <Text style={styles.secondaryBtnText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function WarehouseInventoryScreen() {
  const { width } = useWindowDimensions();
  const compact = width < 700;

  const [inventoryRows, setInventoryRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [updatingStockId, setUpdatingStockId] = useState('');
  const [deletingId, setDeletingId] = useState('');

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const [addForm, setAddForm] = useState(EMPTY_FORM);
  const [editForm, setEditForm] = useState(EMPTY_FORM);

  const pageRows = useMemo(() => inventoryRows, [inventoryRows]);

  const showingStart = pageRows.length ? (currentPage - 1) * PAGE_SIZE + 1 : 0;
  const showingEnd = pageRows.length ? showingStart + pageRows.length - 1 : 0;

  const fetchInventory = async (page = currentPage) => {
    setLoading(true);
    setError('');
    try {
      const response = await getInventory(page, PAGE_SIZE);
      setInventoryRows((response.data || []).map(mapInventoryItem));
      setCurrentPage(response.pagination?.currentPage || page);
      setTotalPages(response.pagination?.totalPages || 1);
      setTotalItems(response.pagination?.totalItems || 0);
    } catch (err) {
      console.error('Error fetching inventory:', err);
      setError('Failed to fetch inventory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory(currentPage);
  }, [currentPage]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchInventory(currentPage);
    } finally {
      setRefreshing(false);
    }
  };

  const validateForm = (form) => {
    if (!form.warehouseId.trim()) {
      Alert.alert('Validation Error', 'Warehouse ID is required');
      return false;
    }
    if (!form.warehouse.trim()) {
      Alert.alert('Validation Error', 'Warehouse name is required');
      return false;
    }
    if (!form.itemId.trim()) {
      Alert.alert('Validation Error', 'Item ID is required');
      return false;
    }
    if (!form.itemName.trim()) {
      Alert.alert('Validation Error', 'Item name is required');
      return false;
    }
    if (!form.itemCode.trim()) {
      Alert.alert('Validation Error', 'Item code is required');
      return false;
    }
    if (!form.stock.trim()) {
      Alert.alert('Validation Error', 'Stock quantity is required');
      return false;
    }
    if (!form.minStock.trim()) {
      Alert.alert('Validation Error', 'Min stock level is required');
      return false;
    }

    return true;
  };

  const openAdd = () => {
    setAddForm({ ...EMPTY_FORM });
    setShowAddModal(true);
  };

  const submitAdd = async () => {
    if (!validateForm(addForm)) return;

    try {
      setSubmitting(true);
      await createInventory(toInventoryPayload(addForm));
      setShowAddModal(false);
      setCurrentPage(1);
      await fetchInventory(1);
      Alert.alert('Success', 'Inventory entry added successfully');
    } catch (err) {
      Alert.alert('Create Failed', err.response?.data?.message || 'Unable to create inventory entry');
    } finally {
      setSubmitting(false);
    }
  };

  const openEdit = (item) => {
    setSelectedItem(item);
    setEditForm({
      warehouseId: item.warehouseId,
      warehouse: item.warehouse,
      itemType: item.itemType,
      itemId: item.itemId,
      itemName: item.itemName,
      itemCode: item.itemCode,
      stock: String(item.stock),
      reserved: String(item.reserved),
      minStock: String(item.minStock),
      maxStock: String(item.maxStock),
    });
    setShowEditModal(true);
  };

  const submitEdit = async () => {
    if (!selectedItem) return;
    if (!validateForm(editForm)) return;

    try {
      setSubmitting(true);
      const updated = await updateInventory(selectedItem.id, toInventoryPayload(editForm));
      setInventoryRows((current) =>
        current.map((item) => (item.id === selectedItem.id ? mapInventoryItem(updated) : item))
      );
      setShowEditModal(false);
      setSelectedItem(null);
      Alert.alert('Success', 'Inventory entry updated successfully');
    } catch (err) {
      Alert.alert('Update Failed', err.response?.data?.message || 'Unable to update inventory entry');
    } finally {
      setSubmitting(false);
    }
  };

  const openDelete = (item) => {
    setSelectedItem(item);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedItem) return;

    try {
      setDeletingId(selectedItem.id);
      await deleteInventory(selectedItem.id);
      setShowDeleteModal(false);
      setSelectedItem(null);

      const hasSingleItemOnPage = inventoryRows.length === 1;
      const nextPage = hasSingleItemOnPage && currentPage > 1 ? currentPage - 1 : currentPage;
      setCurrentPage(nextPage);
      await fetchInventory(nextPage);
      Alert.alert('Success', 'Inventory entry deleted successfully');
    } catch (err) {
      Alert.alert('Delete Failed', err.response?.data?.message || 'Unable to delete inventory entry');
    } finally {
      setDeletingId('');
    }
  };

  const increaseStock = async (item) => {
    const nextStock = Number(item.stock || 0) + 1;
    try {
      setUpdatingStockId(item.id);
      const updated = await updateInventory(item.id, { stock_quantity: nextStock });
      setInventoryRows((current) =>
        current.map((row) => (row.id === item.id ? mapInventoryItem(updated) : row))
      );
    } catch (err) {
      Alert.alert('Update Failed', err.response?.data?.message || 'Unable to increase stock quantity');
    } finally {
      setUpdatingStockId('');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <MaterialCommunityIcons
            name="view-grid-outline"
            size={20}
            color={COLORS.textPrimary}
            style={styles.headerIcon}
          />
          <Text style={styles.headerTitle}>Warehouse Inventory Management</Text>
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
            <View style={styles.titleGroup}>
              <Text style={styles.screenTitle}>Warehouse Inventory</Text>
              <Text style={styles.screenSubtitle}>Manage warehouse inventory and stock levels.</Text>
            </View>
            <TouchableOpacity style={styles.addButton} activeOpacity={0.85} onPress={openAdd}>
              <MaterialCommunityIcons name="plus" size={17} color={COLORS.white} />
              <Text style={styles.addButtonText}>Add Inventory</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.stateBox}>
              <ActivityIndicator size="large" color="#2453e6" />
              <Text style={styles.stateText}>Loading inventory...</Text>
            </View>
          ) : error ? (
            <View style={styles.stateBox}>
              <MaterialCommunityIcons name="alert-circle-outline" size={40} color="#e53935" />
              <Text style={styles.stateText}>{error}</Text>
              <TouchableOpacity style={styles.retryBtn} onPress={() => fetchInventory(currentPage)}>
                <Text style={styles.retryBtnText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : pageRows.length === 0 ? (
            <View style={styles.stateBox}>
              <MaterialCommunityIcons name="view-grid-outline" size={40} color="#9e9e9e" />
              <Text style={styles.stateText}>No inventory found</Text>
            </View>
          ) : (
            <>
              <View style={styles.cardList}>
                {pageRows.map((row) => {
                  const available = Math.max(0, row.stock - row.reserved);
                  const stockUpdating = updatingStockId === row.id;

                  return (
                    <View key={row.id} style={styles.card}>
                      <View style={styles.cardTopRow}>
                        <View style={styles.cardTopLeft}>
                          <Text style={styles.rowWarehouse}>{row.warehouse}</Text>
                          <Text style={styles.itemType}>{row.itemType}</Text>
                        </View>
                        <StatusBadge stock={row.stock} minStock={row.minStock} />
                      </View>

                      <Text style={styles.rowItemName}>{row.itemName}</Text>
                      <Text style={styles.rowItemCode}>{row.itemCode}</Text>

                      <View style={styles.statsGrid}>
                        <View style={styles.statChip}>
                          <Text style={styles.statLabel}>Stock</Text>
                          <Text style={styles.statValue}>{row.stock}</Text>
                        </View>
                        <View style={styles.statChip}>
                          <Text style={styles.statLabel}>Reserved</Text>
                          <Text style={styles.statValue}>{row.reserved}</Text>
                        </View>
                        <View style={styles.statChip}>
                          <Text style={styles.statLabel}>Available</Text>
                          <Text style={styles.statValue}>{available}</Text>
                        </View>
                      </View>

                      <View style={styles.actionRow}>
                        <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7} onPress={() => openEdit(row)}>
                          <MaterialCommunityIcons name="pencil-outline" size={16} color="#555" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.iconBtn, stockUpdating && styles.iconBtnDisabled]}
                          activeOpacity={0.7}
                          onPress={() => increaseStock(row)}
                          disabled={stockUpdating}
                        >
                          {stockUpdating ? (
                            <ActivityIndicator size="small" color="#1db954" />
                          ) : (
                            <MaterialCommunityIcons name="chart-line" size={16} color="#1db954" />
                          )}
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7} onPress={() => openDelete(row)}>
                          <MaterialCommunityIcons name="trash-can-outline" size={16} color="#ff3b30" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}
              </View>

              <Text style={styles.paginationSummary}>
                Showing {showingStart} to {showingEnd} of {totalItems} inventories
              </Text>

              <View style={styles.paginationRow}>
                <TouchableOpacity
                  style={[styles.paginationButton, currentPage === 1 && styles.paginationButtonDisabled]}
                  onPress={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  disabled={currentPage === 1}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.paginationButtonText, currentPage === 1 && styles.paginationButtonTextDisabled]}>
                    Previous
                  </Text>
                </TouchableOpacity>

                <View style={styles.pageIndicator}>
                  <Text style={styles.pageIndicatorText}>Page {currentPage} of {totalPages}</Text>
                </View>

                <TouchableOpacity
                  style={[styles.paginationButton, currentPage === totalPages && styles.paginationButtonDisabled]}
                  onPress={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                  disabled={currentPage === totalPages}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.paginationButtonText, currentPage === totalPages && styles.paginationButtonTextDisabled]}>
                    Next
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </ScrollView>

      <Modal
        visible={showAddModal}
        transparent
        animationType="fade"
        presentationStyle="overFullScreen"
        statusBarTranslucent
        onRequestClose={() => !submitting && setShowAddModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <InventoryFormModal
            title="Add Inventory Entry"
            form={addForm}
            setForm={setAddForm}
            primaryLabel="Add Inventory"
            onPrimaryPress={submitAdd}
            onClose={() => !submitting && setShowAddModal(false)}
            submitting={submitting}
            compact={compact}
          />
        </View>
      </Modal>

      <Modal
        visible={showEditModal}
        transparent
        animationType="fade"
        presentationStyle="overFullScreen"
        statusBarTranslucent
        onRequestClose={() => !submitting && setShowEditModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <InventoryFormModal
            title="Edit Inventory Entry"
            form={editForm}
            setForm={setEditForm}
            primaryLabel="Update Inventory"
            onPrimaryPress={submitEdit}
            onClose={() => !submitting && setShowEditModal(false)}
            submitting={submitting}
            compact={compact}
          />
        </View>
      </Modal>

      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        presentationStyle="overFullScreen"
        statusBarTranslucent
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.deleteModalCard, compact && styles.deleteModalCardCompact]}>
            <View style={styles.deleteModalHeader}>
              <Text style={[styles.deleteTitle, compact && styles.deleteTitleCompact]}>Confirm Delete</Text>
            </View>
            <View style={styles.deleteModalBody}>
              <Text style={[styles.deleteMessage, compact && styles.deleteMessageCompact]}>
                Are you sure you want to delete the inventory entry for "{selectedItem?.itemName}"? This action
                cannot be undone.
              </Text>
            </View>
            <View style={styles.deleteActions}>
              <TouchableOpacity style={styles.secondaryBtn} onPress={() => setShowDeleteModal(false)} disabled={!!deletingId}>
                <Text style={styles.secondaryBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteBtn} onPress={confirmDelete} disabled={!!deletingId}>
                {deletingId ? <ActivityIndicator size="small" color="#f04438" /> : <Text style={styles.deleteBtnText}>Delete</Text>}
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
  header: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center' },
  headerIcon: { marginRight: SPACING.md },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  content: { flex: 1, backgroundColor: '#fcfcfa' },
  innerContent: { paddingHorizontal: 16, paddingTop: 22, paddingBottom: 40 },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
  },
  titleGroup: { flex: 1 },
  screenTitle: { fontSize: 22, fontWeight: '700', color: '#161616' },
  screenSubtitle: { marginTop: 3, fontSize: 13, color: '#6d6d6d' },
  addButton: {
    height: 36,
    borderRadius: 10,
    backgroundColor: '#2453e6',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  addButtonText: { fontSize: 13, fontWeight: '600', color: COLORS.white },
  stateBox: {
    minHeight: 180,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    gap: 10,
  },
  stateText: { fontSize: 14, color: '#555', textAlign: 'center' },
  retryBtn: {
    minHeight: 34,
    borderRadius: 8,
    backgroundColor: '#2453e6',
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryBtnText: { fontSize: 13, fontWeight: '600', color: COLORS.white },
  cardList: { gap: 10 },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    padding: 12,
  },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 },
  cardTopLeft: { flex: 1 },
  rowWarehouse: { fontSize: 15, fontWeight: '600', color: '#171717' },
  itemType: { marginTop: 2, fontSize: 12, color: '#6d6d6d' },
  rowItemName: { marginTop: 10, fontSize: 14, fontWeight: '600', color: '#171717' },
  rowItemCode: { marginTop: 2, fontSize: 12, color: '#6d6d6d' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  statChip: {
    minWidth: 88,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#f6f6f6',
  },
  statLabel: { fontSize: 11, color: '#777' },
  statValue: { marginTop: 2, fontSize: 14, fontWeight: '600', color: '#222' },
  badge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  badgeInStock: { backgroundColor: '#2453e6' },
  badgeLowStock: { backgroundColor: '#fff3e0' },
  badgeText: { fontSize: 12, fontWeight: '600' },
  badgeTextInStock: { color: COLORS.white },
  badgeTextLowStock: { color: '#e65100' },
  actionRow: { marginTop: 12, flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
  iconBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dfdfdf',
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnDisabled: { opacity: 0.7 },
  paginationSummary: { marginTop: 24, fontSize: 14, color: '#6d6d6d' },
  paginationRow: { marginTop: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  paginationButton: {
    minWidth: 80,
    height: 32,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#dfdfdf',
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paginationButtonDisabled: { backgroundColor: '#fbfbfb' },
  paginationButtonText: { fontSize: 14, fontWeight: '600', color: '#111111' },
  paginationButtonTextDisabled: { color: '#a6a6a6' },
  pageIndicator: {
    minWidth: 120,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dfdfdf',
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageIndicatorText: { fontSize: 14, fontWeight: '600', color: '#151515' },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  formModalCard: {
    width: '100%',
    maxWidth: 760,
    maxHeight: '92%',
    minHeight: 380,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#d9d9d9',
    overflow: 'visible',
  },
  formModalCardCompact: {
    maxWidth: 640,
    height: '86%',
  },
  formModalHeader: {
    minHeight: 72,
    borderBottomWidth: 1,
    borderBottomColor: '#ececec',
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  formModalTitle: { fontSize: 39, fontWeight: '700', color: '#141414', lineHeight: 44 },
  formModalTitleCompact: { fontSize: 22, lineHeight: 28 },
  formModalBody: { flex: 1 },
  formModalBodyContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 24,
  },
  formLabel: { marginTop: 6, marginBottom: 8, fontSize: 16, fontWeight: '700', color: '#1f1f1f' },
  formInput: {
    minHeight: 54,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#d5d5d5',
    paddingHorizontal: 14,
    fontSize: 16,
    color: '#111111',
    backgroundColor: '#ffffff',
  },
  dropdownWrap: { zIndex: 20 },
  selectTrigger: {
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#d5d5d5',
    backgroundColor: '#ffffff',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectTriggerText: { fontSize: 16, color: '#1d1d1d' },
  optionList: {
    marginTop: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d9d9d9',
    backgroundColor: '#ffffff',
    overflow: 'hidden',
  },
  optionItem: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
  },
  optionItemText: { fontSize: 15, color: '#1a1a1a' },
  formGrid: {
    marginTop: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    columnGap: 14,
  },
  formGridCompact: { flexDirection: 'column' },
  formCol: { width: '48.5%' },
  formColCompact: { width: '100%' },
  formModalFooter: {
    minHeight: 74,
    borderTopWidth: 1,
    borderTopColor: '#ececec',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  primaryBtn: {
    minHeight: 44,
    borderRadius: 12,
    backgroundColor: '#2453e6',
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnDisabled: { opacity: 0.85 },
  primaryBtnText: { fontSize: 16, fontWeight: '700', color: '#ffffff' },
  secondaryBtn: {
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d0d5dd',
    backgroundColor: '#ffffff',
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: { fontSize: 16, fontWeight: '600', color: '#191919' },

  deleteModalCard: {
    width: '100%',
    maxWidth: 760,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#d7d7d7',
    overflow: 'hidden',
  },
  deleteModalCardCompact: { maxWidth: 560 },
  deleteModalHeader: {
    minHeight: 80,
    borderBottomWidth: 1,
    borderBottomColor: '#ececec',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  deleteTitle: { fontSize: 46, fontWeight: '700', color: '#161616', lineHeight: 50 },
  deleteTitleCompact: { fontSize: 34, lineHeight: 38 },
  deleteModalBody: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 14 },
  deleteMessage: { fontSize: 24, lineHeight: 33, color: '#666666' },
  deleteMessageCompact: { fontSize: 19, lineHeight: 27 },
  deleteActions: {
    paddingHorizontal: 24,
    paddingVertical: 18,
    borderTopWidth: 1,
    borderTopColor: '#ececec',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  deleteBtn: {
    minHeight: 44,
    borderRadius: 12,
    backgroundColor: '#fdeced',
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtnText: { fontSize: 16, fontWeight: '700', color: '#f04438' },
});
