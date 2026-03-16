import React, { useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { BORDER_RADIUS, COLORS, SPACING } from '../constants/theme';

const PAGE_SIZE = 10;

const USER_ROWS = [
  { id: '1',  name: 'User 1',  contact: '1234567801' },
  { id: '2',  name: 'User 2',  contact: '1234567802' },
  { id: '3',  name: 'User 3',  contact: '1234567803' },
  { id: '4',  name: 'User 4',  contact: '1234567804' },
  { id: '5',  name: 'User 5',  contact: '1234567805' },
  { id: '6',  name: 'User 6',  contact: '1234567806' },
  { id: '7',  name: 'User 7',  contact: '1234567807' },
  { id: '8',  name: 'User 8',  contact: '1234567808' },
  { id: '9',  name: 'User 9',  contact: '1234567809' },
  { id: '10', name: 'User 10', contact: '1234567810' },
  { id: '11', name: 'User 11', contact: '1234567811' },
  { id: '12', name: 'User 12', contact: '1234567812' },
  { id: '13', name: 'User 13', contact: '1234567813' },
  { id: '14', name: 'User 14', contact: '1234567814' },
  { id: '15', name: 'User 15', contact: '1234567815' },
  { id: '16', name: 'User 16', contact: '1234567816' },
  { id: '17', name: 'User 17', contact: '1234567817' },
  { id: '18', name: 'User 18', contact: '1234567818' },
  { id: '19', name: 'User 19', contact: '1234567819' },
  { id: '20', name: 'User 20', contact: '1234567820' },
  { id: '21', name: 'User 21', contact: '1234567821' },
];

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
          <Text style={styles.screenTitle}>Users</Text>
          <Text style={styles.screenSubtitle}>
            Manage users, roles, and permissions for your organization.
          </Text>

          <TouchableOpacity style={styles.addButton} activeOpacity={0.85}>
            <MaterialCommunityIcons name="plus" size={18} color={COLORS.white} />
            <Text style={styles.addButtonText}>Add User</Text>
          </TouchableOpacity>

          <View style={styles.tableCard}>
            <View style={styles.tableHeaderRow}>
              <Text style={styles.tableHeaderCell}>Name</Text>
            </View>

            {pageRows.map((row) => (
              <View key={row.id} style={styles.tableBodyRow}>
                <View style={styles.avatarContainer}>
                  <MaterialCommunityIcons
                    name="account-outline"
                    size={22}
                    color={COLORS.gray600}
                  />
                </View>
                <View style={styles.rowTextGroup}>
                  <Text style={styles.rowName}>{row.name}</Text>
                  <Text style={styles.rowContact}>{row.contact}</Text>
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
  innerContent: { paddingHorizontal: 20, paddingTop: 28, paddingBottom: 40 },
  screenTitle: { fontSize: 24, lineHeight: 32, fontWeight: '700', color: '#161616' },
  screenSubtitle: { marginTop: 4, fontSize: 15, lineHeight: 22, color: '#6d6d6d', maxWidth: '92%' },
  addButton: {
    height: 40,
    marginTop: 18,
    marginBottom: 20,
    borderRadius: 10,
    backgroundColor: '#2453e6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: { marginLeft: 8, fontSize: 14, fontWeight: '600', color: COLORS.white },
  tableCard: {
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    backgroundColor: COLORS.white,
    overflow: 'hidden',
  },
  tableHeaderRow: {
    height: 52,
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  tableHeaderCell: { fontSize: 14, fontWeight: '600', color: '#2a2a2a' },
  tableBodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 68,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
    backgroundColor: COLORS.white,
  },
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
  rowName: { fontSize: 16, lineHeight: 22, fontWeight: '600', color: '#171717' },
  rowContact: { marginTop: 2, fontSize: 14, lineHeight: 20, color: '#6d6d6d' },
  paginationSummary: { marginTop: 28, fontSize: 15, lineHeight: 22, color: '#6d6d6d' },
  paginationRow: { marginTop: 18, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  paginationButton: {
    minWidth: 86,
    height: 32,
    paddingHorizontal: 12,
    borderRadius: 12,
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
    minWidth: 126,
    height: 38,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dfdfdf',
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageIndicatorText: { fontSize: 14, fontWeight: '600', color: '#151515' },
});
