import React, { useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { BORDER_RADIUS, COLORS, SPACING } from '../constants/theme';

const PAGE_SIZE = 10;

const INVENTORY_ROWS = [
  { id: '1', warehouse: 'Warehouse 1', itemType: 'Product', itemName: 'Product 5', itemCode: 'PROD0005', stock: 476, reserved: 20, available: 456, status: 'In Stock' },
  { id: '2', warehouse: 'Warehouse 2', itemType: 'Product', itemName: 'Product 11', itemCode: 'PROD0011', stock: 300, reserved: 49, available: 251, status: 'In Stock' },
  { id: '3', warehouse: 'Warehouse 2', itemType: 'Product', itemName: 'Product 16', itemCode: 'PROD0016', stock: 490, reserved: 16, available: 474, status: 'In Stock' },
  { id: '4', warehouse: 'Warehouse 3', itemType: 'Product', itemName: 'Product 10', itemCode: 'PROD0010', stock: 227, reserved: 34, available: 193, status: 'In Stock' },
  { id: '5', warehouse: 'Warehouse 3', itemType: 'Product', itemName: 'Product 19', itemCode: 'PROD0019', stock: 555, reserved: 1, available: 554, status: 'In Stock' },
  { id: '6', warehouse: 'Warehouse 4', itemType: 'Raw Material', itemName: 'Raw Material 15', itemCode: 'RM0004', stock: 784, reserved: 34, available: 750, status: 'In Stock' },
  { id: '7', warehouse: 'Warehouse 4', itemType: 'Raw Material', itemName: 'Raw Material 19', itemCode: 'RM0001', stock: 150, reserved: 18, available: 132, status: 'In Stock' },
  { id: '8', warehouse: 'Warehouse 4', itemType: 'Raw Material', itemName: 'Raw Material 6', itemCode: 'RM0003', stock: 616, reserved: 10, available: 606, status: 'In Stock' },
  { id: '9', warehouse: 'Warehouse 5', itemType: 'Product', itemName: 'Product 14', itemCode: 'PROD0014', stock: 922, reserved: 24, available: 898, status: 'In Stock' },
  { id: '10', warehouse: 'Warehouse 6', itemType: 'Product', itemName: 'Product 18', itemCode: 'PROD0018', stock: 492, reserved: 37, available: 455, status: 'In Stock' },
  { id: '11', warehouse: 'Warehouse 1', itemType: 'Product', itemName: 'Product 2', itemCode: 'PROD0002', stock: 328, reserved: 22, available: 306, status: 'Low Stock' },
  { id: '12', warehouse: 'Warehouse 2', itemType: 'Product', itemName: 'Product 7', itemCode: 'PROD0007', stock: 411, reserved: 40, available: 371, status: 'In Stock' },
  { id: '13', warehouse: 'Warehouse 3', itemType: 'Product', itemName: 'Product 12', itemCode: 'PROD0012', stock: 205, reserved: 15, available: 190, status: 'In Stock' },
  { id: '14', warehouse: 'Warehouse 4', itemType: 'Raw Material', itemName: 'Raw Material 3', itemCode: 'RM0002', stock: 120, reserved: 30, available: 90, status: 'Low Stock' },
  { id: '15', warehouse: 'Warehouse 5', itemType: 'Product', itemName: 'Product 1', itemCode: 'PROD0001', stock: 700, reserved: 60, available: 640, status: 'In Stock' },
  { id: '16', warehouse: 'Warehouse 5', itemType: 'Product', itemName: 'Product 8', itemCode: 'PROD0008', stock: 270, reserved: 20, available: 250, status: 'In Stock' },
  { id: '17', warehouse: 'Warehouse 6', itemType: 'Product', itemName: 'Product 20', itemCode: 'PROD0020', stock: 680, reserved: 42, available: 638, status: 'In Stock' },
  { id: '18', warehouse: 'Warehouse 1', itemType: 'Product', itemName: 'Product 3', itemCode: 'PROD0003', stock: 190, reserved: 25, available: 165, status: 'Low Stock' },
  { id: '19', warehouse: 'Warehouse 2', itemType: 'Product', itemName: 'Product 9', itemCode: 'PROD0009', stock: 350, reserved: 26, available: 324, status: 'In Stock' },
  { id: '20', warehouse: 'Warehouse 3', itemType: 'Product', itemName: 'Product 13', itemCode: 'PROD0013', stock: 560, reserved: 31, available: 529, status: 'In Stock' },
  { id: '21', warehouse: 'Warehouse 4', itemType: 'Product', itemName: 'Product 15', itemCode: 'PROD0015', stock: 625, reserved: 17, available: 608, status: 'In Stock' },
  { id: '22', warehouse: 'Warehouse 5', itemType: 'Product', itemName: 'Product 4', itemCode: 'PROD0004', stock: 445, reserved: 19, available: 426, status: 'In Stock' },
  { id: '23', warehouse: 'Warehouse 5', itemType: 'Product', itemName: 'Product 6', itemCode: 'PROD0006', stock: 530, reserved: 24, available: 506, status: 'In Stock' },
  { id: '24', warehouse: 'Warehouse 6', itemType: 'Product', itemName: 'Product 17', itemCode: 'PROD0017', stock: 610, reserved: 33, available: 577, status: 'In Stock' },
  { id: '25', warehouse: 'Warehouse 1', itemType: 'Raw Material', itemName: 'Raw Material 1', itemCode: 'RM0005', stock: 230, reserved: 12, available: 218, status: 'In Stock' },
  { id: '26', warehouse: 'Warehouse 2', itemType: 'Raw Material', itemName: 'Raw Material 7', itemCode: 'RM0006', stock: 140, reserved: 18, available: 122, status: 'Low Stock' },
  { id: '27', warehouse: 'Warehouse 3', itemType: 'Raw Material', itemName: 'Raw Material 2', itemCode: 'RM0007', stock: 380, reserved: 20, available: 360, status: 'In Stock' },
];

function StatusBadge({ status }) {
  const inStock = status === 'In Stock';
  return (
    <View style={[styles.badge, inStock ? styles.badgeInStock : styles.badgeLowStock]}>
      <Text style={[styles.badgeText, inStock ? styles.badgeTextInStock : styles.badgeTextLowStock]}>{status}</Text>
    </View>
  );
}

export default function WarehouseInventoryScreen() {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(INVENTORY_ROWS.length / PAGE_SIZE);
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const pageRows = useMemo(
    () => INVENTORY_ROWS.slice(pageStart, pageStart + PAGE_SIZE),
    [pageStart]
  );

  const showingStart = pageRows.length ? pageStart + 1 : 0;
  const showingEnd = Math.min(pageStart + PAGE_SIZE, INVENTORY_ROWS.length);

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

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.innerContent}>
          <View style={styles.titleRow}>
            <View style={styles.titleGroup}>
              <Text style={styles.screenTitle}>Warehouse Inventory</Text>
              <Text style={styles.screenSubtitle}>Manage warehouse inventory and stock levels.</Text>
            </View>
            <TouchableOpacity style={styles.addButton} activeOpacity={0.85}>
              <MaterialCommunityIcons name="plus" size={17} color={COLORS.white} />
              <Text style={styles.addButtonText}>Add Inventory</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.cardList}>
            {pageRows.map((row) => (
              <View key={row.id} style={styles.card}>
                <View style={styles.cardTopRow}>
                  <View style={styles.cardTopLeft}>
                    <Text style={styles.rowWarehouse}>{row.warehouse}</Text>
                    <Text style={styles.itemType}>{row.itemType}</Text>
                  </View>
                  <StatusBadge status={row.status} />
                </View>

                <Text style={styles.rowItemName}>{row.itemName}</Text>
                <Text style={styles.rowItemCode}>{row.itemCode}</Text>

                <View style={styles.statsGrid}>
                  <View style={styles.statChip}><Text style={styles.statLabel}>Stock</Text><Text style={styles.statValue}>{row.stock}</Text></View>
                  <View style={styles.statChip}><Text style={styles.statLabel}>Reserved</Text><Text style={styles.statValue}>{row.reserved}</Text></View>
                  <View style={styles.statChip}><Text style={styles.statLabel}>Available</Text><Text style={styles.statValue}>{row.available}</Text></View>
                </View>

                <View style={styles.actionRow}>
                  <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
                    <MaterialCommunityIcons name="pencil-outline" size={16} color="#555" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
                    <MaterialCommunityIcons name="chart-line" size={16} color="#1db954" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
                    <MaterialCommunityIcons name="trash-can-outline" size={16} color="#ff3b30" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>

          <Text style={styles.paginationSummary}>
            Showing {showingStart} to {showingEnd} of {INVENTORY_ROWS.length} inventories
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
  cardTopLeft: { flex: 1 },
  rowWarehouse: { fontSize: 15, fontWeight: '600', color: '#171717' },
  itemType: { marginTop: 2, fontSize: 12, color: '#6d6d6d' },
  rowItemName: { marginTop: 10, fontSize: 14, fontWeight: '600', color: '#171717' },
  rowItemCode: { marginTop: 2, fontSize: 12, color: '#6d6d6d' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  statChip: { minWidth: 88, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10, backgroundColor: '#f6f6f6' },
  statLabel: { fontSize: 11, color: '#777' },
  statValue: { marginTop: 2, fontSize: 14, fontWeight: '600', color: '#222' },
  badge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  badgeInStock: { backgroundColor: '#2453e6' },
  badgeLowStock: { backgroundColor: '#fff3e0' },
  badgeText: { fontSize: 12, fontWeight: '600' },
  badgeTextInStock: { color: COLORS.white },
  badgeTextLowStock: { color: '#e65100' },
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
