import React, { useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { BORDER_RADIUS, COLORS, SPACING } from '../constants/theme';

const PAGE_SIZE = 10;

const CUSTOMER_ROWS = [
  { id: '1',  name: 'Customer 1',  phone: '9871234561', address: 'Bihar',       status: 'Active'   },
  { id: '2',  name: 'Customer 2',  phone: '9871234562', address: 'Delhi',       status: 'Active'   },
  { id: '3',  name: 'Customer 3',  phone: '9871234563', address: 'Mumbai',      status: 'Inactive' },
  { id: '4',  name: 'Customer 4',  phone: '9871234564', address: 'Kolkata',     status: 'Active'   },
  { id: '5',  name: 'Customer 5',  phone: '9871234565', address: 'Chennai',     status: 'Active'   },
  { id: '6',  name: 'Customer 6',  phone: '9871234566', address: 'Hyderabad',   status: 'Inactive' },
  { id: '7',  name: 'Customer 7',  phone: '9871234567', address: 'Pune',        status: 'Active'   },
  { id: '8',  name: 'Customer 8',  phone: '9871234568', address: 'Ahmedabad',   status: 'Active'   },
  { id: '9',  name: 'Customer 9',  phone: '9871234569', address: 'Jaipur',      status: 'Active'   },
  { id: '10', name: 'Customer 10', phone: '9871234570', address: 'Surat',       status: 'Inactive' },
  { id: '11', name: 'Customer 11', phone: '9871234571', address: 'Lucknow',     status: 'Active'   },
  { id: '12', name: 'Customer 12', phone: '9871234572', address: 'Kanpur',      status: 'Active'   },
  { id: '13', name: 'Customer 13', phone: '9871234573', address: 'Nagpur',      status: 'Active'   },
  { id: '14', name: 'Customer 14', phone: '9871234574', address: 'Indore',      status: 'Active'   },
  { id: '15', name: 'Customer 15', phone: '9871234575', address: 'Thane',       status: 'Inactive' },
  { id: '16', name: 'Customer 16', phone: '9871234576', address: 'Bhopal',      status: 'Active'   },
  { id: '17', name: 'Customer 17', phone: '9871234577', address: 'Visakhapatnam', status: 'Active' },
  { id: '18', name: 'Customer 18', phone: '9871234578', address: 'Pimpri',      status: 'Active'   },
  { id: '19', name: 'Customer 19', phone: '9871234579', address: 'Patna',       status: 'Inactive' },
  { id: '20', name: 'Customer 20', phone: '9871234580', address: 'Vadodara',    status: 'Active'   },
];

function ActiveBadge({ status }) {
  const active = status === 'Active';
  return (
    <View style={[styles.badge, active ? styles.badgeActive : styles.badgeInactive]}>
      <Text style={[styles.badgeText, active ? styles.badgeTextActive : styles.badgeTextInactive]}>{status}</Text>
    </View>
  );
}

export default function CustomersScreen({ navigation }) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(CUSTOMER_ROWS.length / PAGE_SIZE);
  const pageStart  = (currentPage - 1) * PAGE_SIZE;
  const pageRows   = useMemo(() => CUSTOMER_ROWS.slice(pageStart, pageStart + PAGE_SIZE), [pageStart]);
  const showingStart = pageRows.length ? pageStart + 1 : 0;
  const showingEnd   = Math.min(pageStart + PAGE_SIZE, CUSTOMER_ROWS.length);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <MaterialCommunityIcons name="account-multiple-outline" size={20} color={COLORS.textPrimary} style={styles.headerIcon} />
          <Text style={styles.headerTitle}>Customer Management</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.innerContent}>
          <View style={styles.titleRow}>
            <View>
              <Text style={styles.screenTitle}>Customers</Text>
              <Text style={styles.screenSubtitle}>Manage your customer database.</Text>
            </View>
            <TouchableOpacity style={styles.addButton} activeOpacity={0.85}>
              <MaterialCommunityIcons name="plus" size={17} color={COLORS.white} />
              <Text style={styles.addButtonText}>Add Customer</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.cardList}>
            {pageRows.map((customer) => (
              <View key={customer.id} style={styles.customerCard}>
                <View style={styles.avatar}>
                  <MaterialCommunityIcons name="account" size={20} color="#9e9e9e" />
                </View>
                <View style={styles.customerInfo}>
                  <Text style={styles.customerName}>{customer.name}</Text>
                  <View style={styles.metaRow}>
                    <MaterialCommunityIcons name="phone-outline" size={13} color="#888" />
                    <Text style={styles.metaText}>{customer.phone}</Text>
                  </View>
                  <View style={styles.metaRow}>
                    <MaterialCommunityIcons name="map-marker-outline" size={13} color="#888" />
                    <Text style={styles.metaText}>{customer.address}</Text>
                  </View>
                </View>
                <View style={styles.customerRight}>
                  <ActiveBadge status={customer.status} />
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

          <Text style={styles.paginationSummary}>Showing {showingStart} to {showingEnd} of {CUSTOMER_ROWS.length} customers</Text>
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
  customerCard: { backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.lg, borderWidth: 1, borderColor: COLORS.gray200, padding: 12, flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#e8e8e8', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  customerInfo: { flex: 1 },
  customerName: { fontSize: 15, fontWeight: '600', color: '#171717', marginBottom: 3 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  metaText: { fontSize: 12, color: '#6d6d6d' },
  customerRight: { alignItems: 'flex-end', marginLeft: 8 },
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