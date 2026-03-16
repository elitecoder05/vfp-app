import React, { useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { BORDER_RADIUS, COLORS, SPACING } from '../constants/theme';

const PAGE_SIZE = 10;

const INVENTORY_ROWS = [
  { id: '1', warehouse: 'Warehouse 1', itemName: 'Product 5',       itemCode: 'PROD0005' },
  { id: '2', warehouse: 'Warehouse 2', itemName: 'Product 11',      itemCode: 'PROD0011' },
  { id: '3', warehouse: 'Warehouse 2', itemName: 'Product 16',      itemCode: 'PROD0016' },
  { id: '4', warehouse: 'Warehouse 3', itemName: 'Product 10',      itemCode: 'PROD0010' },
  { id: '5', warehouse: 'Warehouse 3', itemName: 'Product 19',      itemCode: 'PROD0019' },
  { id: '6', warehouse: 'Warehouse 4', itemName: 'Raw Material 15', itemCode: 'RM0004'   },
  { id: '7', warehouse: 'Warehouse 4', itemName: 'Raw Material 19', itemCode: 'RM0001'   },
  { id: '8', warehouse: 'Warehouse 4', itemName: 'Raw Material 6',  itemCode: 'RM0003'   },
  { id: '9', warehouse: 'Warehouse 5', itemName: 'Product 14',      itemCode: 'PROD0014' },
  { id: '10', warehouse: 'Warehouse 6', itemName: 'Product 18',     itemCode: 'PROD0018' },
  { id: '11', warehouse: 'Warehouse 1', itemName: 'Product 2',      itemCode: 'PROD0002' },
  { id: '12', warehouse: 'Warehouse 2', itemName: 'Product 7',      itemCode: 'PROD0007' },
  { id: '13', warehouse: 'Warehouse 3', itemName: 'Product 12',     itemCode: 'PROD0012' },
  { id: '14', warehouse: 'Warehouse 4', itemName: 'Raw Material 3', itemCode: 'RM0002'   },
  { id: '15', warehouse: 'Warehouse 5', itemName: 'Product 1',      itemCode: 'PROD0001' },
  { id: '16', warehouse: 'Warehouse 5', itemName: 'Product 8',      itemCode: 'PROD0008' },
  { id: '17', warehouse: 'Warehouse 6', itemName: 'Product 20',     itemCode: 'PROD0020' },
  { id: '18', warehouse: 'Warehouse 1', itemName: 'Product 3',      itemCode: 'PROD0003' },
  { id: '19', warehouse: 'Warehouse 2', itemName: 'Product 9',      itemCode: 'PROD0009' },
  { id: '20', warehouse: 'Warehouse 3', itemName: 'Product 13',     itemCode: 'PROD0013' },
  { id: '21', warehouse: 'Warehouse 4', itemName: 'Product 15',     itemCode: 'PROD0015' },
  { id: '22', warehouse: 'Warehouse 5', itemName: 'Product 4',      itemCode: 'PROD0004' },
  { id: '23', warehouse: 'Warehouse 5', itemName: 'Product 6',      itemCode: 'PROD0006' },
  { id: '24', warehouse: 'Warehouse 6', itemName: 'Product 17',     itemCode: 'PROD0017' },
  { id: '25', warehouse: 'Warehouse 1', itemName: 'Raw Material 1', itemCode: 'RM0005'   },
  { id: '26', warehouse: 'Warehouse 2', itemName: 'Raw Material 7', itemCode: 'RM0006'   },
  { id: '27', warehouse: 'Warehouse 3', itemName: 'Raw Material 2', itemCode: 'RM0007'   },
];

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
          <Text style={styles.screenTitle}>Warehouse Inventory</Text>
          <Text style={styles.screenSubtitle}>Manage warehouse inventory and stock levels.</Text>

          <TouchableOpacity style={styles.addButton} activeOpacity={0.85}>
            <MaterialCommunityIcons name="plus" size={18} color={COLORS.white} />
            <Text style={styles.addButtonText}>Add Inventory</Text>
          </TouchableOpacity>

          <View style={styles.tableCard}>
            <ScrollView horizontal showsHorizontalScrollIndicator={true}>
              <View>
                <View style={styles.tableHeaderRow}>
                  <Text style={[styles.tableHeaderCell, styles.warehouseColumn]}>Warehouse</Text>
                  <Text style={[styles.tableHeaderCell, styles.itemColumn]}>Item Name</Text>
                </View>

                {pageRows.map((row) => (
                  <View key={row.id} style={styles.tableBodyRow}>
                    <Text style={[styles.rowWarehouse, styles.warehouseColumn]}>{row.warehouse}</Text>
                    <View style={styles.itemColumn}>
                      <Text style={styles.rowItemName}>{row.itemName}</Text>
                      <Text style={styles.rowItemCode}>{row.itemCode}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>
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
  innerContent: { paddingHorizontal: 20, paddingTop: 28, paddingBottom: 40 },
  screenTitle: { fontSize: 24, lineHeight: 32, fontWeight: '700', color: '#161616' },
  screenSubtitle: { marginTop: 4, fontSize: 15, lineHeight: 22, color: '#6d6d6d' },
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
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    paddingHorizontal: 16,
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
  warehouseColumn: { width: 160 },
  itemColumn: { width: 240 },
  rowWarehouse: { fontSize: 15, lineHeight: 22, color: '#171717' },
  rowItemName: { fontSize: 15, lineHeight: 22, fontWeight: '500', color: '#171717' },
  rowItemCode: { marginTop: 2, fontSize: 13, lineHeight: 18, color: '#6d6d6d' },
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
