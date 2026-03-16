import React, { useMemo, useState } from 'react';
import { Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { BORDER_RADIUS, COLORS, SPACING } from '../constants/theme';

const PAGE_SIZE = 10;

const PRODUCT_ROWS = [
  { id: 'PROD0018', name: 'Product 18', imageType: 'icon',  category: 'Sports',       price: '₹473.00', status: 'Active'   },
  { id: 'PROD0019', name: 'Product 19', imageType: 'empty', category: 'Books',        price: '₹959.00', status: 'Active'   },
  { id: 'PROD0020', name: 'Product 20', imageType: 'photo', category: 'Home & Garden',price: '₹901.00', status: 'Active'   },
  { id: 'PROD0017', name: 'Product 17', imageType: 'empty', category: 'Toys',         price: '₹705.00', status: 'Active'   },
  { id: 'PROD0016', name: 'Product 16', imageType: 'empty', category: 'Electronics',  price: '₹287.00', status: 'Active'   },
  { id: 'PROD0015', name: 'Product 15', imageType: 'empty', category: 'Home & Garden',price: '₹262.00', status: 'Active'   },
  { id: 'PROD0014', name: 'Product 14', imageType: 'empty', category: 'Automotive',   price: '₹871.00', status: 'Active'   },
  { id: 'PROD0013', name: 'Product 13', imageType: 'empty', category: 'Toys',         price: '₹223.00', status: 'Active'   },
  { id: 'PROD0012', name: 'Product 12', imageType: 'empty', category: 'Books',        price: '₹450.00', status: 'Active'   },
  { id: 'PROD0011', name: 'Product 11', imageType: 'empty', category: 'Electronics',  price: '₹670.00', status: 'Active'   },
  { id: 'PROD0010', name: 'Product 10', imageType: 'empty', category: 'Sports',       price: '₹380.00', status: 'Inactive' },
  { id: 'PROD0009', name: 'Product 9',  imageType: 'empty', category: 'Toys',         price: '₹520.00', status: 'Active'   },
  { id: 'PROD0008', name: 'Product 8',  imageType: 'empty', category: 'Beauty',       price: '₹195.00', status: 'Active'   },
  { id: 'PROD0007', name: 'Product 7',  imageType: 'empty', category: 'Automotive',   price: '₹840.00', status: 'Active'   },
  { id: 'PROD0006', name: 'Product 6',  imageType: 'empty', category: 'Home & Garden',price: '₹310.00', status: 'Active'   },
  { id: 'PROD0005', name: 'Product 5',  imageType: 'empty', category: 'Electronics',  price: '₹990.00', status: 'Inactive' },
  { id: 'PROD0004', name: 'Product 4',  imageType: 'empty', category: 'Books',        price: '₹175.00', status: 'Active'   },
  { id: 'PROD0003', name: 'Product 3',  imageType: 'empty', category: 'Toys',         price: '₹655.00', status: 'Active'   },
  { id: 'PROD0002', name: 'Product 2',  imageType: 'empty', category: 'Sports',       price: '₹430.00', status: 'Active'   },
  { id: 'PROD0001', name: 'Product 1',  imageType: 'empty', category: 'Beauty',       price: '₹280.00', status: 'Active'   },
];

function Thumb({ imageType }) {
  if (imageType === 'photo') {
    return (
      <View style={styles.thumbBox}>
        <Image source={{ uri: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=120&q=80' }} style={styles.thumbImg} />
      </View>
    );
  }
  if (imageType === 'icon') {
    return <View style={styles.thumbBox}><MaterialCommunityIcons name="truck-fast-outline" size={26} color="#90a4c6" /></View>;
  }
  return <View style={styles.thumbBox}><Text style={styles.thumbDash}>—</Text></View>;
}

function ActiveBadge({ status }) {
  const active = status === 'Active';
  return (
    <View style={[styles.badge, active ? styles.badgeActive : styles.badgeInactive]}>
      <Text style={[styles.badgeText, active ? styles.badgeTextActive : styles.badgeTextInactive]}>{status}</Text>
    </View>
  );
}

export default function ProductsScreen() {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(PRODUCT_ROWS.length / PAGE_SIZE);
  const pageStart  = (currentPage - 1) * PAGE_SIZE;
  const pageRows   = useMemo(() => PRODUCT_ROWS.slice(pageStart, pageStart + PAGE_SIZE), [pageStart]);
  const showingStart = pageRows.length ? pageStart + 1 : 0;
  const showingEnd   = Math.min(pageStart + PAGE_SIZE, PRODUCT_ROWS.length);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <MaterialCommunityIcons name="package-variant" size={20} color={COLORS.textPrimary} style={styles.headerIcon} />
          <Text style={styles.headerTitle}>Product Management</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.innerContent}>
          <View style={styles.titleRow}>
            <View>
              <Text style={styles.screenTitle}>Products</Text>
              <Text style={styles.screenSubtitle}>Manage products, their details, and inventory.</Text>
            </View>
            <TouchableOpacity style={styles.addButton} activeOpacity={0.85}>
              <MaterialCommunityIcons name="plus" size={17} color={COLORS.white} />
              <Text style={styles.addButtonText}>Add Product</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.cardList}>
            {pageRows.map((product) => (
              <View key={product.id} style={styles.productCard}>
                <Thumb imageType={product.imageType} />
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{product.name}</Text>
                  <Text style={styles.productSku}>{product.id}</Text>
                  <View style={styles.productMeta}>
                    <Text style={styles.productCategory}>{product.category}</Text>
                    <Text style={styles.metaDot}>  ·  </Text>
                    <Text style={styles.productPrice}>{product.price}</Text>
                  </View>
                </View>
                <View style={styles.productRight}>
                  <ActiveBadge status={product.status} />
                  <View style={styles.actionRow}>
                    <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
                      <MaterialCommunityIcons name="pencil-outline" size={16} color="#555" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
                      <MaterialCommunityIcons name="trash-can-outline" size={16} color="#e53935" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>

          <Text style={styles.paginationSummary}>Showing {showingStart} to {showingEnd} of {PRODUCT_ROWS.length} products</Text>
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
  productCard: { backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.lg, borderWidth: 1, borderColor: COLORS.gray200, padding: 12, flexDirection: 'row', alignItems: 'center' },
  thumbBox: { width: 52, height: 52, borderRadius: 8, borderWidth: 1, borderColor: '#dfdfdf', backgroundColor: '#f6f6f6', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginRight: 12 },
  thumbImg: { width: '100%', height: '100%' },
  thumbDash: { fontSize: 20, color: '#aaa' },
  productInfo: { flex: 1 },
  productName: { fontSize: 15, fontWeight: '600', color: '#171717' },
  productSku: { fontSize: 12, color: '#8a8a8a', marginTop: 2 },
  productMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  productCategory: { fontSize: 12, color: '#6d6d6d' },
  metaDot: { fontSize: 12, color: '#ccc' },
  productPrice: { fontSize: 13, fontWeight: '600', color: '#222' },
  productRight: { alignItems: 'flex-end', marginLeft: 8 },
  badge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 8 },
  badgeActive: { backgroundColor: '#2453e6' },
  badgeInactive: { backgroundColor: '#fce4ec' },
  badgeText: { fontSize: 12, fontWeight: '600' },
  badgeTextActive: { color: COLORS.white },
  badgeTextInactive: { color: '#c62828' },
  actionRow: { flexDirection: 'row', gap: 6 },
  iconBtn: { width: 30, height: 30, borderRadius: 7, borderWidth: 1, borderColor: '#dfdfdf', backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center' },
  paginationSummary: { marginTop: 24, fontSize: 14, color: '#6d6d6d' },
  paginationRow: { marginTop: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  paginationButton: { minWidth: 80, height: 32, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1, borderColor: '#dfdfdf', backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center' },
  paginationButtonDisabled: { backgroundColor: '#fbfbfb' },
  paginationButtonText: { fontSize: 14, fontWeight: '600', color: '#111111' },
  paginationButtonTextDisabled: { color: '#a6a6a6' },
  pageIndicator: { minWidth: 120, height: 36, borderRadius: 8, borderWidth: 1, borderColor: '#dfdfdf', backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center' },
  pageIndicatorText: { fontSize: 14, fontWeight: '600', color: '#151515' },
});