import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, RefreshControl, SafeAreaView, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { createRawMaterial, deleteRawMaterial, getRawMaterials, updateRawMaterial } from '../api/api-methods';
import { BORDER_RADIUS, COLORS, SPACING } from '../constants/theme';

const PAGE_SIZE = 10;

const EMPTY_FORM = {
  name: '',
  unit: '',
  category: '',
  supplier: '',
  description: '',
  isActive: true,
};

function StatusBadge({ isActive }) {
  return (
    <View style={[styles.badge, isActive ? styles.badgeActive : styles.badgeInactive]}>
      <Text style={[styles.badgeText, isActive ? styles.badgeTextActive : styles.badgeTextInactive]}>
        {isActive ? 'Active' : 'Inactive'}
      </Text>
    </View>
  );
}

function RawMaterialCard({ item, onEdit, onDelete }) {
  const hasImage = item.images && item.images.length > 0;
  
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          {hasImage ? (
            <Image source={{ uri: item.images[0] }} style={styles.cardImage} />
          ) : (
            <View style={styles.cardImagePlaceholder}>
              <MaterialCommunityIcons name="package-variant" size={24} color="#999" />
            </View>
          )}
          <View style={styles.cardHeaderText}>
            <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.cardSubtitle}>{item.unit}</Text>
          </View>
        </View>
        <StatusBadge isActive={item.isActive} />
      </View>
      
      <View style={styles.cardBody}>
        <View style={styles.cardMetaRow}>
          <MaterialCommunityIcons name="tag-outline" size={14} color="#888" />
          <Text style={styles.cardMeta} numberOfLines={1}> {item.category || 'N/A'}</Text>
        </View>
        <View style={styles.cardMetaRow}>
          <MaterialCommunityIcons name="truck-outline" size={14} color="#888" />
          <Text style={styles.cardMeta} numberOfLines={1}> {item.supplier || 'N/A'}</Text>
        </View>
        {item.description ? (
          <View style={styles.cardMetaRow}>
            <MaterialCommunityIcons name="text" size={14} color="#888" />
            <Text style={styles.cardMeta} numberOfLines={2}> {item.description}</Text>
          </View>
        ) : null}
      </View>
      
      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7} onPress={() => onEdit(item)}>
          <MaterialCommunityIcons name="pencil-outline" size={17} color="#555" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7} onPress={() => onDelete(item)}>
          <MaterialCommunityIcons name="trash-can-outline" size={17} color="#e53935" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function RawMaterialsScreen() {
  const [rawMaterials, setRawMaterials] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [addForm, setAddForm] = useState(EMPTY_FORM);
  const [editForm, setEditForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fetchRawMaterials = async (page = currentPage) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getRawMaterials(page, PAGE_SIZE);
      setRawMaterials(response.data || []);
      setTotalPages(response.pagination?.totalPages || 1);
      setTotalItems(response.pagination?.totalItems || 0);
    } catch (err) {
      setError('Failed to fetch raw materials');
      console.error('Error fetching raw materials:', err);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchRawMaterials(currentPage);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRawMaterials(currentPage);
  }, [currentPage]);

  const showingStart = rawMaterials.length ? (currentPage - 1) * PAGE_SIZE + 1 : 0;
  const showingEnd = rawMaterials.length ? showingStart + rawMaterials.length - 1 : 0;

  const openEdit = (item) => {
    setSelectedItem(item);
    setEditForm({
      name: item.name || '',
      unit: item.unit || '',
      category: item.category || '',
      supplier: item.supplier || '',
      description: item.description || '',
      isActive: item.isActive !== false,
    });
    setShowEditModal(true);
  };

  const openDelete = (item) => {
    setSelectedItem(item);
    setShowDeleteModal(true);
  };

  const submitCreate = async () => {
    if (!addForm.name.trim()) {
      Alert.alert('Validation Error', 'Name is required');
      return;
    }
    if (!addForm.unit.trim()) {
      Alert.alert('Validation Error', 'Unit is required');
      return;
    }

    const payload = {
      name: addForm.name.trim(),
      unit: addForm.unit.trim(),
      category: addForm.category.trim() || '',
      supplier: addForm.supplier.trim() || '',
      description: addForm.description.trim() || '',
      isActive: addForm.isActive,
    };

    try {
      setSaving(true);
      await createRawMaterial(payload);
      setShowAddModal(false);
      setAddForm(EMPTY_FORM);
      fetchRawMaterials(1);
      setCurrentPage(1);
      Alert.alert('Success', 'Raw material created successfully');
    } catch (err) {
      Alert.alert('Create Failed', err.response?.data?.message || 'Unable to create raw material');
    } finally {
      setSaving(false);
    }
  };

  const submitEdit = async () => {
    if (!selectedItem?._id) return;
    if (!editForm.name.trim()) {
      Alert.alert('Validation Error', 'Name is required');
      return;
    }
    if (!editForm.unit.trim()) {
      Alert.alert('Validation Error', 'Unit is required');
      return;
    }

    const payload = {
      name: editForm.name.trim(),
      unit: editForm.unit.trim(),
      category: editForm.category.trim() || '',
      supplier: editForm.supplier.trim() || '',
      description: editForm.description.trim() || '',
      isActive: editForm.isActive,
    };

    try {
      setSaving(true);
      await updateRawMaterial(selectedItem._id, payload);
      setShowEditModal(false);
      setSelectedItem(null);
      fetchRawMaterials(currentPage);
      Alert.alert('Success', 'Raw material updated successfully');
    } catch (err) {
      Alert.alert('Update Failed', err.response?.data?.message || 'Unable to update raw material');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!selectedItem?._id) return;
    try {
      setSaving(true);
      await deleteRawMaterial(selectedItem._id);
      setShowDeleteModal(false);
      setSelectedItem(null);
      fetchRawMaterials(currentPage);
      Alert.alert('Success', 'Raw material deleted successfully');
    } catch (err) {
      Alert.alert('Delete Failed', err.response?.data?.message || 'Unable to delete raw material');
    } finally {
      setSaving(false);
    }
  };

  const MaterialModalForm = ({ title, form, setForm, primaryLabel, onPrimaryPress, onClose }) => (
    <View style={styles.modalCard}>
      <View style={styles.modalHeader}>
        <Text style={styles.modalTitle}>{title}</Text>
        <TouchableOpacity style={styles.modalCloseBtn} onPress={onClose}>
          <MaterialCommunityIcons name="close" size={20} color="#222" />
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.modalBody} contentContainerStyle={styles.modalBodyContent}>
        <Text style={styles.inputLabel}>Name *</Text>
        <TextInput 
          value={form.name} 
          onChangeText={(v) => setForm({ ...form, name: v })} 
          style={styles.inputBox}
          placeholder="Enter raw material name"
          placeholderTextColor="#999"
        />

        <Text style={styles.inputLabel}>Unit *</Text>
        <TextInput 
          value={form.unit} 
          onChangeText={(v) => setForm({ ...form, unit: v })} 
          style={styles.inputBox}
          placeholder="e.g., kg, meters, pieces"
          placeholderTextColor="#999"
        />

        <Text style={styles.inputLabel}>Category</Text>
        <TextInput 
          value={form.category} 
          onChangeText={(v) => setForm({ ...form, category: v })} 
          style={styles.inputBox}
          placeholder="Enter category"
          placeholderTextColor="#999"
        />

        <Text style={styles.inputLabel}>Supplier</Text>
        <TextInput 
          value={form.supplier} 
          onChangeText={(v) => setForm({ ...form, supplier: v })} 
          style={styles.inputBox}
          placeholder="Enter supplier name"
          placeholderTextColor="#999"
        />

        <Text style={styles.inputLabel}>Description</Text>
        <TextInput 
          value={form.description} 
          onChangeText={(v) => setForm({ ...form, description: v })} 
          style={styles.textArea} 
          multiline
          placeholder="Enter description"
          placeholderTextColor="#999"
        />

        <View style={styles.activeRow}>
          <Switch 
            value={form.isActive} 
            onValueChange={(v) => setForm({ ...form, isActive: v })} 
            trackColor={{ false: '#ccc', true: '#8db2ff' }} 
            thumbColor={form.isActive ? '#2453e6' : '#f4f3f4'} 
          />
          <Text style={styles.activeText}>Active</Text>
        </View>
      </ScrollView>

      <View style={styles.modalFooter}>
        <TouchableOpacity style={styles.primaryModalBtn} onPress={onPrimaryPress} disabled={saving}>
          {saving ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.primaryModalBtnText}>{primaryLabel}</Text>}
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
          <MaterialCommunityIcons name="package-variant-closed" size={20} color={COLORS.textPrimary} style={styles.headerIcon} />
          <Text style={styles.headerTitle}>Raw Material Management</Text>
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
              <Text style={styles.screenTitle}>Raw Materials</Text>
              <Text style={styles.screenSubtitle}>Manage raw materials and supplier info.</Text>
            </View>
            <TouchableOpacity style={styles.addButton} activeOpacity={0.85} onPress={() => setShowAddModal(true)}>
              <MaterialCommunityIcons name="plus" size={17} color={COLORS.white} />
              <Text style={styles.addButtonText}>Add Raw Material</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.stateBox}>
              <ActivityIndicator size="large" color="#2453e6" />
              <Text style={styles.stateText}>Loading raw materials...</Text>
            </View>
          ) : error ? (
            <View style={styles.stateBox}>
              <MaterialCommunityIcons name="alert-circle-outline" size={40} color="#e53935" />
              <Text style={styles.stateText}>{error}</Text>
              <TouchableOpacity style={styles.retryBtn} onPress={() => fetchRawMaterials(currentPage)}>
                <Text style={styles.retryBtnText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : rawMaterials.length === 0 ? (
            <View style={styles.stateBox}>
              <MaterialCommunityIcons name="package-variant" size={40} color="#9e9e9e" />
              <Text style={styles.stateText}>No raw materials found</Text>
            </View>
          ) : (
            <View style={styles.cardList}>
              {rawMaterials.map((item) => (
                <RawMaterialCard
                  key={item._id}
                  item={item}
                  onEdit={openEdit}
                  onDelete={openDelete}
                />
              ))}
            </View>
          )}

          <Text style={styles.paginationSummary}>
            Showing {showingStart} to {showingEnd} of {totalItems} raw materials
          </Text>
          <View style={styles.paginationRow}>
            <TouchableOpacity 
              style={[styles.paginationButton, currentPage === 1 && styles.paginationButtonDisabled]} 
              onPress={() => setCurrentPage((p) => Math.max(1, p - 1))} 
              disabled={currentPage === 1} 
              activeOpacity={0.85}
            >
              <Text style={[styles.paginationButtonText, currentPage === 1 && styles.paginationButtonTextDisabled]}>Previous</Text>
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
              <Text style={[styles.paginationButtonText, currentPage === totalPages && styles.paginationButtonTextDisabled]}>Next</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <Modal visible={showAddModal} transparent animationType="fade" onRequestClose={() => setShowAddModal(false)}>
        <View style={styles.modalBackdrop}>
          <MaterialModalForm
            title="Add New Raw Material"
            form={addForm}
            setForm={setAddForm}
            primaryLabel="Create Raw Material"
            onPrimaryPress={submitCreate}
            onClose={() => setShowAddModal(false)}
          />
        </View>
      </Modal>

      <Modal visible={showEditModal} transparent animationType="fade" onRequestClose={() => setShowEditModal(false)}>
        <View style={styles.modalBackdrop}>
          <MaterialModalForm
            title="Edit Raw Material"
            form={editForm}
            setForm={setEditForm}
            primaryLabel="Update Raw Material"
            onPrimaryPress={submitEdit}
            onClose={() => setShowEditModal(false)}
          />
        </View>
      </Modal>

      <Modal visible={showDeleteModal} transparent animationType="fade" onRequestClose={() => setShowDeleteModal(false)}>
        <View style={styles.modalBackdropCenter}>
          <View style={styles.deleteModalCard}>
            <Text style={styles.deleteTitle}>Confirm Delete</Text>
            <Text style={styles.deleteMessage}>
              Are you sure you want to delete the raw material "{selectedItem?.name}"? This action cannot be undone.
            </Text>
            <View style={styles.deleteActionRow}>
              <TouchableOpacity style={styles.cancelModalBtn} onPress={() => setShowDeleteModal(false)}>
                <Text style={styles.cancelModalBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteConfirmBtn} onPress={confirmDelete} disabled={saving}>
                {saving ? <ActivityIndicator size="small" color="#e53935" /> : <Text style={styles.deleteConfirmBtnText}>Delete</Text>}
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

  // Card styles
  cardList: { gap: 12 },
  card: { backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.lg, borderWidth: 1, borderColor: COLORS.gray200, padding: 14 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardHeaderLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 12 },
  cardImage: { width: 48, height: 48, borderRadius: 8, marginRight: 12 },
  cardImagePlaceholder: { width: 48, height: 48, borderRadius: 8, backgroundColor: '#f5f5f5', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  cardHeaderText: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#151515' },
  cardSubtitle: { fontSize: 13, color: '#666', marginTop: 2 },
  cardBody: { marginBottom: 12 },
  cardMetaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  cardMeta: { fontSize: 13, color: '#555' },
  cardActions: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  iconBtn: { width: 34, height: 34, borderRadius: 8, borderWidth: 1, borderColor: '#dfdfdf', backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center' },

  // Badge styles
  badge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  badgeActive: { backgroundColor: '#e8f5e9' },
  badgeInactive: { backgroundColor: '#fce4ec' },
  badgeText: { fontSize: 12, fontWeight: '600' },
  badgeTextActive: { color: '#2e7d32' },
  badgeTextInactive: { color: '#c62828' },

  // State styles
  stateBox: { padding: 40, alignItems: 'center', justifyContent: 'center' },
  stateText: { marginTop: 12, fontSize: 14, color: '#6d6d6d', textAlign: 'center' },
  retryBtn: { marginTop: 12, paddingHorizontal: 20, paddingVertical: 8, borderRadius: 8, backgroundColor: '#2453e6' },
  retryBtnText: { fontSize: 14, fontWeight: '600', color: COLORS.white },

  // Pagination styles
  paginationSummary: { marginTop: 24, fontSize: 14, color: '#6d6d6d' },
  paginationRow: { marginTop: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  paginationButton: { minWidth: 80, height: 32, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1, borderColor: '#dfdfdf', backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center' },
  paginationButtonDisabled: { backgroundColor: '#fbfbfb' },
  paginationButtonText: { fontSize: 14, fontWeight: '600', color: '#111111' },
  paginationButtonTextDisabled: { color: '#a6a6a6' },
  pageIndicator: { minWidth: 120, height: 36, borderRadius: 8, borderWidth: 1, borderColor: '#dfdfdf', backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center' },
  pageIndicatorText: { fontSize: 14, fontWeight: '600', color: '#151515' },

  // Modal styles
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', padding: 10, justifyContent: 'center' },
  modalCard: { maxHeight: '94%', backgroundColor: COLORS.white, borderRadius: 16, borderWidth: 1, borderColor: '#dcdcdc', overflow: 'hidden' },
  modalHeader: { minHeight: 56, borderBottomWidth: 1, borderBottomColor: '#ececec', paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#111' },
  modalCloseBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  modalBody: { flex: 1 },
  modalBodyContent: { padding: 14, paddingBottom: 24 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#222', marginBottom: 8, marginTop: 12 },
  inputBox: { minHeight: 46, borderRadius: 12, borderWidth: 1, borderColor: '#d6d6d6', backgroundColor: '#fff', paddingHorizontal: 12, fontSize: 16, color: '#111' },
  textArea: { minHeight: 90, borderRadius: 12, borderWidth: 1, borderColor: '#d6d6d6', backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, color: '#111', textAlignVertical: 'top' },
  activeRow: { marginTop: 16, flexDirection: 'row', alignItems: 'center', gap: 10 },
  activeText: { fontSize: 16, fontWeight: '500', color: '#111' },
  modalFooter: { borderTopWidth: 1, borderTopColor: '#ececec', padding: 12, flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  primaryModalBtn: { minHeight: 40, borderRadius: 12, backgroundColor: '#2453e6', paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center' },
  primaryModalBtnText: { fontSize: 15, fontWeight: '700', color: COLORS.white },
  cancelModalBtn: { minHeight: 40, borderRadius: 12, borderWidth: 1, borderColor: '#d2d2d2', backgroundColor: '#fff', paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center' },
  cancelModalBtnText: { fontSize: 15, color: '#111' },

  // Delete modal styles
  modalBackdropCenter: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center', padding: 16 },
  deleteModalCard: { width: '94%', maxWidth: 400, backgroundColor: COLORS.white, borderRadius: 16, borderWidth: 1, borderColor: '#d8d8d8', overflow: 'hidden', padding: 24 },
  deleteTitle: { fontSize: 20, fontWeight: '700', color: '#111' },
  deleteMessage: { marginTop: 12, fontSize: 15, lineHeight: 22, color: '#6d6d6d' },
  deleteActionRow: { marginTop: 20, flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  deleteConfirmBtn: { minHeight: 40, borderRadius: 12, backgroundColor: '#fce4ec', paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center' },
  deleteConfirmBtnText: { fontSize: 15, fontWeight: '600', color: '#e53935' },
});