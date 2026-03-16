import React, { useMemo, useState } from 'react';
import { Image, Modal, SafeAreaView, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { BORDER_RADIUS, COLORS, SPACING } from '../constants/theme';

const PAGE_SIZE = 10;

const INITIAL_RAW_ROWS = [
  { id: 'RM0019', name: 'Raw Material 19', unit: 'meters', category: 'Home & Garden', supplier: 'Supplier E', hasImage: true, status: 'Inactive', description: 'Description for Raw Material 19', imageUrls: ['https://placehold.co/40x40'] },
  { id: 'RM0020', name: 'Raw Material 20', unit: 'meters', category: 'Sports', supplier: 'Supplier A', hasImage: false, status: 'Active', description: '', imageUrls: [] },
  { id: 'RM0014', name: 'Raw Material 14', unit: 'kg', category: 'Sports', supplier: 'Supplier C', hasImage: false, status: 'Active', description: '', imageUrls: [] },
  { id: 'RM0015', name: 'Raw Material 15', unit: 'kg', category: 'Books', supplier: 'Supplier D', hasImage: false, status: 'Active', description: '', imageUrls: [] },
  { id: 'RM0017', name: 'Raw Material 17', unit: 'pieces', category: 'Books', supplier: 'Supplier A', hasImage: false, status: 'Active', description: '', imageUrls: [] },
  { id: 'RM0018', name: 'Raw Material 18', unit: 'meters', category: 'Beauty', supplier: 'Supplier A', hasImage: false, status: 'Active', description: '', imageUrls: [] },
  { id: 'RM0016', name: 'Raw Material 16', unit: 'meters', category: 'Books', supplier: 'Supplier E', hasImage: false, status: 'Active', description: '', imageUrls: [] },
  { id: 'RM0008', name: 'Raw Material 8', unit: 'meters', category: 'Electronics', supplier: 'Supplier C', hasImage: false, status: 'Active', description: '', imageUrls: [] },
  { id: 'RM0009', name: 'Raw Material 9', unit: 'pieces', category: 'Electronics', supplier: 'Supplier C', hasImage: false, status: 'Inactive', description: '', imageUrls: [] },
  { id: 'RM0011', name: 'Raw Material 11', unit: 'pieces', category: 'Automotive', supplier: 'Supplier E', hasImage: false, status: 'Active', description: '', imageUrls: [] },
  { id: 'RM0001', name: 'Raw Material 1', unit: 'kg', category: 'Chemicals', supplier: 'Supplier A', hasImage: false, status: 'Active', description: '', imageUrls: [] },
  { id: 'RM0002', name: 'Raw Material 2', unit: 'liters', category: 'Metals', supplier: 'Supplier B', hasImage: true, status: 'Active', description: '', imageUrls: ['https://placehold.co/40x40'] },
  { id: 'RM0003', name: 'Raw Material 3', unit: 'meters', category: 'Plastics', supplier: 'Supplier C', hasImage: false, status: 'Active', description: '', imageUrls: [] },
  { id: 'RM0004', name: 'Raw Material 4', unit: 'kg', category: 'Chemicals', supplier: 'Supplier D', hasImage: true, status: 'Active', description: '', imageUrls: ['https://placehold.co/40x40'] },
  { id: 'RM0005', name: 'Raw Material 5', unit: 'pieces', category: 'Textiles', supplier: 'Supplier E', hasImage: false, status: 'Active', description: '', imageUrls: [] },
  { id: 'RM0006', name: 'Raw Material 6', unit: 'kg', category: 'Metals', supplier: 'Supplier A', hasImage: true, status: 'Active', description: '', imageUrls: ['https://placehold.co/40x40'] },
  { id: 'RM0007', name: 'Raw Material 7', unit: 'liters', category: 'Chemicals', supplier: 'Supplier B', hasImage: false, status: 'Active', description: '', imageUrls: [] },
  { id: 'RM0010', name: 'Raw Material 10', unit: 'pieces', category: 'Metals', supplier: 'Supplier E', hasImage: false, status: 'Active', description: '', imageUrls: [] },
  { id: 'RM0012', name: 'Raw Material 12', unit: 'liters', category: 'Plastics', supplier: 'Supplier B', hasImage: true, status: 'Active', description: '', imageUrls: ['https://placehold.co/40x40'] },
  { id: 'RM0013', name: 'Raw Material 13', unit: 'meters', category: 'Metals', supplier: 'Supplier C', hasImage: false, status: 'Active', description: '', imageUrls: [] },
];

const EMPTY_FORM = {
  name: '',
  unit: '',
  category: '',
  supplier: '',
  description: '',
  imageUrls: [],
  active: true,
};

function ActiveBadge({ status }) {
  const active = status === 'Active';
  return (
    <View style={[styles.badge, active ? styles.badgeActive : styles.badgeInactive]}>
      <Text style={[styles.badgeText, active ? styles.badgeTextActive : styles.badgeTextInactive]}>{status}</Text>
    </View>
  );
}

function StatusBadge({ status }) {
  const active = status === 'Active';
  return (
    <View style={[styles.badge, active ? styles.badgeActive : styles.badgeInactive]}>
      <Text style={[styles.badgeText, active ? styles.badgeTextActive : styles.badgeTextInactive]}>{status}</Text>
    </View>
  );
}

export default function RawMaterialsScreen() {
  const [rawRows, setRawRows] = useState(INITIAL_RAW_ROWS);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [addForm, setAddForm] = useState(EMPTY_FORM);
  const [editForm, setEditForm] = useState(EMPTY_FORM);

  const totalPages  = Math.max(1, Math.ceil(rawRows.length / PAGE_SIZE));
  const pageStart   = (currentPage - 1) * PAGE_SIZE;
  const pageRows    = useMemo(() => rawRows.slice(pageStart, pageStart + PAGE_SIZE), [rawRows, pageStart]);
  const showingStart = pageRows.length ? pageStart + 1 : 0;
  const showingEnd   = Math.min(pageStart + PAGE_SIZE, rawRows.length);

  const openEdit = (row) => {
    setSelectedRow(row);
    setEditForm({
      name: row.name,
      unit: row.unit,
      category: row.category,
      supplier: row.supplier,
      description: row.description || '',
      imageUrls: row.imageUrls || [],
      active: row.status === 'Active',
    });
    setShowEditModal(true);
  };

  const submitCreate = () => {
    const nextId = `RM${String(rawRows.length + 1).padStart(4, '0')}`;
    const next = {
      id: nextId,
      name: addForm.name.trim() || `Raw Material ${rawRows.length + 1}`,
      unit: addForm.unit.trim() || 'kg',
      category: addForm.category.trim() || 'General',
      supplier: addForm.supplier.trim() || 'Supplier A',
      description: addForm.description,
      imageUrls: addForm.imageUrls,
      hasImage: addForm.imageUrls.length > 0,
      status: addForm.active ? 'Active' : 'Inactive',
    };
    setRawRows((prev) => [next, ...prev]);
    setAddForm(EMPTY_FORM);
    setShowAddModal(false);
    setCurrentPage(1);
  };

  const submitEdit = () => {
    if (!selectedRow) return;
    setRawRows((prev) =>
      prev.map((row) =>
        row.id === selectedRow.id
          ? {
              ...row,
              name: editForm.name,
              unit: editForm.unit,
              category: editForm.category,
              supplier: editForm.supplier,
              description: editForm.description,
              imageUrls: editForm.imageUrls,
              hasImage: editForm.imageUrls.length > 0,
              status: editForm.active ? 'Active' : 'Inactive',
            }
          : row
      )
    );
    setShowEditModal(false);
    setSelectedRow(null);
  };

  const confirmDelete = () => {
    if (!selectedRow) return;
    setRawRows((prev) => prev.filter((row) => row.id !== selectedRow.id));
    setShowDeleteModal(false);
    setSelectedRow(null);
  };

  const MaterialModalForm = ({ title, form, setForm, primaryLabel, onPrimaryPress, onClose, showExistingCount }) => (
    <View style={styles.modalCard}>
      <View style={styles.modalHeader}>
        <Text style={styles.modalTitle}>{title}</Text>
        <TouchableOpacity style={styles.modalCloseBtn} onPress={onClose}>
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
            <Text style={styles.inputLabel}>Unit *</Text>
            <TextInput value={form.unit} onChangeText={(v) => setForm({ ...form, unit: v })} style={styles.inputBox} />
          </View>
          <View style={styles.formCol}>
            <Text style={styles.inputLabel}>Category *</Text>
            <TextInput value={form.category} onChangeText={(v) => setForm({ ...form, category: v })} style={styles.inputBox} />
          </View>
          <View style={styles.formCol}>
            <Text style={styles.inputLabel}>Supplier *</Text>
            <TextInput value={form.supplier} onChangeText={(v) => setForm({ ...form, supplier: v })} style={styles.inputBox} />
          </View>
        </View>

        <Text style={styles.inputLabel}>Description</Text>
        <TextInput value={form.description} onChangeText={(v) => setForm({ ...form, description: v })} style={styles.textArea} multiline />

        <Text style={styles.inputLabel}>Images</Text>
        <TouchableOpacity style={styles.fileInputMock} activeOpacity={0.9}>
          <Text style={styles.fileInputMockText}>Choose Files  </Text>
          <Text style={styles.fileInputMockSub}>No file chosen</Text>
        </TouchableOpacity>

        {showExistingCount && (
          <Text style={styles.existingCountText}>{form.imageUrls.length} existing image(s)</Text>
        )}

        <View style={styles.activeRow}>
          <Switch value={form.active} onValueChange={(v) => setForm({ ...form, active: v })} trackColor={{ false: '#ccc', true: '#8db2ff' }} thumbColor={form.active ? '#2453e6' : '#f4f3f4'} />
          <Text style={styles.activeText}>Active</Text>
        </View>
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
          <MaterialCommunityIcons name="package-variant-closed" size={20} color={COLORS.textPrimary} style={styles.headerIcon} />
          <Text style={styles.headerTitle}>Raw Material Management</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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

          <View style={styles.tableCard}>
            <ScrollView horizontal showsHorizontalScrollIndicator>
              <View>
                <View style={styles.tableHeaderRow}>
                  <Text style={[styles.tableHeaderText, styles.nameCol]}>Name</Text>
                  <Text style={[styles.tableHeaderText, styles.unitCol]}>Unit</Text>
                  <Text style={[styles.tableHeaderText, styles.categoryCol]}>Category</Text>
                  <Text style={[styles.tableHeaderText, styles.supplierCol]}>Supplier</Text>
                  <Text style={[styles.tableHeaderText, styles.imagesCol]}>Images</Text>
                  <Text style={[styles.tableHeaderText, styles.statusCol]}>Status</Text>
                  <Text style={[styles.tableHeaderText, styles.actionCol]}>Actions</Text>
                </View>

                {pageRows.map((item) => (
                  <View key={item.id} style={styles.tableBodyRow}>
                    <Text style={[styles.tableBodyTextStrong, styles.nameCol]}>{item.name}</Text>
                    <Text style={[styles.tableBodyTextMuted, styles.unitCol]}>{item.unit}</Text>
                    <Text style={[styles.tableBodyTextMuted, styles.categoryCol]}>{item.category}</Text>
                    <Text style={[styles.tableBodyTextMuted, styles.supplierCol]}>{item.supplier}</Text>
                    <View style={styles.imagesCol}>
                      {item.hasImage ? (
                        <View style={styles.imageThumbWrap}>
                          <Image source={{ uri: item.imageUrls[0] || 'https://placehold.co/40x40' }} style={styles.imageThumb} />
                        </View>
                      ) : (
                        <Text style={styles.noImagesText}>No images</Text>
                      )}
                    </View>
                    <View style={styles.statusCol}>
                      <StatusBadge status={item.status} />
                    </View>
                    <View style={[styles.actionCol, styles.actionRow]}>
                      <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7} onPress={() => openEdit(item)}>
                        <MaterialCommunityIcons name="pencil-outline" size={15} color="#555" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.iconBtn}
                        activeOpacity={0.7}
                        onPress={() => {
                          setSelectedRow(item);
                          setShowDeleteModal(true);
                        }}
                      >
                        <MaterialCommunityIcons name="trash-can-outline" size={15} color="#e53935" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>

          <Text style={styles.paginationSummary}>Showing {showingStart} to {showingEnd} of {rawRows.length} raw materials</Text>
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
          <MaterialModalForm
            title="Add New Raw Material"
            form={addForm}
            setForm={setAddForm}
            primaryLabel="Create Raw Material"
            onPrimaryPress={submitCreate}
            onClose={() => setShowAddModal(false)}
            showExistingCount={false}
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
            showExistingCount={true}
          />
        </View>
      </Modal>

      <Modal visible={showDeleteModal} transparent animationType="fade" onRequestClose={() => setShowDeleteModal(false)}>
        <View style={styles.modalBackdropCenter}>
          <View style={styles.deleteModalCard}>
            <Text style={styles.deleteTitle}>Confirm Delete</Text>
            <Text style={styles.deleteMessage}>Are you sure you want to delete the raw material "{selectedRow?.name}"? This action cannot be undone.</Text>
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
  tableHeaderRow: { flexDirection: 'row', alignItems: 'center', minHeight: 52, borderBottomWidth: 1, borderBottomColor: COLORS.gray200, paddingHorizontal: 10, backgroundColor: '#fff' },
  tableBodyRow: { flexDirection: 'row', alignItems: 'center', minHeight: 60, borderBottomWidth: 1, borderBottomColor: COLORS.gray200, paddingHorizontal: 10, backgroundColor: '#fff' },
  tableHeaderText: { fontSize: 15, fontWeight: '700', color: '#222' },
  tableBodyTextStrong: { fontSize: 15, fontWeight: '600', color: '#222' },
  tableBodyTextMuted: { fontSize: 15, color: '#676767' },
  nameCol: { width: 240 },
  unitCol: { width: 120 },
  categoryCol: { width: 150 },
  supplierCol: { width: 160 },
  imagesCol: { width: 130 },
  statusCol: { width: 120 },
  actionCol: { width: 100 },
  imageThumbWrap: { width: 40, height: 40, borderRadius: 6, borderWidth: 1, borderColor: '#d6d6d6', overflow: 'hidden' },
  imageThumb: { width: '100%', height: '100%' },
  noImagesText: { fontSize: 15, color: '#6f6f6f' },
  badge: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  badgeActive: { backgroundColor: '#2453e6' },
  badgeInactive: { backgroundColor: '#fce4ec' },
  badgeText: { fontSize: 12, fontWeight: '700' },
  badgeTextActive: { color: COLORS.white },
  badgeTextInactive: { color: '#c62828' },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  iconBtn: { width: 28, height: 28, borderRadius: 7, borderWidth: 1, borderColor: '#dfdfdf', backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center' },
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
  modalTitle: { fontSize: 36, fontWeight: '700', color: '#111' },
  modalCloseBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  modalBody: { flex: 1 },
  modalBodyContent: { padding: 14, paddingBottom: 24 },
  formGrid: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 14, rowGap: 10 },
  formCol: { width: '48%' },
  inputLabel: { fontSize: 16, fontWeight: '600', color: '#222', marginBottom: 8, marginTop: 2 },
  inputBox: { minHeight: 46, borderRadius: 12, borderWidth: 1, borderColor: '#d6d6d6', backgroundColor: '#fff', paddingHorizontal: 12, fontSize: 17, color: '#111' },
  textArea: { minHeight: 90, borderRadius: 12, borderWidth: 1, borderColor: '#d6d6d6', backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, color: '#111', textAlignVertical: 'top' },
  fileInputMock: { marginTop: 4, minHeight: 44, borderRadius: 10, borderWidth: 1, borderColor: '#d6d6d6', backgroundColor: '#fafafa', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10 },
  fileInputMockText: { fontSize: 17, fontWeight: '600', color: '#111' },
  fileInputMockSub: { fontSize: 17, color: '#333' },
  existingCountText: { marginTop: 6, fontSize: 12, color: '#6d6d6d' },
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
