import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Modal, RefreshControl, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { createWarehouse, deleteWarehouse, getWarehouses, updateWarehouse } from '../api/api-methods';
import { BORDER_RADIUS, COLORS, SPACING } from '../constants/theme';

const PAGE_SIZE = 10;

const mapWarehouse = (row) => ({
  id: row._id,
  name: row.name || 'N/A',
  location: row.location || 'N/A',
  status: row.isActive ? 'Active' : 'Inactive',
});

const toWarehousePayload = (form) => ({
  name: form.name.trim(),
  location: form.location.trim(),
  isActive: !!form.active,
});

const EMPTY_FORM = {
  name: '',
  location: '',
  active: true,
};

function StatusBadge({ status }) {
  const active = status === 'Active';
  return (
    <View style={[styles.badge, active ? styles.badgeActive : styles.badgeInactive]}>
      <Text style={[styles.badgeText, active ? styles.badgeTextActive : styles.badgeTextInactive]}>{status}</Text>
    </View>
  );
}

export default function WarehouseMasterScreen() {
  const { width } = useWindowDimensions();
  const compact = width < 700;

  const [warehouseRows, setWarehouseRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [addForm, setAddForm] = useState(EMPTY_FORM);
  const [editForm, setEditForm] = useState(EMPTY_FORM);

  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const pageRows = useMemo(
    () => warehouseRows,
    [warehouseRows]
  );

  const showingStart = pageRows.length ? pageStart + 1 : 0;
  const showingEnd = pageRows.length ? showingStart + pageRows.length - 1 : 0;

  const fetchWarehouses = async (page = currentPage) => {
    setLoading(true);
    setError('');
    try {
      const response = await getWarehouses(page, PAGE_SIZE);
      setWarehouseRows((response.data || []).map(mapWarehouse));
      setCurrentPage(response.pagination?.currentPage || page);
      setTotalPages(response.pagination?.totalPages || 1);
      setTotalItems(response.pagination?.totalItems || 0);
    } catch (err) {
      console.error('Error fetching warehouses:', err);
      setError('Failed to fetch warehouses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouses(currentPage);
  }, [currentPage]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchWarehouses(currentPage);
    } finally {
      setRefreshing(false);
    }
  };

  const validateForm = (form) => {
    if (!form.name.trim()) {
      Alert.alert('Validation Error', 'Warehouse name is required');
      return false;
    }
    if (!form.location.trim()) {
      Alert.alert('Validation Error', 'Warehouse location is required');
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
      await createWarehouse(toWarehousePayload(addForm));
      setShowAddModal(false);
      setCurrentPage(1);
      await fetchWarehouses(1);
      Alert.alert('Success', 'Warehouse created successfully');
    } catch (err) {
      Alert.alert('Create Failed', err.response?.data?.message || 'Unable to create warehouse');
    } finally {
      setSubmitting(false);
    }
  };

  const openEdit = (warehouse) => {
    setSelectedWarehouse(warehouse);
    setEditForm({
      name: warehouse.name,
      location: warehouse.location,
      active: warehouse.status === 'Active',
    });
    setShowEditModal(true);
  };

  const submitEdit = async () => {
    if (!selectedWarehouse) return;
    if (!validateForm(editForm)) return;

    try {
      setSubmitting(true);
      const updated = await updateWarehouse(selectedWarehouse.id, toWarehousePayload(editForm));
      setWarehouseRows((current) => current.map((item) => (item.id === selectedWarehouse.id ? mapWarehouse(updated) : item)));
      setShowEditModal(false);
      setSelectedWarehouse(null);
      Alert.alert('Success', 'Warehouse updated successfully');
    } catch (err) {
      Alert.alert('Update Failed', err.response?.data?.message || 'Unable to update warehouse');
    } finally {
      setSubmitting(false);
    }
  };

  const openDelete = (warehouse) => {
    setSelectedWarehouse(warehouse);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedWarehouse) return;

    try {
      setDeletingId(selectedWarehouse.id);
      await deleteWarehouse(selectedWarehouse.id);
      setShowDeleteModal(false);
      setSelectedWarehouse(null);

      const hasSingleItemOnPage = warehouseRows.length === 1;
      const nextPage = hasSingleItemOnPage && currentPage > 1 ? currentPage - 1 : currentPage;
      setCurrentPage(nextPage);
      await fetchWarehouses(nextPage);
      Alert.alert('Success', 'Warehouse deleted successfully');
    } catch (err) {
      Alert.alert('Delete Failed', err.response?.data?.message || 'Unable to delete warehouse');
    } finally {
      setDeletingId('');
    }
  };

  const renderWarehouseFormModal = (title, form, setForm, primaryLabel, onPrimaryPress, onClose) => (
    <View style={[styles.formModalCard, compact && styles.formModalCardCompact]}>
      <View style={styles.formModalHeader}>
        <Text style={[styles.formModalTitle, compact && styles.formModalTitleCompact]}>{title}</Text>
        <TouchableOpacity onPress={onClose} activeOpacity={0.85} style={styles.modalCloseBtn}>
          <MaterialCommunityIcons name="close" size={22} color="#1f1f1f" />
        </TouchableOpacity>
      </View>

      <View style={styles.formModalBody}>
        <Text style={styles.formLabel}>Name</Text>
        <TextInput
          value={form.name}
          onChangeText={(value) => setForm((current) => ({ ...current, name: value }))}
          style={styles.formInput}
          placeholder="Enter warehouse name"
          placeholderTextColor="#9d9d9d"
        />

        <Text style={styles.formLabel}>Location</Text>
        <TextInput
          value={form.location}
          onChangeText={(value) => setForm((current) => ({ ...current, location: value }))}
          style={styles.formInput}
          placeholder="Enter location"
          placeholderTextColor="#9d9d9d"
        />

        <TouchableOpacity
          style={styles.activeToggleRow}
          activeOpacity={0.85}
          onPress={() => setForm((current) => ({ ...current, active: !current.active }))}
        >
          <View style={[styles.checkbox, form.active && styles.checkboxChecked]}>
            {form.active ? <MaterialCommunityIcons name="check" size={18} color="#ffffff" /> : null}
          </View>
          <Text style={[styles.activeToggleText, compact && styles.activeToggleTextCompact]}>Active</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.formModalFooter}>
        <TouchableOpacity style={[styles.primaryBtn, submitting && styles.primaryBtnDisabled]} onPress={onPrimaryPress} activeOpacity={0.85} disabled={submitting}>
          {submitting ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={[styles.primaryBtnText, compact && styles.primaryBtnTextCompact]}>{primaryLabel}</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryBtn} onPress={onClose} activeOpacity={0.85} disabled={submitting}>
          <Text style={[styles.secondaryBtnText, compact && styles.secondaryBtnTextCompact]}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

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
          <Text style={styles.headerTitle}>Warehouse Management</Text>
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
              <Text style={styles.screenTitle}>Warehouses</Text>
              <Text style={styles.screenSubtitle}>Manage warehouses and their locations.</Text>
            </View>
            <TouchableOpacity style={styles.addButton} activeOpacity={0.85} onPress={openAdd}>
              <MaterialCommunityIcons name="plus" size={17} color={COLORS.white} />
              <Text style={styles.addButtonText}>Add Warehouse</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.stateBox}>
              <ActivityIndicator size="large" color="#2453e6" />
              <Text style={styles.stateText}>Loading warehouses...</Text>
            </View>
          ) : error ? (
            <View style={styles.stateBox}>
              <MaterialCommunityIcons name="alert-circle-outline" size={40} color="#e53935" />
              <Text style={styles.stateText}>{error}</Text>
              <TouchableOpacity style={styles.retryBtn} onPress={() => fetchWarehouses(currentPage)}>
                <Text style={styles.retryBtnText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : pageRows.length === 0 ? (
            <View style={styles.stateBox}>
              <MaterialCommunityIcons name="view-grid-outline" size={40} color="#9e9e9e" />
              <Text style={styles.stateText}>No warehouses found</Text>
            </View>
          ) : (
            <>
              <View style={styles.cardList}>
                {pageRows.map((row) => (
                  <View key={row.id} style={styles.card}>
                    <View style={styles.cardTopRow}>
                      <View style={styles.nameWrap}>
                        <View style={styles.iconCircle}>
                          <MaterialCommunityIcons name="home-city-outline" size={18} color="#7a7a7a" />
                        </View>
                        <Text style={styles.rowName}>{row.name}</Text>
                      </View>
                      <StatusBadge status={row.status} />
                    </View>
                    <View style={styles.locationRow}>
                      <MaterialCommunityIcons name="map-marker-outline" size={14} color="#888" />
                      <Text style={styles.rowLocation}>{row.location}</Text>
                    </View>
                    <View style={styles.actionRow}>
                      <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7} onPress={() => openEdit(row)}>
                        <MaterialCommunityIcons name="pencil-outline" size={16} color="#555" />
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7} onPress={() => openDelete(row)}>
                        <MaterialCommunityIcons name="trash-can-outline" size={16} color="#ff3b30" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>

              <Text style={styles.paginationSummary}>
                Showing {showingStart} to {showingEnd} of {totalItems} warehouses
              </Text>

              <View style={styles.paginationRow}>
                <TouchableOpacity
                  style={[styles.paginationButton, currentPage === 1 && styles.paginationButtonDisabled]}
                  onPress={() => setCurrentPage((p) => Math.max(1, p - 1))}
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
                  onPress={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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
          {renderWarehouseFormModal(
            'Add New Warehouse',
            addForm,
            setAddForm,
            'Create Warehouse',
            submitAdd,
            () => !submitting && setShowAddModal(false)
          )}
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
          {renderWarehouseFormModal(
            'Edit Warehouse',
            editForm,
            setEditForm,
            'Update Warehouse',
            submitEdit,
            () => !submitting && setShowEditModal(false)
          )}
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
                Are you sure you want to delete the warehouse "{selectedWarehouse?.name}"? This action cannot be
                undone.
              </Text>
            </View>
            <View style={styles.deleteActions}>
              <TouchableOpacity style={styles.secondaryBtn} onPress={() => setShowDeleteModal(false)} disabled={!!deletingId}>
                <Text style={[styles.secondaryBtnText, compact && styles.secondaryBtnTextCompact]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteBtn} onPress={confirmDelete} disabled={!!deletingId}>
                {deletingId ? (
                  <ActivityIndicator size="small" color="#e12626" />
                ) : (
                  <Text style={[styles.deleteBtnText, compact && styles.secondaryBtnTextCompact]}>Delete</Text>
                )}
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
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 16 },
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
  card: { backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.lg, borderWidth: 1, borderColor: COLORS.gray200, padding: 12 },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 },
  nameWrap: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconCircle: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#f1f1f1', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  rowName: { fontSize: 16, fontWeight: '600', color: '#171717', flexShrink: 1 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 10 },
  rowLocation: { fontSize: 12, color: '#6d6d6d', flex: 1 },
  badge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  badgeActive: { backgroundColor: '#2453e6' },
  badgeInactive: { backgroundColor: '#fce4ec' },
  badgeText: { fontSize: 12, fontWeight: '600' },
  badgeTextActive: { color: COLORS.white },
  badgeTextInactive: { color: '#c62828' },
  actionRow: { marginTop: 12, flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
  iconBtn: { width: 30, height: 30, borderRadius: 8, borderWidth: 1, borderColor: '#dfdfdf', backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center' },
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
  pageIndicator: { minWidth: 120, height: 36, borderRadius: 8, borderWidth: 1, borderColor: '#dfdfdf', backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center' },
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
    maxWidth: 920,
    backgroundColor: '#f7f7f7',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#cfcfcf',
    overflow: 'hidden',
  },
  formModalCardCompact: { maxWidth: 680 },
  formModalHeader: {
    minHeight: 96,
    borderBottomWidth: 1,
    borderBottomColor: '#d5d5d5',
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  formModalTitle: { fontSize: 40, fontWeight: '700', color: '#121212', lineHeight: 44 },
  formModalTitleCompact: { fontSize: 26, lineHeight: 30 },
  modalCloseBtn: { padding: 8, marginRight: -8 },
  formModalBody: {
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 16,
  },
  formLabel: { marginBottom: 10, fontSize: 17, fontWeight: '700', color: '#171717' },
  formInput: {
    minHeight: 62,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#d0d0d0',
    paddingHorizontal: 16,
    fontSize: 17,
    color: '#121212',
    backgroundColor: '#f7f7f7',
    marginBottom: 16,
  },
  activeToggleRow: {
    marginTop: 4,
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 32,
    height: 32,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#a7a7a7',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#1e73e8',
    borderColor: '#1e73e8',
  },
  activeToggleText: { fontSize: 20, fontWeight: '600', color: '#121212' },
  activeToggleTextCompact: { fontSize: 16 },
  formModalFooter: {
    minHeight: 98,
    borderTopWidth: 1,
    borderTopColor: '#d5d5d5',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  primaryBtn: {
    minHeight: 50,
    borderRadius: 16,
    backgroundColor: '#2453e6',
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnDisabled: { opacity: 0.85 },
  primaryBtnText: { fontSize: 15, fontWeight: '700', color: '#ffffff', lineHeight: 20 },
  primaryBtnTextCompact: { fontSize: 14, lineHeight: 18 },
  secondaryBtn: {
    minHeight: 50,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#cfcfcf',
    backgroundColor: '#f7f7f7',
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: { fontSize: 15, fontWeight: '500', color: '#151515', lineHeight: 20 },
  secondaryBtnTextCompact: { fontSize: 14, lineHeight: 18 },

  deleteModalCard: {
    width: '100%',
    maxWidth: 780,
    backgroundColor: '#f7f7f7',
    borderRadius: 26,
    borderWidth: 1,
    borderColor: '#cfcfcf',
    overflow: 'hidden',
  },
  deleteModalCardCompact: { maxWidth: 560 },
  deleteModalHeader: {
    minHeight: 112,
    borderBottomWidth: 1,
    borderBottomColor: '#d5d5d5',
    justifyContent: 'center',
    paddingHorizontal: 48,
  },
  deleteTitle: { fontSize: 48, fontWeight: '700', color: '#121212', lineHeight: 52 },
  deleteTitleCompact: { fontSize: 32, lineHeight: 36 },
  deleteModalBody: { paddingHorizontal: 48, paddingTop: 30, paddingBottom: 20 },
  deleteMessage: { fontSize: 24, lineHeight: 34, color: '#6e6e6e' },
  deleteMessageCompact: { fontSize: 18, lineHeight: 28 },
  deleteActions: {
    paddingHorizontal: 48,
    paddingVertical: 24,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
  },
  deleteBtn: {
    minHeight: 50,
    borderRadius: 16,
    backgroundColor: '#f7dede',
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtnText: { fontSize: 15, fontWeight: '500', color: '#e12626', lineHeight: 20 },
});
