import React, { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { getOrders } from '../api/api-methods';
import { BORDER_RADIUS, COLORS, SPACING } from '../constants/theme';

const PAGE_SIZE = 10;

const STATUS_STYLES = {
  Dispatched: { bg: '#e3f2fd', text: '#1565c0' },
  Processing:  { bg: '#fff3e0', text: '#e65100' },
  Delivered:   { bg: '#e8f5e9', text: '#2e7d32' },
  Cancelled:   { bg: '#fce4ec', text: '#c62828' },
  'On Hold':   { bg: '#f3e5f5', text: '#6a1b9a' },
};

function formatDate(iso) {
  if (!iso) return 'N/A';
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
}

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || { bg: '#f5f5f5', text: '#555' };
  return (
    <View style={[styles.statusBadge, { backgroundColor: s.bg }]}>
      <Text style={[styles.statusBadgeText, { color: s.text }]}>{status || 'N/A'}</Text>
    </View>
  );
}

function OrderCard({ order }) {
  const itemCount = order.items?.length ?? order.itemCount ?? 0;
  const transport = order.transport_id?.name || 'N/A';
  const customer  = order.customer_id?.name || 'N/A';
  const created   = formatDate(order.createdAt);
  return (
    <View style={styles.orderCard}>
      <View style={styles.cardRow1}>
        <Text style={styles.orderNumber}>{order.orderNumber}</Text>
        <StatusBadge status={order.status} />
      </View>
      <View style={styles.cardMetaRow}>
        <MaterialCommunityIcons name="account-outline" size={13} color="#888" />
        <Text style={styles.cardMeta} numberOfLines={1}> {customer}</Text>
        <Text style={styles.dot}>  ·  </Text>
        <MaterialCommunityIcons name="calendar-outline" size={13} color="#888" />
        <Text style={styles.cardMeta}> {created}</Text>
      </View>
      <View style={styles.cardMetaRow}>
        <MaterialCommunityIcons name="truck-outline" size={13} color="#888" />
        <Text style={styles.cardMeta}> {transport}</Text>
        <Text style={styles.dot}>  ·  </Text>
        <MaterialCommunityIcons name="package-variant" size={13} color="#888" />
        <Text style={styles.cardMeta}> {itemCount} {itemCount === 1 ? 'item' : 'items'}</Text>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
          <MaterialCommunityIcons name="pencil-outline" size={17} color="#555" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
          <MaterialCommunityIcons name="trash-can-outline" size={17} color="#e53935" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.statusDropBtn} activeOpacity={0.85}>
          <Text style={styles.statusDropText}>{order.status || 'Set Status'}</Text>
          <MaterialCommunityIcons name="chevron-down" size={15} color="#333" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function OrdersScreen() {
  const [orders, setOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = async (page) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getOrders(page, PAGE_SIZE);
      setOrders(response.data || []);
      setTotalPages(response.pagination?.totalPages || 1);
      setTotalItems(response.pagination?.totalItems || 0);
    } catch (err) {
      setError('Failed to fetch orders');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(currentPage);
  }, [currentPage]);

  const showingStart = orders.length ? (currentPage - 1) * PAGE_SIZE + 1 : 0;
  const showingEnd = Math.min(currentPage * PAGE_SIZE, totalItems);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <MaterialCommunityIcons name="package-variant-closed" size={20} color={COLORS.textPrimary} style={styles.headerIcon} />
          <Text style={styles.headerTitle}>Order Management</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.innerContent}>
          <View style={styles.titleToolbar}>
            <View style={styles.titleBlock}>
              <Text style={styles.screenTitle}>Orders</Text>
              <Text style={styles.screenSubtitle}>Manage orders, track shipments, and handle customer requests.</Text>
            </View>
          </View>

          <View style={styles.toolbar}>
            <TouchableOpacity style={styles.filterButton} activeOpacity={0.85}>
              <Text style={styles.filterButtonText}>All Orders</Text>
              <MaterialCommunityIcons name="chevron-down" size={16} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.createButton} activeOpacity={0.85}>
              <MaterialCommunityIcons name="plus" size={17} color={COLORS.white} />
              <Text style={styles.createButtonText}>Create Order</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.stateBox}>
              <ActivityIndicator size="large" color="#2453e6" />
              <Text style={styles.stateText}>Loading orders...</Text>
            </View>
          ) : error ? (
            <View style={styles.stateBox}>
              <MaterialCommunityIcons name="alert-circle-outline" size={40} color="#e53935" />
              <Text style={styles.stateText}>{error}</Text>
              <TouchableOpacity style={styles.retryBtn} onPress={() => fetchOrders(currentPage)}>
                <Text style={styles.retryBtnText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : orders.length === 0 ? (
            <View style={styles.stateBox}>
              <MaterialCommunityIcons name="package-variant" size={40} color="#9e9e9e" />
              <Text style={styles.stateText}>No orders found</Text>
            </View>
          ) : (
            <View style={styles.cardList}>
              {orders.map((order) => (
                <OrderCard key={order._id} order={order} />
              ))}
            </View>
          )}

          <Text style={styles.paginationSummary}>
            Showing {showingStart} to {showingEnd} of {totalItems} orders
          </Text>
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
  titleToolbar: { marginBottom: 4 },
  titleBlock: {},
  screenTitle: { fontSize: 22, fontWeight: '700', color: '#161616' },
  screenSubtitle: { marginTop: 3, fontSize: 13, lineHeight: 19, color: '#6d6d6d' },
  toolbar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, marginBottom: 14 },
  filterButton: { height: 36, borderRadius: 10, borderWidth: 1, borderColor: '#dfdfdf', backgroundColor: COLORS.white, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 6 },
  filterButtonText: { fontSize: 13, fontWeight: '500', color: '#151515' },
  createButton: { height: 36, borderRadius: 10, backgroundColor: '#2453e6', paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 5 },
  createButtonText: { fontSize: 13, fontWeight: '600', color: COLORS.white },
  cardList: { gap: 10 },
  orderCard: { backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.lg, borderWidth: 1, borderColor: COLORS.gray200, padding: 14 },
  cardRow1: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  orderNumber: { fontSize: 16, fontWeight: '700', color: '#151515' },
  statusBadge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  statusBadgeText: { fontSize: 12, fontWeight: '600' },
  cardMetaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  cardMeta: { fontSize: 13, color: '#555' },
  dot: { fontSize: 13, color: '#ccc' },
  cardActions: { flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 8 },
  iconBtn: { width: 34, height: 34, borderRadius: 8, borderWidth: 1, borderColor: '#dfdfdf', backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center' },
  statusDropBtn: { flex: 1, height: 34, borderRadius: 8, borderWidth: 1, borderColor: '#dfdfdf', backgroundColor: COLORS.white, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 10 },
  statusDropText: { fontSize: 13, fontWeight: '500', color: '#222' },
  stateBox: { padding: 40, alignItems: 'center', justifyContent: 'center' },
  stateText: { marginTop: 12, fontSize: 14, color: '#6d6d6d', textAlign: 'center' },
  retryBtn: { marginTop: 12, paddingHorizontal: 20, paddingVertical: 8, borderRadius: 8, backgroundColor: '#2453e6' },
  retryBtnText: { fontSize: 14, fontWeight: '600', color: COLORS.white },
  paginationSummary: { marginTop: 24, fontSize: 14, color: '#6d6d6d' },
  paginationRow: { marginTop: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  paginationButton: { minWidth: 80, height: 32, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1, borderColor: '#dfdfdf', backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center' },
  paginationButtonDisabled: { backgroundColor: '#fbfbfb' },
  paginationButtonText: { fontSize: 14, fontWeight: '600', color: '#111111' },
  paginationButtonTextDisabled: { color: '#a6a6a6' },
  pageIndicator: { minWidth: 120, height: 36, borderRadius: 8, borderWidth: 1, borderColor: '#dfdfdf', backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center' },
  pageIndicatorText: { fontSize: 14, fontWeight: '600', color: '#151515' },
});
