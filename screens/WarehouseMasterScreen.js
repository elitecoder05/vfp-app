import React, { useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { BORDER_RADIUS, COLORS, SPACING } from '../constants/theme';

const PAGE_SIZE = 10;

const WAREHOUSE_ROWS = [
  { id: '1',  name: 'Warehouse 20', location: 'Phoenix - Location 20'     },
  { id: '2',  name: 'Warehouse 18', location: 'Phoenix - Location 18'     },
  { id: '3',  name: 'Warehouse 19', location: 'San Diego - Location 19'   },
  { id: '4',  name: 'Warehouse 17', location: 'San Diego - Location 17'   },
  { id: '5',  name: 'Warehouse 16', location: 'Los Angeles - Location 16' },
  { id: '6',  name: 'Warehouse 15', location: 'San Antonio - Location 15' },
  { id: '7',  name: 'Warehouse 8',  location: 'Chicago - Location 8'      },
  { id: '8',  name: 'Warehouse 13', location: 'San Jose - Location 13'    },
  { id: '9',  name: 'Warehouse 9',  location: 'Chicago - Location 9'      },
  { id: '10', name: 'Warehouse 14', location: 'San Diego - Location 14'   },
  { id: '11', name: 'Warehouse 1',  location: 'Houston - Location 1'      },
  { id: '12', name: 'Warehouse 2',  location: 'Houston - Location 2'      },
  { id: '13', name: 'Warehouse 3',  location: 'Dallas - Location 3'       },
  { id: '14', name: 'Warehouse 4',  location: 'Dallas - Location 4'       },
  { id: '15', name: 'Warehouse 5',  location: 'New York - Location 5'     },
  { id: '16', name: 'Warehouse 6',  location: 'New York - Location 6'     },
  { id: '17', name: 'Warehouse 7',  location: 'Chicago - Location 7'      },
  { id: '18', name: 'Warehouse 10', location: 'Phoenix - Location 10'     },
  { id: '19', name: 'Warehouse 11', location: 'San Antonio - Location 11' },
  { id: '20', name: 'Warehouse 12', location: 'San Jose - Location 12'    },
];

export default function WarehouseMasterScreen() {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(WAREHOUSE_ROWS.length / PAGE_SIZE);
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const pageRows = useMemo(
    () => WAREHOUSE_ROWS.slice(pageStart, pageStart + PAGE_SIZE),
    [pageStart]
  );

  const showingStart = pageRows.length ? pageStart + 1 : 0;
  const showingEnd = Math.min(pageStart + PAGE_SIZE, WAREHOUSE_ROWS.length);

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
          <Text style={styles.headerTitle}>Warehouse Management</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.innerContent}>
          <Text style={styles.screenTitle}>Warehouses</Text>
          <Text style={styles.screenSubtitle}>Manage warehouses and their locations.</Text>

          <TouchableOpacity style={styles.addButton} activeOpacity={0.85}>
            <MaterialCommunityIcons name="plus" size={18} color={COLORS.white} />
            <Text style={styles.addButtonText}>Add Warehouse</Text>
          </TouchableOpacity>

          <View style={styles.tableCard}>
            <ScrollView horizontal showsHorizontalScrollIndicator={true}>
              <View>
                <View style={styles.tableHeaderRow}>
                  <Text style={[styles.tableHeaderCell, styles.nameColumn]}>Name</Text>
                  <Text style={[styles.tableHeaderCell, styles.locationColumn]}>Location</Text>
                </View>

                {pageRows.map((row) => (
                  <View key={row.id} style={styles.tableBodyRow}>
                    <View style={[styles.nameColumn, styles.nameCell]}>
                      <MaterialCommunityIcons
                        name="home-city-outline"
                        size={20}
                        color={COLORS.gray600}
                        style={styles.rowIcon}
                      />
                      <Text style={styles.rowName}>{row.name}</Text>
                    </View>
                    <Text style={[styles.rowLocation, styles.locationColumn]}>{row.location}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>

          <Text style={styles.paginationSummary}>
            Showing {showingStart} to {showingEnd} of {WAREHOUSE_ROWS.length} warehouses
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
    minHeight: 62,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
    backgroundColor: COLORS.white,
  },
  nameColumn: { width: 200 },
  locationColumn: { width: 240 },
  nameCell: { flexDirection: 'row', alignItems: 'center' },
  rowIcon: { marginRight: 10 },
  rowName: { fontSize: 15, lineHeight: 22, fontWeight: '600', color: '#171717' },
  rowLocation: { fontSize: 15, lineHeight: 22, color: '#6d6d6d' },
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
