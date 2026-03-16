import React, { useMemo, useState } from 'react';
import { Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { BORDER_RADIUS, COLORS, SPACING } from '../constants/theme';

const PAGE_SIZE = 10;

const PRODUCT_ROWS = [
  { id: 'PROD0018', name: 'Product 18', imageType: 'icon' },
  { id: 'PROD0019', name: 'Product 19', imageType: 'empty' },
  { id: 'PROD0020', name: 'Product 20', imageType: 'photo' },
  { id: 'PROD0017', name: 'Product 17', imageType: 'empty' },
  { id: 'PROD0016', name: 'Product 16', imageType: 'empty' },
  { id: 'PROD0015', name: 'Product 15', imageType: 'empty' },
  { id: 'PROD0014', name: 'Product 14', imageType: 'empty' },
  { id: 'PROD0013', name: 'Product 13', imageType: 'empty' },
  { id: 'PROD0012', name: 'Product 12', imageType: 'empty' },
  { id: 'PROD0011', name: 'Product 11', imageType: 'empty' },
  { id: 'PROD0010', name: 'Product 10', imageType: 'empty' },
  { id: 'PROD0009', name: 'Product 9', imageType: 'empty' },
  { id: 'PROD0008', name: 'Product 8', imageType: 'empty' },
  { id: 'PROD0007', name: 'Product 7', imageType: 'empty' },
  { id: 'PROD0006', name: 'Product 6', imageType: 'empty' },
  { id: 'PROD0005', name: 'Product 5', imageType: 'empty' },
  { id: 'PROD0004', name: 'Product 4', imageType: 'empty' },
  { id: 'PROD0003', name: 'Product 3', imageType: 'empty' },
  { id: 'PROD0002', name: 'Product 2', imageType: 'empty' },
  { id: 'PROD0001', name: 'Product 1', imageType: 'empty' },
];

function ProductImage({ imageType }) {
  if (imageType === 'photo') {
    return (
      <View style={[styles.thumbBase, styles.photoThumb]}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=120&q=80' }}
          style={styles.thumbImage}
        />
      </View>
    );
  }

  if (imageType === 'icon') {
    return (
      <View style={styles.thumbBase}>
        <MaterialCommunityIcons name="truck-fast-outline" size={28} color="#90a4c6" />
      </View>
    );
  }

  return (
    <View style={styles.thumbBase}>
      <Text style={styles.thumbPlaceholder}>-</Text>
    </View>
  );
}

export default function ProductsScreen() {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(PRODUCT_ROWS.length / PAGE_SIZE);
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const pageRows = useMemo(
    () => PRODUCT_ROWS.slice(pageStart, pageStart + PAGE_SIZE),
    [pageStart]
  );

  const showingStart = pageRows.length ? pageStart + 1 : 0;
  const showingEnd = Math.min(pageStart + PAGE_SIZE, PRODUCT_ROWS.length);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <MaterialCommunityIcons
            name="package-variant"
            size={20}
            color={COLORS.textPrimary}
            style={styles.headerIcon}
          />
          <Text style={styles.headerTitle}>Product Management</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.innerContent}>
          <Text style={styles.screenTitle}>Products</Text>
          <Text style={styles.screenSubtitle}>Manage products, their details, and inventory.</Text>

          <TouchableOpacity style={styles.addButton} activeOpacity={0.85}>
            <MaterialCommunityIcons name="plus" size={18} color={COLORS.white} />
            <Text style={styles.addButtonText}>Add Product</Text>
          </TouchableOpacity>

          <View style={styles.tableCard}>
            <ScrollView horizontal showsHorizontalScrollIndicator={true}>
              <View>
                <View style={styles.tableHeaderRow}>
                  <Text style={[styles.tableHeaderCell, styles.imageColumn]}>Image</Text>
                  <Text style={[styles.tableHeaderCell, styles.nameColumn]}>Name</Text>
                </View>

                {pageRows.map((product) => (
                  <View key={product.id} style={styles.tableBodyRow}>
                    <View style={styles.imageColumn}>
                      <ProductImage imageType={product.imageType} />
                    </View>
                    <View style={styles.nameColumn}>
                      <Text style={styles.productName}>{product.name}</Text>
                      <Text style={styles.productId}>{product.id}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>

          <Text style={styles.paginationSummary}>
            Showing {showingStart} to {showingEnd} of {PRODUCT_ROWS.length} products
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
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 480,
    height: 52,
    paddingHorizontal: 12,
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
    minWidth: 480,
    minHeight: 74,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
    backgroundColor: COLORS.white,
  },
  imageColumn: {
    width: 70,
  },
  nameColumn: {
    width: 350,
  },
  thumbBase: {
    width: 52,
    height: 52,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#dfdfdf',
    backgroundColor: '#f6f6f6',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  photoThumb: {
    backgroundColor: '#ececec',
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  thumbPlaceholder: {
    fontSize: 26,
    lineHeight: 28,
    color: '#7f7f7f',
  },
  productName: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
    color: '#171717',
  },
  productId: {
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