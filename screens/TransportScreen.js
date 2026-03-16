import React, { useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { BORDER_RADIUS, COLORS, SPACING } from '../constants/theme';

const PAGE_SIZE = 10;

const TRANSPORT_ROWS = [
  { id: '1', name: 'Vrl', phone: '8076177654', gstNo: '12345', address: 'P-34 Bihari Colony Shahdara P-34', location: '22.1542, 77.7807', status: 'Active' },
  { id: '2', name: 'Two Wheeler', phone: '1234567800', gstNo: '1234567890', address: 'Delhi', location: '28.4795, 77.3126', status: 'Active' },
];

function StatusBadge({ status }) {
  const active = status === 'Active';
  return (
    <View style={[styles.badge, active ? styles.badgeActive : styles.badgeInactive]}>
      <Text style={[styles.badgeText, active ? styles.badgeTextActive : styles.badgeTextInactive]}>{status}</Text>
    </View>
  );
}

export default function TransportScreen() {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(TRANSPORT_ROWS.length / PAGE_SIZE));
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const pageRows = useMemo(() => TRANSPORT_ROWS.slice(pageStart, pageStart + PAGE_SIZE), [pageStart]);
  const showingStart = pageRows.length ? pageStart + 1 : 0;
  const showingEnd = Math.min(pageStart + PAGE_SIZE, TRANSPORT_ROWS.length);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <MaterialCommunityIcons name="truck-outline" size={20} color={COLORS.textPrimary} style={styles.headerIcon} />
          <Text style={styles.headerTitle}>Transport Management</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.innerContent}>
          <View style={styles.titleRow}>
            <View style={styles.titleGroup}>
              <Text style={styles.screenTitle}>Transport</Text>
              <Text style={styles.screenSubtitle}>Manage transport providers with contact and location details.</Text>
            </View>
            <TouchableOpacity style={styles.addButton} activeOpacity={0.85}>
              <MaterialCommunityIcons name="plus" size={17} color={COLORS.white} />
              <Text style={styles.addButtonText}>Add Transport</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.cardList}>
            {pageRows.map((row) => (
              <View key={row.id} style={styles.card}>
                <View style={styles.cardTopRow}>
                  <View style={styles.nameWrap}>
                    <View style={styles.iconCircle}>
                      <MaterialCommunityIcons name="truck-outline" size={18} color="#7a7a7a" />
                    </View>
                    <Text style={styles.nameText}>{row.name}</Text>
                  </View>
                  <StatusBadge status={row.status} />
                </View>

                <View style={styles.metaStack}>
                  <View style={styles.metaRow}>
                    <MaterialCommunityIcons name="phone-outline" size={14} color="#888" />
                    <Text style={styles.metaText}>{row.phone}</Text>
                    <Text style={styles.metaDivider}>GST</Text>
                    <Text style={styles.metaText}>{row.gstNo}</Text>
                  </View>
                  <View style={styles.metaRow}>
                    <MaterialCommunityIcons name="map-marker-outline" size={14} color="#888" />
                    <Text style={styles.metaText} numberOfLines={2}>{row.address}</Text>
                  </View>
                  <View style={styles.metaRow}>
                    <MaterialCommunityIcons name="crosshairs-gps" size={14} color="#888" />
                    <Text style={styles.metaText}>{row.location}</Text>
                  </View>
                </View>

                <View style={styles.actionRow}>
                  <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
                    <MaterialCommunityIcons name="pencil-outline" size={16} color="#555" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
                    <MaterialCommunityIcons name="trash-can-outline" size={16} color="#ff3b30" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>

          <Text style={styles.paginationSummary}>Showing {showingStart} to {showingEnd} of {TRANSPORT_ROWS.length} transports</Text>
          <View style={styles.paginationRow}>
            <TouchableOpacity style={[styles.paginationButton, currentPage === 1 && styles.paginationButtonDisabled]} onPress={() => setCurrentPage((page) => Math.max(1, page - 1))} disabled={currentPage === 1} activeOpacity={0.85}>
              <Text style={[styles.paginationButtonText, currentPage === 1 && styles.paginationButtonTextDisabled]}>Previous</Text>
            </TouchableOpacity>
            <View style={styles.pageIndicator}>
              <Text style={styles.pageIndicatorText}>Page {currentPage} of {totalPages}</Text>
            </View>
            <TouchableOpacity style={[styles.paginationButton, currentPage === totalPages && styles.paginationButtonDisabled]} onPress={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} disabled={currentPage === totalPages} activeOpacity={0.85}>
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
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 16 },
  titleGroup: { flex: 1 },
  screenTitle: { fontSize: 22, fontWeight: '700', color: '#161616' },
  screenSubtitle: { marginTop: 3, fontSize: 13, color: '#6d6d6d' },
  addButton: { height: 36, borderRadius: 10, backgroundColor: '#2453e6', paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 5 },
  addButtonText: { fontSize: 13, fontWeight: '600', color: COLORS.white },
  cardList: { gap: 10 },
  card: { backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.lg, borderWidth: 1, borderColor: COLORS.gray200, padding: 12 },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 },
  nameWrap: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconCircle: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#f1f1f1', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  nameText: { fontSize: 16, fontWeight: '600', color: '#171717', flexShrink: 1 },
  metaStack: { marginTop: 10, gap: 8 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { fontSize: 12, color: '#6d6d6d', flex: 1 },
  metaDivider: { fontSize: 11, fontWeight: '700', color: '#444', backgroundColor: '#f0f0f0', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 999 },
  badge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  badgeActive: { backgroundColor: '#2453e6' },
  badgeInactive: { backgroundColor: '#fce4ec' },
  badgeText: { fontSize: 12, fontWeight: '600' },
  badgeTextActive: { color: COLORS.white },
  badgeTextInactive: { color: '#c62828' },
  actionRow: { marginTop: 12, flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
  iconBtn: { width: 30, height: 30, borderRadius: 8, borderWidth: 1, borderColor: '#dfdfdf', backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center' },
  paginationSummary: { marginTop: 24, fontSize: 14, color: '#6d6d6d' },
  paginationRow: { marginTop: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  paginationButton: { minWidth: 80, height: 32, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1, borderColor: '#dfdfdf', backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center' },
  paginationButtonDisabled: { backgroundColor: '#fbfbfb' },
  paginationButtonText: { fontSize: 14, fontWeight: '600', color: '#111111' },
  paginationButtonTextDisabled: { color: '#a6a6a6' },
  pageIndicator: { minWidth: 120, height: 36, borderRadius: 8, borderWidth: 1, borderColor: '#dfdfdf', backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center' },
  pageIndicatorText: { fontSize: 14, fontWeight: '600', color: '#151515' },
});
