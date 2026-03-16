import React, { useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { BORDER_RADIUS, COLORS, SPACING } from '../constants/theme';

const PAGE_SIZE = 10;

const RAW_MATERIAL_ROWS = [
  { id: '1',  name: 'Raw Material 1',  unit: 'kg',     category: 'Chemicals',    supplier: 'Supplier A', hasImage: false, status: 'Active'   },
  { id: '2',  name: 'Raw Material 2',  unit: 'liters', category: 'Metals',       supplier: 'Supplier B', hasImage: true,  status: 'Active'   },
  { id: '3',  name: 'Raw Material 3',  unit: 'meters', category: 'Plastics',     supplier: 'Supplier C', hasImage: false, status: 'Active'   },
  { id: '4',  name: 'Raw Material 4',  unit: 'kg',     category: 'Chemicals',    supplier: 'Supplier D', hasImage: true,  status: 'Active'   },
  { id: '5',  name: 'Raw Material 5',  unit: 'pieces', category: 'Textiles',     supplier: 'Supplier E', hasImage: false, status: 'Active'   },
  { id: '6',  name: 'Raw Material 6',  unit: 'kg',     category: 'Metals',       supplier: 'Supplier A', hasImage: true,  status: 'Active'   },
  { id: '7',  name: 'Raw Material 7',  unit: 'liters', category: 'Chemicals',    supplier: 'Supplier B', hasImage: false, status: 'Active'   },
  { id: '8',  name: 'Raw Material 8',  unit: 'meters', category: 'Plastics',     supplier: 'Supplier C', hasImage: false, status: 'Inactive' },
  { id: '9',  name: 'Raw Material 9',  unit: 'kg',     category: 'Textiles',     supplier: 'Supplier D', hasImage: true,  status: 'Active'   },
  { id: '10', name: 'Raw Material 10', unit: 'pieces', category: 'Metals',       supplier: 'Supplier E', hasImage: false, status: 'Active'   },
  { id: '11', name: 'Raw Material 11', unit: 'kg',     category: 'Chemicals',    supplier: 'Supplier A', hasImage: false, status: 'Active'   },
  { id: '12', name: 'Raw Material 12', unit: 'liters', category: 'Plastics',     supplier: 'Supplier B', hasImage: true,  status: 'Active'   },
  { id: '13', name: 'Raw Material 13', unit: 'meters', category: 'Metals',       supplier: 'Supplier C', hasImage: false, status: 'Active'   },
  { id: '14', name: 'Raw Material 14', unit: 'kg',     category: 'Textiles',     supplier: 'Supplier D', hasImage: false, status: 'Inactive' },
  { id: '15', name: 'Raw Material 15', unit: 'pieces', category: 'Chemicals',    supplier: 'Supplier E', hasImage: true,  status: 'Active'   },
  { id: '16', name: 'Raw Material 16', unit: 'kg',     category: 'Plastics',     supplier: 'Supplier A', hasImage: false, status: 'Active'   },
  { id: '17', name: 'Raw Material 17', unit: 'liters', category: 'Metals',       supplier: 'Supplier B', hasImage: false, status: 'Active'   },
  { id: '18', name: 'Raw Material 18', unit: 'meters', category: 'Textiles',     supplier: 'Supplier C', hasImage: true,  status: 'Active'   },
  { id: '19', name: 'Raw Material 19', unit: 'meters', category: 'Home & Garden',supplier: 'Supplier E', hasImage: false, status: 'Inactive' },
  { id: '20', name: 'Raw Material 20', unit: 'kg',     category: 'Chemicals',    supplier: 'Supplier D', hasImage: true,  status: 'Active'   },
];

function ActiveBadge({ status }) {
  const active = status === 'Active';
  return (
    <View style={[styles.badge, active ? styles.badgeActive : styles.badgeInactive]}>
      <Text style={[styles.badgeText, active ? styles.badgeTextActive : styles.badgeTextInactive]}>{status}</Text>
    </View>
  );
}

export default function RawMaterialsScreen({ navigation }) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages  = Math.ceil(RAW_MATERIAL_ROWS.length / PAGE_SIZE);
  const pageStart   = (currentPage - 1) * PAGE_SIZE;
  const pageRows    = useMemo(() => RAW_MATERIAL_ROWS.slice(pageStart, pageStart + PAGE_SIZE), [pageStart]);
  const showingStart = pageRows.length ? pageStart + 1 : 0;
  const showingEnd   = Math.min(pageStart + PAGE_SIZE, RAW_MATERIAL_ROWS.length);

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
            <TouchableOpacity style={styles.addButton} activeOpacity={0.85}>
              <MaterialCommunityIcons name="plus" size={17} color={COLORS.white} />
              <Text style={styles.addButtonText}>Add Material</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.cardList}>
            {pageRows.map((item) => (
              <View key={item.id} style={styles.materialCard}>
                <View style={styles.materialLeft}>
                  <View style={styles.nameRow}>
                    <Text style={styles.materialName}>{item.name}</Text>
                    <View style={styles.unitTag}>
                      <Text style={styles.unitText}>{item.unit}</Text>
                    </View>
                  </View>
                  <View style={styles.metaRow}>
                    <MaterialCommunityIcons name="shape-outline" size={13} color="#888" />
                    <Text style={styles.metaText}>{item.category}</Text>
                    <Text style={styles.metaDot}>  ·  </Text>
                    <MaterialCommunityIcons name="domain" size={13} color="#888" />
                    <Text style={styles.metaText}>{item.supplier}</Text>
                  </View>
                  <View style={styles.imageRow}>
                    {item.hasImage ? (
                      <View style={styles.imgThumb}>
                        <MaterialCommunityIcons name="image-outline" size={15} color="#90a4c6" />
                      </View>
                    ) : (
                      <Text style={styles.noImages}>No images</Text>
                    )}
                  </View>
                </View>
                <View style={styles.materialRight}>
                  <ActiveBadge status={item.status} />
                  <View style={styles.actionRow}>
                    <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
                      <MaterialCommunityIcons name="pencil-outline" size={15} color="#555" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
                      <MaterialCommunityIcons name="trash-can-outline" size={15} color="#e53935" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>

          <Text style={styles.paginationSummary}>Showing {showingStart} to {showingEnd} of {RAW_MATERIAL_ROWS.length} materials</Text>
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
  cardList: { gap: 10 },
  materialCard: { backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.lg, borderWidth: 1, borderColor: COLORS.gray200, padding: 12, flexDirection: 'row', alignItems: 'flex-start' },
  materialLeft: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  materialName: { fontSize: 15, fontWeight: '600', color: '#171717' },
  unitTag: { borderRadius: 999, backgroundColor: '#f0f0f0', paddingHorizontal: 8, paddingVertical: 2 },
  unitText: { fontSize: 11, color: '#555', fontWeight: '500' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  metaText: { fontSize: 12, color: '#6d6d6d' },
  metaDot: { fontSize: 12, color: '#ccc' },
  imageRow: { marginTop: 6 },
  imgThumb: { width: 32, height: 32, borderRadius: 6, borderWidth: 1, borderColor: '#dfdfdf', backgroundColor: '#f6f6f6', alignItems: 'center', justifyContent: 'center' },
  noImages: { fontSize: 12, color: '#aaa', fontStyle: 'italic' },
  materialRight: { alignItems: 'flex-end', marginLeft: 10 },
  badge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 8 },
  badgeActive: { backgroundColor: '#2453e6' },
  badgeInactive: { backgroundColor: '#fce4ec' },
  badgeText: { fontSize: 12, fontWeight: '600' },
  badgeTextActive: { color: COLORS.white },
  badgeTextInactive: { color: '#c62828' },
  actionRow: { flexDirection: 'row', gap: 6 },
  iconBtn: { width: 28, height: 28, borderRadius: 7, borderWidth: 1, borderColor: '#dfdfdf', backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center' },
  paginationSummary: { marginTop: 24, fontSize: 14, color: '#6d6d6d' },
  paginationRow: { marginTop: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  paginationButton: { minWidth: 80, height: 32, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1, borderColor: '#dfdfdf', backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center' },
  paginationButtonDisabled: { backgroundColor: '#fbfbfb' },
  paginationButtonText: { fontSize: 14, fontWeight: '600', color: '#111111' },
  paginationButtonTextDisabled: { color: '#a6a6a6' },
  pageIndicator: { minWidth: 120, height: 36, borderRadius: 8, borderWidth: 1, borderColor: '#dfdfdf', backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center' },
  pageIndicatorText: { fontSize: 14, fontWeight: '600', color: '#151515' },
});
