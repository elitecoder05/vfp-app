import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Modal, RefreshControl, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { getUsers } from '../api/api-methods';
import { BORDER_RADIUS, COLORS, SPACING } from '../constants/theme';

const PAGE_SIZE = 10;

const EMPTY_FORM = {
  name: '',
  phone: '',
  password: '',
  role: '',
  permission: 'Read Only',
};

const PERMISSION_LABELS = {
  full_access: 'Full Access',
  read_only: 'Read Only',
  read_write: 'Read Write',
};

const mapUser = (row) => ({
  id: row._id,
  name: row.name || 'N/A',
  contact: row.phone || 'N/A',
  role: row.role_ids?.length ? 'Assigned' : 'None',
  permission: PERMISSION_LABELS[row.permissions] || 'Read Only',
});

function PermissionBadge({ permission }) {
  const fullAccess = permission === 'Full Access';
  return (
    <View style={[styles.badge, fullAccess ? styles.badgeFull : styles.badgeRead]}>
      <Text style={[styles.badgeText, fullAccess ? styles.badgeTextFull : styles.badgeTextRead]}>{permission}</Text>
    </View>
  );
}

export default function UserManagementScreen() {
  const { width } = useWindowDimensions();
  const compact = width < 700;

  const [currentPage, setCurrentPage] = useState(1);
  const [userRows, setUserRows] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [addForm, setAddForm] = useState(EMPTY_FORM);
  const [editForm, setEditForm] = useState(EMPTY_FORM);

  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const pageRows = useMemo(() => userRows, [userRows]);

  const showingStart = pageRows.length ? pageStart + 1 : 0;
  const showingEnd = pageRows.length ? showingStart + pageRows.length - 1 : 0;

  const fetchUsers = async (page = currentPage) => {
    setLoading(true);
    setError('');
    try {
      const response = await getUsers(page, PAGE_SIZE);
      setUserRows((response.data || []).map(mapUser));
      setCurrentPage(response.pagination?.currentPage || page);
      setTotalPages(response.pagination?.totalPages || 1);
      setTotalItems(response.pagination?.totalItems || 0);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchUsers(currentPage);
    } finally {
      setRefreshing(false);
    }
  };

  const validateForm = (form, isEdit = false) => {
    if (!form.name.trim()) {
      Alert.alert('Validation Error', 'Name is required');
      return false;
    }
    if (!form.phone.trim()) {
      Alert.alert('Validation Error', 'Phone number is required');
      return false;
    }
    if (!isEdit && !form.password.trim()) {
      Alert.alert('Validation Error', 'Password is required');
      return false;
    }
    if (!form.role.trim()) {
      Alert.alert('Validation Error', 'Role is required');
      return false;
    }
    return true;
  };

  const openAdd = () => {
    setAddForm({ ...EMPTY_FORM });
    setShowAddModal(true);
  };

  const submitAdd = () => {
    if (!validateForm(addForm, false)) return;

    const newUser = {
      id: String(Date.now()),
      name: addForm.name.trim(),
      contact: addForm.phone.trim(),
      role: addForm.role.trim(),
      permission: addForm.permission,
    };
    setUserRows((current) => [newUser, ...current]);
    setCurrentPage(1);
    setShowAddModal(false);
  };

  const openEdit = (user) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name,
      phone: user.contact,
      password: '',
      role: user.role,
      permission: user.permission,
    });
    setShowEditModal(true);
  };

  const submitEdit = () => {
    if (!selectedUser) return;
    if (!validateForm(editForm, true)) return;

    const updated = {
      ...selectedUser,
      name: editForm.name.trim(),
      contact: editForm.phone.trim(),
      role: editForm.role.trim(),
      permission: editForm.permission,
    };
    setUserRows((current) => current.map((item) => (item.id === selectedUser.id ? updated : item)));
    setShowEditModal(false);
    setSelectedUser(null);
  };

  const openDelete = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (!selectedUser) return;

    setUserRows((current) => {
      const nextRows = current.filter((item) => item.id !== selectedUser.id);
      const nextPages = Math.max(1, Math.ceil(nextRows.length / PAGE_SIZE));
      setCurrentPage((page) => Math.min(page, nextPages));
      return nextRows;
    });
    setShowDeleteModal(false);
    setSelectedUser(null);
  };

  const renderPermissionSelector = (form, setForm) => (
    <View style={styles.permissionBox}>
      {['Read Only', 'Full Access'].map((option) => {
        const checked = form.permission === option;
        return (
          <TouchableOpacity
            key={option}
            style={styles.radioRow}
            activeOpacity={0.85}
            onPress={() => setForm((current) => ({ ...current, permission: option }))}
          >
            <View style={[styles.radioOuter, checked && styles.radioOuterChecked]}>
              {checked ? <View style={styles.radioInner} /> : null}
            </View>
            <Text style={styles.radioLabel}>{option}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderUserFormModal = ({ title, form, setForm, showPasswordRequired, primaryLabel, onPrimaryPress, onClose }) => (
    <View style={[styles.formModalCard, compact && styles.formModalCardCompact]}>
      <View style={styles.formModalHeader}>
        <Text style={styles.formModalTitle}>{title}</Text>
        <TouchableOpacity onPress={onClose} activeOpacity={0.85} style={styles.modalCloseBtn}>
          <MaterialCommunityIcons name="close" size={22} color="#1f1f1f" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.formModalBody} contentContainerStyle={styles.formModalBodyContent}>
        <Text style={styles.formLabel}>Name *</Text>
        <TextInput
          value={form.name}
          onChangeText={(value) => setForm((current) => ({ ...current, name: value }))}
          style={styles.formInput}
          placeholder="Enter name"
          placeholderTextColor="#9d9d9d"
        />

        <Text style={styles.formLabel}>Phone Number *</Text>
        <TextInput
          value={form.phone}
          onChangeText={(value) => setForm((current) => ({ ...current, phone: value.replace(/[^0-9]/g, '') }))}
          style={styles.formInput}
          keyboardType="number-pad"
          placeholder="Enter phone number"
          placeholderTextColor="#9d9d9d"
          maxLength={10}
        />

        <Text style={styles.formLabel}>{showPasswordRequired ? 'Password *' : 'Password (optional)'}</Text>
        <TextInput
          value={form.password}
          onChangeText={(value) => setForm((current) => ({ ...current, password: value }))}
          style={styles.formInput}
          placeholder={showPasswordRequired ? 'Enter password' : 'Leave blank to keep existing password'}
          placeholderTextColor="#9d9d9d"
          secureTextEntry
        />

        <Text style={styles.formLabel}>Roles *</Text>
        <TextInput
          value={form.role}
          onChangeText={(value) => setForm((current) => ({ ...current, role: value }))}
          style={styles.formInput}
          placeholder="Enter role"
          placeholderTextColor="#9d9d9d"
        />

        <Text style={styles.formLabel}>Permissions *</Text>
        {renderPermissionSelector(form, setForm)}
      </ScrollView>

      <View style={styles.formModalFooter}>
        <TouchableOpacity style={styles.secondaryBtn} onPress={onClose} activeOpacity={0.85}>
          <Text style={styles.secondaryBtnText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.primaryBtn} onPress={onPrimaryPress} activeOpacity={0.85}>
          <Text style={styles.primaryBtnText}>{primaryLabel}</Text>
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
          <Text style={styles.headerTitle}>User Management</Text>
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
              <Text style={styles.screenTitle}>Users</Text>
              <Text style={styles.screenSubtitle}>Manage users, roles, and permissions for your organization.</Text>
            </View>
            <TouchableOpacity style={styles.addButton} activeOpacity={0.85} onPress={openAdd}>
              <MaterialCommunityIcons name="plus" size={17} color={COLORS.white} />
              <Text style={styles.addButtonText}>Add User</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.stateBox}>
              <ActivityIndicator size="large" color="#2453e6" />
              <Text style={styles.stateText}>Loading users...</Text>
            </View>
          ) : error ? (
            <View style={styles.stateBox}>
              <MaterialCommunityIcons name="alert-circle-outline" size={40} color="#e53935" />
              <Text style={styles.stateText}>{error}</Text>
              <TouchableOpacity style={styles.retryBtn} onPress={() => fetchUsers(currentPage)}>
                <Text style={styles.retryBtnText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : pageRows.length === 0 ? (
            <View style={styles.stateBox}>
              <MaterialCommunityIcons name="account-group-outline" size={40} color="#9e9e9e" />
              <Text style={styles.stateText}>No users found</Text>
            </View>
          ) : (
            <>
              <View style={styles.cardList}>
                {pageRows.map((row) => (
                  <View key={row.id} style={styles.card}>
                    <View style={styles.cardTopRow}>
                      <View style={styles.userWrap}>
                        <View style={styles.avatarContainer}>
                          <MaterialCommunityIcons name="account-outline" size={22} color={COLORS.gray600} />
                        </View>
                        <View style={styles.rowTextGroup}>
                          <Text style={styles.rowName}>{row.name}</Text>
                          <View style={styles.phoneRow}>
                            <MaterialCommunityIcons name="phone-outline" size={13} color="#888" />
                            <Text style={styles.rowContact}>{row.contact}</Text>
                          </View>
                        </View>
                      </View>
                      <PermissionBadge permission={row.permission} />
                    </View>
                    <View style={styles.roleRow}>
                      <Text style={styles.roleLabel}>Role</Text>
                      <Text style={styles.roleText}>{row.role}</Text>
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
                Showing {showingStart} to {showingEnd} of {totalItems} users
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
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalBackdrop}>
          {renderUserFormModal({
            title: 'Add New User',
            form: addForm,
            setForm: setAddForm,
            showPasswordRequired: true,
            primaryLabel: 'Create User',
            onPrimaryPress: submitAdd,
            onClose: () => setShowAddModal(false),
          })}
        </View>
      </Modal>

      <Modal
        visible={showEditModal}
        transparent
        animationType="fade"
        presentationStyle="overFullScreen"
        statusBarTranslucent
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalBackdrop}>
          {renderUserFormModal({
            title: 'Edit User',
            form: editForm,
            setForm: setEditForm,
            showPasswordRequired: false,
            primaryLabel: 'Update User',
            onPrimaryPress: submitEdit,
            onClose: () => setShowEditModal(false),
          })}
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
              <Text style={styles.deleteTitle}>Confirm Delete</Text>
            </View>
            <View style={styles.deleteModalBody}>
              <Text style={styles.deleteMessage}>
                Are you sure you want to delete <Text style={styles.deleteMessageBold}>{selectedUser?.name}</Text>? This action cannot be undone.
              </Text>
            </View>
            <View style={styles.deleteActions}>
              <TouchableOpacity style={styles.secondaryBtn} onPress={() => setShowDeleteModal(false)}>
                <Text style={styles.secondaryBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteBtn} onPress={confirmDelete}>
                <Text style={styles.deleteBtnText}>Delete</Text>
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
  userWrap: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatarContainer: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.gray200,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  rowTextGroup: { flex: 1 },
  rowName: { fontSize: 16, fontWeight: '600', color: '#171717' },
  phoneRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 },
  rowContact: { fontSize: 12, color: '#6d6d6d' },
  roleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 },
  roleLabel: { fontSize: 12, color: '#777' },
  roleText: { fontSize: 12, fontWeight: '500', color: '#222' },
  badge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  badgeFull: { backgroundColor: '#2453e6' },
  badgeRead: { backgroundColor: '#f1f1f1' },
  badgeText: { fontSize: 12, fontWeight: '600' },
  badgeTextFull: { color: COLORS.white },
  badgeTextRead: { color: '#333' },
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
    maxWidth: 940,
    maxHeight: '92%',
    backgroundColor: '#f7f7f7',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#cecece',
    overflow: 'hidden',
  },
  formModalCardCompact: {
    maxWidth: 680,
  },
  formModalHeader: {
    minHeight: 74,
    borderBottomWidth: 1,
    borderBottomColor: '#d6d6d6',
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  formModalTitle: { fontSize: 22, fontWeight: '700', color: '#111111', lineHeight: 28 },
  modalCloseBtn: { padding: 8, marginRight: -8 },
  formModalBody: { flex: 1 },
  formModalBodyContent: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 20,
  },
  formLabel: { marginBottom: 8, marginTop: 8, fontSize: 16, fontWeight: '700', color: '#1a1a1a' },
  formInput: {
    minHeight: 56,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#cfcfcf',
    backgroundColor: '#f7f7f7',
    paddingHorizontal: 14,
    fontSize: 16,
    color: '#111111',
  },
  permissionBox: {
    marginTop: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#cfcfcf',
    backgroundColor: '#f7f7f7',
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 12,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  radioOuter: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: '#7f7f7f',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f7f7f7',
  },
  radioOuterChecked: { borderColor: '#1f74e7' },
  radioInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#1f74e7',
  },
  radioLabel: {
    fontSize: 15,
    color: '#171717',
    lineHeight: 20,
  },
  formModalFooter: {
    minHeight: 76,
    borderTopWidth: 1,
    borderTopColor: '#d6d6d6',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  primaryBtn: {
    minHeight: 44,
    borderRadius: 14,
    backgroundColor: '#2453e6',
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: { fontSize: 13, fontWeight: '700', color: '#ffffff', lineHeight: 18 },
  secondaryBtn: {
    minHeight: 44,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#cfcfcf',
    backgroundColor: '#f7f7f7',
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: { fontSize: 14, fontWeight: '500', color: '#151515', lineHeight: 20 },

  deleteModalCard: {
    width: '100%',
    maxWidth: 780,
    backgroundColor: '#f7f7f7',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#cfcfcf',
    overflow: 'hidden',
  },
  deleteModalCardCompact: { maxWidth: 560 },
  deleteModalHeader: {
    minHeight: 108,
    borderBottomWidth: 1,
    borderBottomColor: '#d6d6d6',
    justifyContent: 'center',
    paddingHorizontal: 48,
  },
  deleteTitle: { fontSize: 46, fontWeight: '700', color: '#111111', lineHeight: 50 },
  deleteModalBody: { paddingHorizontal: 48, paddingTop: 28, paddingBottom: 20 },
  deleteMessage: { fontSize: 24, lineHeight: 36, color: '#6b6b6b' },
  deleteMessageBold: { fontWeight: '700', color: '#4a4a4a' },
  deleteActions: {
    paddingHorizontal: 48,
    paddingVertical: 24,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 14,
  },
  deleteBtn: {
    minHeight: 44,
    borderRadius: 14,
    backgroundColor: '#f7dede',
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtnText: { fontSize: 14, fontWeight: '500', color: '#e12626', lineHeight: 20 },
});
