import React, { useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { BORDER_RADIUS, COLORS, SPACING } from '../constants/theme';

const PAGE_SIZE = 10;

const ORDER_ROWS = [
  { id: 'ORD22', customer: 'Customer 1' },
  { id: 'ORD21', customer: 'Customer 1' },
  { id: 'ORD23', customer: 'Customer 18' },
  { id: 'ORD0020', customer: 'Customer 16' },
  { id: 'ORD0019', customer: 'Customer 16' },
  { id: 'ORD0018', customer: 'Customer 8' },
  { id: 'ORD0017', customer: 'Customer 12' },
  { id: 'ORD0016', customer: 'Customer 10' },
  { id: 'ORD0014', customer: 'Customer 13' },
  { id: 'ORD0015', customer: 'Customer 8' },
  { id: 'ORD0013', customer: 'Customer 7' },
  { id: 'ORD0012', customer: 'Customer 5' },
  { id: 'ORD0011', customer: 'Customer 6' },
  { id: 'ORD0010', customer: 'Customer 4' },
  { id: 'ORD0009', customer: 'Customer 11' },
  { id: 'ORD0008', customer: 'Customer 2' },
  { id: 'ORD0007', customer: 'Customer 15' },
  { id: 'ORD0006', customer: 'Customer 9' },
  { id: 'ORD0005', customer: 'Customer 14' },
  { id: 'ORD0004', customer: 'Customer 3' },
  { id: 'ORD0003', customer: 'Customer 17' },
  { id: 'ORD0002', customer: 'Customer 20' },
  { id: 'ORD0001', customer: 'Customer 19' },
];

export default function OrdersScreen() {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(ORDER_ROWS.length / PAGE_SIZE);
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const pageRows = useMemo(
    () => ORDER_ROWS.slice(pageStart, pageStart + PAGE_SIZE),
    [pageStart]
  );

  const showingStart = pageRows.length ? pageStart + 1 : 0;
  const showingEnd = Math.min(pageStart + PAGE_SIZE, ORDER_ROWS.length);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <MaterialCommunityIcons
            name="package-variant-closed"
            size={20}
            color={COLORS.textPrimary}
            style={styles.headerIcon}
          />
          <Text style={styles.headerTitle}>Order Management</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.innerContent}>
          <Text style={styles.screenTitle}>Orders</Text>
          <Text style={styles.screenSubtitle}>
            Manage orders, track shipments, and handle customer requests.
          </Text>

          <View style={styles.toolbar}>
            <TouchableOpacity style={styles.filterButton} activeOpacity={0.85}>
              <Text style={styles.filterButtonText}>All Orders</Text>
              <MaterialCommunityIcons name="chevron-down" size={20} color={COLORS.textPrimary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.createButton} activeOpacity={0.85}>
              <MaterialCommunityIcons name="plus" size={18} color={COLORS.white} />
              <Text style={styles.createButtonText}>Create Order</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.tableCard}>
            <ScrollView horizontal showsHorizontalScrollIndicator={true}>
              <View>
                <View style={styles.tableHeaderRow}>
                  <Text style={[styles.tableHeaderCell, styles.indexColumn]}>#</Text>
                  <Text style={[styles.tableHeaderCell, styles.idColumn]}>Order ID</Text>
                  <Text style={[styles.tableHeaderCell, styles.customerColumn]}>Customer</Text>
                </View>

                {pageRows.map((row) => (
                  <View key={row.id} style={styles.tableBodyRow}>
                    <View style={styles.indexColumn}>
                      <MaterialCommunityIcons name="chevron-right" size={18} color={COLORS.textPrimary} />
                    </View>
                    <Text style={[styles.tableBodyCell, styles.idColumn]}>{row.id}</Text>
                    <Text style={[styles.tableBodyCell, styles.customerColumn]}>{row.customer}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>

          <Text style={styles.paginationSummary}>
            Showing {showingStart} to {showingEnd} of {ORDER_ROWS.length} orders
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
              <Text
                style={[
                  styles.paginationButtonText,
                  currentPage === totalPages && styles.paginationButtonTextDisabled,
                ]}
              >
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
    fontSize: 22,
    lineHeight: 30,
    fontWeight: '700',
    color: '#161616',
  },
  screenSubtitle: {
    marginTop: 4,
    fontSize: 15,
    lineHeight: 22,
    color: '#6d6d6d',
    maxWidth: '95%',
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 22,
  },
  filterButton: {
    minWidth: 154,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dfdfdf',
    backgroundColor: COLORS.white,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginRight: 12,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#151515',
  },
  createButton: {
    height: 40,
    borderRadius: 12,
    backgroundColor: '#2453e6',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  createButtonText: {
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
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 480,
    height: 48,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
    backgroundColor: COLORS.white,
  },
  tableHeaderCell: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2b2b2b',
  },
  tableBodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 480,
    height: 62,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
    backgroundColor: COLORS.white,
  },
  tableBodyCell: {
    fontSize: 16,
    color: '#191919',
  },
  indexColumn: {
    width: 50,
    justifyContent: 'center',
  },
  idColumn: {
    width: 225,
    fontWeight: '600',
  },
  customerColumn: {
    width: 180,
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