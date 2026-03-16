import React, { useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { BORDER_RADIUS, COLORS, SPACING } from '../constants/theme';

const PAGE_SIZE = 10;

const TRANSPORT_ROWS = [
  { id: '1', name: 'Vrl', contact: '8076177654' },
  { id: '2', name: 'Two Wheeler', contact: '1234567800' },
];

export default function TransportScreen() {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(TRANSPORT_ROWS.length / PAGE_SIZE));
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const pageRows = useMemo(
    () => TRANSPORT_ROWS.slice(pageStart, pageStart + PAGE_SIZE),
    [pageStart]
  );

  const showingStart = pageRows.length ? pageStart + 1 : 0;
  const showingEnd = Math.min(pageStart + PAGE_SIZE, TRANSPORT_ROWS.length);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <MaterialCommunityIcons
            name="truck-outline"
            size={20}
            color={COLORS.textPrimary}
            style={styles.headerIcon}
          />
          <Text style={styles.headerTitle}>Transport Management</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.innerContent}>
          <Text style={styles.screenTitle}>Transport</Text>
          <Text style={styles.screenSubtitle}>
            Manage transport providers with contact and location details.
          </Text>

          <TouchableOpacity style={styles.addButton} activeOpacity={0.85}>
            <MaterialCommunityIcons name="plus" size={18} color={COLORS.white} />
            <Text style={styles.addButtonText}>Add Transport</Text>
          </TouchableOpacity>

          <View style={styles.tableCard}>
            <View style={styles.tableHeaderRow}>
              <Text style={styles.tableHeaderCell}>Name</Text>
            </View>

            {pageRows.map((row) => (
              <View key={row.id} style={styles.tableBodyRow}>
                <MaterialCommunityIcons
                  name="truck-outline"
                  size={20}
                  color={COLORS.gray600}
                  style={styles.rowIcon}
                />
                <View style={styles.rowTextGroup}>
                  <Text style={styles.rowName}>{row.name}</Text>
                  <Text style={styles.rowContact}>{row.contact}</Text>
                </View>
              </View>
            ))}
          </View>

          <Text style={styles.paginationSummary}>
            Showing {showingStart} to {showingEnd} of {TRANSPORT_ROWS.length} transports
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
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginRight: SPACING.md,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  content: {
    flex: 1,
    backgroundColor: '#fcfcfa',
  },
  innerContent: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 40,
  },
  screenTitle: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '700',
    color: '#161616',
  },
  screenSubtitle: {
    marginTop: 4,
    fontSize: 15,
    lineHeight: 22,
    color: '#6d6d6d',
    maxWidth: '92%',
  },
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
  addButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
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
    backgroundColor: COLORS.white,
  },
  tableHeaderCell: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2a2a2a',
  },
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
  rowIcon: {
    marginRight: 12,
  },
  rowTextGroup: {
    flex: 1,
  },
  rowName: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
    color: '#171717',
  },
  rowContact: {
    marginTop: 2,
    fontSize: 14,
    lineHeight: 20,
    color: '#6d6d6d',
  },
  paginationSummary: {
    marginTop: 28,
    fontSize: 15,
    lineHeight: 22,
    color: '#6d6d6d',
  },
  paginationRow: {
    marginTop: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
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
  paginationButtonDisabled: {
    backgroundColor: '#fbfbfb',
  },
  paginationButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111111',
  },
  paginationButtonTextDisabled: {
    color: '#a6a6a6',
  },
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
  pageIndicatorText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#151515',
  },
});
