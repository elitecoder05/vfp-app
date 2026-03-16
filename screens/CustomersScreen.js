import React, { useMemo, useState } from 'react';
import { Modal, SafeAreaView, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { BORDER_RADIUS, COLORS, SPACING } from '../constants/theme';

const PAGE_SIZE = 10;

const INITIAL_CUSTOMERS = [
  { id: 'CUS0001', name: 'Customer 1', phone: '9871234567', address: 'Bihar', status: 'Active' },
  { id: 'CUS0020', name: 'Customer 20', phone: '9876543220', address: '10 Elm St, San Antonio', status: 'Active' },
  { id: 'CUS0016', name: 'Customer 16', phone: '9876543216', address: '226 Oak Ave, Philadelphia', status: 'Active' },
  { id: 'CUS0019', name: 'Customer 19', phone: '9876543219', address: '224 Pine Rd, San Jose', status: 'Active' },
  { id: 'CUS0018', name: 'Customer 18', phone: '9876543218', address: '570 Main St, New York', status: 'Active' },
  { id: 'CUS0017', name: 'Customer 17', phone: '9876543217', address: '830 Oak Ave, Dallas', status: 'Active' },
  { id: 'CUS0014', name: 'Customer 14', phone: '9876543214', address: '358 Pine Rd, San Diego', status: 'Active' },
  { id: 'CUS0015', name: 'Customer 15', phone: '9876543215', address: '216 Pine Rd, Phoenix', status: 'Inactive' },
  { id: 'CUS0009', name: 'Customer 9', phone: '9876543209', address: '733 Main St, Houston', status: 'Active' },
  { id: 'CUS0010', name: 'Customer 10', phone: '9876543210', address: '593 Main St, Houston', status: 'Inactive' },
  { id: 'CUS0011', name: 'Customer 11', phone: '9876543211', address: '134 Market St, Austin', status: 'Active' },
  { id: 'CUS0012', name: 'Customer 12', phone: '9876543212', address: '11 Lake Ave, Austin', status: 'Active' },
  { id: 'CUS0013', name: 'Customer 13', phone: '9876543213', address: '2 River Rd, Orlando', status: 'Active' },
  { id: 'CUS0002', name: 'Customer 2', phone: '9876543202', address: '402 Sunset Blvd, LA', status: 'Active' },
  { id: 'CUS0003', name: 'Customer 3', phone: '9876543203', address: '7 Ocean Dr, Miami', status: 'Inactive' },
  { id: 'CUS0004', name: 'Customer 4', phone: '9876543204', address: '5 Green St, Seattle', status: 'Active' },
  { id: 'CUS0005', name: 'Customer 5', phone: '9876543205', address: '124 Maple St, Denver', status: 'Active' },
  { id: 'CUS0006', name: 'Customer 6', phone: '9876543206', address: '12 Birch Rd, Portland', status: 'Inactive' },
  { id: 'CUS0007', name: 'Customer 7', phone: '9876543207', address: '88 Cedar Ave, Tampa', status: 'Active' },
  { id: 'CUS0008', name: 'Customer 8', phone: '9876543208', address: '99 Hill St, Boston', status: 'Active' },
  { id: 'CUS0021', name: 'Customer 21', phone: '9876543221', address: '4 Oakwood Ln, Chicago', status: 'Active' },
];

const EMPTY_FORM = {
  name: '',
  phone: '',
  address: '',
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

export default function CustomersScreen() {
  const [customers, setCustomers] = useState(INITIAL_CUSTOMERS);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [addForm, setAddForm] = useState(EMPTY_FORM);
  const [editForm, setEditForm] = useState(EMPTY_FORM);

  const totalPages = Math.max(1, Math.ceil(customers.length / PAGE_SIZE));
  const pageStart  = (currentPage - 1) * PAGE_SIZE;
  const pageRows   = useMemo(() => customers.slice(pageStart, pageStart + PAGE_SIZE), [customers, pageStart]);
  const showingStart = pageRows.length ? pageStart + 1 : 0;
  const showingEnd   = Math.min(pageStart + PAGE_SIZE, customers.length);

  const openEditModal = (customer) => {
    setSelectedCustomer(customer);
    setEditForm({
      name: customer.name,
      phone: customer.phone,
      address: customer.address,
      active: customer.status === 'Active',
    });
    setShowEditModal(true);
  };

  const submitAdd = () => {
    const next = {
      id: `CUS${String(customers.length + 1).padStart(4, '0')}`,
      name: addForm.name.trim() || `Customer ${customers.length + 1}`,
      phone: addForm.phone.trim() || '0000000000',
      address: addForm.address.trim() || 'Address',
      status: addForm.active ? 'Active' : 'Inactive',
    };
    setCustomers((prev) => [next, ...prev]);
    setAddForm(EMPTY_FORM);
    setShowAddModal(false);
    setCurrentPage(1);
  };

  const submitEdit = () => {
    if (!selectedCustomer) return;
    setCustomers((prev) =>
      prev.map((row) =>
        row.id === selectedCustomer.id
          ? { ...row, name: editForm.name, phone: editForm.phone, address: editForm.address, status: editForm.active ? 'Active' : 'Inactive' }
          : row
      )
    );
    setShowEditModal(false);
    setSelectedCustomer(null);
  };

  const confirmDelete = () => {
    if (!selectedCustomer) return;
    setCustomers((prev) => prev.filter((row) => row.id !== selectedCustomer.id));
    setShowDeleteModal(false);
    setSelectedCustomer(null);
  };

  const CustomerFormModal = ({ title, form, setForm, primaryLabel, onPrimaryPress, onClose }) => (
    <View style={styles.modalCard}>
      <View style={styles.modalHeader}>
        <Text style={styles.modalTitle}>{title}</Text>
        <TouchableOpacity style={styles.modalCloseBtn} onPress={onClose}>
          <MaterialCommunityIcons name="close" size={20} color="#222" />
        </TouchableOpacity>
      </View>
      <View style={styles.modalBody}>
        <Text style={styles.inputLabel}>Name *</Text>
        <TextInput value={form.name} onChangeText={(v) => setForm({ ...form, name: v })} style={styles.inputBox} />

        <Text style={styles.inputLabel}>Phone *</Text>
        <TextInput value={form.phone} onChangeText={(v) => setForm({ ...form, phone: v })} style={styles.inputBox} keyboardType="phone-pad" />

        <Text style={styles.inputLabel}>Address *</Text>
        <TextInput value={form.address} onChangeText={(v) => setForm({ ...form, address: v })} style={styles.textArea} multiline />

        <View style={styles.activeRow}>
          <Switch value={form.active} onValueChange={(v) => setForm({ ...form, active: v })} trackColor={{ false: '#ccc', true: '#8db2ff' }} thumbColor={form.active ? '#2453e6' : '#f4f3f4'} />
          <Text style={styles.activeText}>Active</Text>
        </View>
      </View>
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
          <MaterialCommunityIcons name="account-multiple-outline" size={20} color={COLORS.textPrimary} style={styles.headerIcon} />
          <Text style={styles.headerTitle}>Customer Management</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.innerContent}>
          <View style={styles.titleRow}>
            <View>
              <Text style={styles.screenTitle}>Customers</Text>
              <Text style={styles.screenSubtitle}>Manage your customer database.</Text>
            </View>
            <TouchableOpacity style={styles.addButton} activeOpacity={0.85} onPress={() => setShowAddModal(true)}>
              <MaterialCommunityIcons name="plus" size={17} color={COLORS.white} />
              <Text style={styles.addButtonText}>Add Customer</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.tableCard}>
            <ScrollView horizontal showsHorizontalScrollIndicator>
              <View>
                <View style={styles.tableHeaderRow}>
                  <Text style={[styles.tableHeaderText, styles.nameCol]}>Name</Text>
                  <Text style={[styles.tableHeaderText, styles.phoneCol]}>Phone</Text>
                  <Text style={[styles.tableHeaderText, styles.addressCol]}>Address</Text>
                  <Text style={[styles.tableHeaderText, styles.statusCol]}>Status</Text>
                  <Text style={[styles.tableHeaderText, styles.actionCol]}>Actions</Text>
                </View>
                {pageRows.map((customer) => (
                  <View key={customer.id} style={styles.tableBodyRow}>
                    <View style={[styles.nameCol, styles.nameCell]}>
                      <MaterialCommunityIcons name="account-outline" size={22} color="#6f6f6f" style={styles.nameIcon} />
                      <Text style={styles.tableBodyTextStrong}>{customer.name}</Text>
                    </View>
                    <View style={[styles.phoneCol, styles.inlineIconCell]}>
                      <MaterialCommunityIcons name="phone-outline" size={22} color="#6f6f6f" />
                      <Text style={styles.tableBodyTextMuted}>{customer.phone}</Text>
                    </View>
                    <View style={[styles.addressCol, styles.inlineIconCell]}>
                      <MaterialCommunityIcons name="map-marker-outline" size={22} color="#6f6f6f" />
                      <Text style={styles.tableBodyTextMuted}>{customer.address}</Text>
                    </View>
                    <View style={styles.statusCol}>
                      <ActiveBadge status={customer.status} />
                    </View>
                    <View style={[styles.actionCol, styles.actionRow]}>
                      <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7} onPress={() => openEditModal(customer)}>
                        <MaterialCommunityIcons name="pencil-outline" size={15} color="#555" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.iconBtn}
                        activeOpacity={0.7}
                        onPress={() => {
                          setSelectedCustomer(customer);
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

          <Text style={styles.paginationSummary}>Showing {showingStart} to {showingEnd} of {customers.length} customers</Text>
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
          <CustomerFormModal
            title="Add Customer"
            form={addForm}
            setForm={setAddForm}
            primaryLabel="Create"
            onPrimaryPress={submitAdd}
            onClose={() => setShowAddModal(false)}
          />
        </View>
      </Modal>

      <Modal visible={showEditModal} transparent animationType="fade" onRequestClose={() => setShowEditModal(false)}>
        <View style={styles.modalBackdrop}>
          <CustomerFormModal
            title="Edit Customer"
            form={editForm}
            setForm={setEditForm}
            primaryLabel="Update"
            onPrimaryPress={submitEdit}
            onClose={() => setShowEditModal(false)}
          />
        </View>
      </Modal>

      <Modal visible={showDeleteModal} transparent animationType="fade" onRequestClose={() => setShowDeleteModal(false)}>
        <View style={styles.modalBackdropCenter}>
          <View style={styles.deleteModalCard}>
            <Text style={styles.deleteTitle}>Delete Customer</Text>
            <Text style={styles.deleteMessage}>Are you sure you want to delete {selectedCustomer?.name}? This action cannot be undone.</Text>
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
  nameCol: { width: 260 },
  phoneCol: { width: 180 },
  addressCol: { width: 420 },
  statusCol: { width: 120 },
  actionCol: { width: 100 },
  nameCell: { flexDirection: 'row', alignItems: 'center' },
  nameIcon: { marginRight: 10 },
  inlineIconCell: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  badge: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  badgeActive: { backgroundColor: '#2453e6' },
  badgeInactive: { backgroundColor: '#fce4ec' },
  badgeText: { fontSize: 12, fontWeight: '700' },
  badgeTextActive: { color: COLORS.white },
  badgeTextInactive: { color: '#c62828' },
  actionRow: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  iconBtn: { width: 28, height: 28, borderRadius: 7, borderWidth: 1, borderColor: '#dfdfdf', backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center' },
  paginationSummary: { marginTop: 24, fontSize: 14, color: '#6d6d6d' },
  paginationRow: { marginTop: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  paginationButton: { minWidth: 80, height: 32, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1, borderColor: '#dfdfdf', backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center' },
  paginationButtonDisabled: { backgroundColor: '#fbfbfb' },
  paginationButtonText: { fontSize: 14, fontWeight: '600', color: '#111111' },
  paginationButtonTextDisabled: { color: '#a6a6a6' },
  pageIndicator: { minWidth: 120, height: 36, borderRadius: 8, borderWidth: 1, borderColor: '#dfdfdf', backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center' },
  pageIndicatorText: { fontSize: 14, fontWeight: '600', color: '#151515' },

  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', padding: 18, justifyContent: 'center' },
  modalCard: { maxHeight: '90%', backgroundColor: COLORS.white, borderRadius: 18, borderWidth: 1, borderColor: '#dcdcdc', overflow: 'hidden' },
  modalHeader: { minHeight: 64, borderBottomWidth: 1, borderBottomColor: '#ececec', paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  modalTitle: { fontSize: 40, fontWeight: '700', color: '#111' },
  modalCloseBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  modalBody: { paddingHorizontal: 18, paddingVertical: 14 },
  inputLabel: { fontSize: 16, fontWeight: '600', color: '#222', marginBottom: 8, marginTop: 4 },
  inputBox: { minHeight: 52, borderRadius: 14, borderWidth: 1, borderColor: '#d6d6d6', backgroundColor: '#fff', paddingHorizontal: 14, fontSize: 17, color: '#111' },
  textArea: { minHeight: 102, borderRadius: 14, borderWidth: 1, borderColor: '#d6d6d6', backgroundColor: '#fff', paddingHorizontal: 14, paddingVertical: 10, fontSize: 17, color: '#111', textAlignVertical: 'top' },
  activeRow: { marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 10 },
  activeText: { fontSize: 20, fontWeight: '500', color: '#111' },
  modalFooter: { borderTopWidth: 1, borderTopColor: '#ececec', padding: 12, flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  primaryModalBtn: { minHeight: 42, borderRadius: 12, backgroundColor: '#2453e6', paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center' },
  primaryModalBtnText: { fontSize: 18, fontWeight: '700', color: COLORS.white },
  cancelModalBtn: { minHeight: 42, borderRadius: 12, borderWidth: 1, borderColor: '#d2d2d2', backgroundColor: '#fff', paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center' },
  cancelModalBtnText: { fontSize: 18, color: '#111' },

  modalBackdropCenter: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center', padding: 16 },
  deleteModalCard: { width: '95%', maxWidth: 900, backgroundColor: COLORS.white, borderRadius: 24, borderWidth: 1, borderColor: '#d8d8d8', overflow: 'hidden', padding: 24 },
  deleteTitle: { fontSize: 52, fontWeight: '700', color: '#111' },
  deleteMessage: { marginTop: 20, fontSize: 24, lineHeight: 36, color: '#6d6d6d' },
  deleteActionRow: { marginTop: 26, flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  deleteConfirmBtn: { minHeight: 52, borderRadius: 16, backgroundColor: '#fbe8e8', paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center' },
  deleteConfirmBtnText: { fontSize: 22, fontWeight: '600', color: '#e53935' },
});