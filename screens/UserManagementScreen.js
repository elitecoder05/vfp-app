import React, { useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { BORDER_RADIUS, COLORS, SPACING } from '../constants/theme';

const PAGE_SIZE = 10;

const USER_ROWS = [
  { id: '1', name: 'User 1', contact: '1234567801', role: 'None', permission: 'Read Only' },
  { id: '2', name: 'User 2', contact: '1234567802', role: 'None', permission: 'Full Access' },
  { id: '3', name: 'User 3', contact: '1234567803', role: 'None', permission: 'Full Access' },
  { id: '4', name: 'User 4', contact: '1234567804', role: 'None', permission: 'Read Only' },
  { id: '5', name: 'User 5', contact: '1234567805', role: 'None', permission: 'Read Only' },
  { id: '6', name: 'User 6', contact: '1234567806', role: 'None', permission: 'Read Only' },
  { id: '7', name: 'User 7', contact: '1234567807', role: 'None', permission: 'Read Only' },
  { id: '8', name: 'User 8', contact: '1234567808', role: 'None', permission: 'Read Only' },
  { id: '9', name: 'User 9', contact: '1234567809', role: 'Manager', permission: 'Full Access' },
  { id: '10', name: 'User 10', contact: '1234567810', role: 'None', permission: 'Read Only' },
  { id: '11', name: 'User 11', contact: '1234567811', role: 'Supervisor', permission: 'Full Access' },
  { id: '12', name: 'User 12', contact: '1234567812', role: 'None', permission: 'Read Only' },
  { id: '13', name: 'User 13', contact: '1234567813', role: 'None', permission: 'Read Only' },
  { id: '14', name: 'User 14', contact: '1234567814', role: 'Admin', permission: 'Full Access' },
  { id: '15', name: 'User 15', contact: '1234567815', role: 'None', permission: 'Read Only' },
  { id: '16', name: 'User 16', contact: '1234567816', role: 'Manager', permission: 'Full Access' },
  { id: '17', name: 'User 17', contact: '1234567817', role: 'None', permission: 'Read Only' },
  { id: '18', name: 'User 18', contact: '1234567818', role: 'None', permission: 'Read Only' },
  { id: '19', name: 'User 19', contact: '1234567819', role: 'Supervisor', permission: 'Full Access' },
  { id: '20', name: 'User 20', contact: '1234567820', role: 'None', permission: 'Read Only' },
  { id: '21', name: 'User 21', contact: '1234567821', role: 'None', permission: 'Read Only' },
];

function PermissionBadge({ permission }) {
  const fullAccess = permission === 'Full Access';
  return (
    <View style={[styles.badge, fullAccess ? styles.badgeFull : styles.badgeRead]}>
      <Text style={[styles.badgeText, fullAccess ? styles.badgeTextFull : styles.badgeTextRead]}>{permission}</Text>
    </View>
  );
}

export default function UserManagementScreen() {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(USER_ROWS.length / PAGE_SIZE);
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const pageRows = useMemo(
    () => USER_ROWS.slice(pageStart, pageStart + PAGE_SIZE),
    [pageStart]
  );

  const showingStart = pageRows.length ? pageStart + 1 : 0;
  const showingEnd = Math.min(pageStart + PAGE_SIZE, USER_ROWS.length);

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

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.innerContent}>
          <View style={styles.titleRow}>
            <View style={styles.titleGroup}>
              <Text style={styles.screenTitle}>Users</Text>
              <Text style={styles.screenSubtitle}>Manage users, roles, and permissions for your organization.</Text>
            </View>
            <TouchableOpacity style={styles.addButton} activeOpacity={0.85}>
              <MaterialCommunityIcons name="plus" size={17} color={COLORS.white} />
              <Text style={styles.addButtonText}>Add User</Text>
            </TouchableOpacity>
          </View>

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
                  <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
                    <MaterialCommunityIcons name="pencil-outline" size={16} color="#555" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
                    <MaterialCommunityIcons name="trash-can-outline" size={16} color="#ff3b30" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>

          <Text style={styles.paginationSummary}>
            Showing {showingStart} to {showingEnd} of {USER_ROWS.length} users
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
        </View>
      </ScrollView>
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
});
