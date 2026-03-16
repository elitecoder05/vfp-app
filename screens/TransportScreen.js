import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, RefreshControl, SafeAreaView, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { createTransport, deleteTransport, getTransports, updateTransport } from '../api/api-methods';
import { BORDER_RADIUS, COLORS, SPACING } from '../constants/theme';

const PAGE_SIZE = 10;

const EMPTY_FORM = {
  name: '',
  phone: '',
  latitude: '20.5937',
  longitude: '78.9629',
  address: '',
  gstNo: '',
  active: true,
};

const reverseGeocode = async (lat, lon) => {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=jsonv2`;
    const response = await fetch(url, { headers: { 'User-Agent': 'vfp-app', Accept: 'application/json' } });
    const data = await response.json();
    return data?.display_name || '';
  } catch {
    return '';
  }
};

function TransportMap({ latitude, longitude, onMapTap }) {
  const lat = Number.isFinite(Number(latitude)) ? Number(latitude) : 20.5937;
  const lon = Number.isFinite(Number(longitude)) ? Number(longitude) : 78.9629;

  return (
    <MapView
      style={{ flex: 1 }}
      initialRegion={{ latitude: lat, longitude: lon, latitudeDelta: 10, longitudeDelta: 10 }}
      onPress={(e) => {
        const { latitude: tapLat, longitude: tapLon } = e.nativeEvent.coordinate;
        onMapTap(tapLat, tapLon);
      }}
    >
      <Marker coordinate={{ latitude: lat, longitude: lon }} pinColor="red" />
    </MapView>
  );
}

function TransportFormModal({ title, form, setForm, onMapTap, primaryLabel, onPrimaryPress, onClose, submitting }) {
  const [scrollEnabled, setScrollEnabled] = React.useState(true);

  return (
    <View style={styles.modalCard}>
      <View style={styles.modalHeader}>
        <Text style={styles.modalTitle}>{title}</Text>
        <TouchableOpacity onPress={onClose} style={styles.modalCloseBtn}>
          <MaterialCommunityIcons name="close" size={20} color="#222" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.modalBody} contentContainerStyle={styles.modalBodyContent} scrollEnabled={scrollEnabled}>
        <View style={styles.formGrid}>
          <View style={styles.formCol}>
            <Text style={styles.inputLabel}>Name *</Text>
            <TextInput
              value={form.name}
              onChangeText={(v) => setForm({ ...form, name: v })}
              style={styles.inputBox}
              placeholder="Transport name"
              placeholderTextColor="#999"
            />
          </View>
          <View style={styles.formCol}>
            <Text style={styles.inputLabel}>Phone</Text>
            <TextInput
              value={form.phone}
              onChangeText={(v) => setForm({ ...form, phone: v })}
              style={styles.inputBox}
              keyboardType="phone-pad"
              placeholder="Phone number"
              placeholderTextColor="#999"
            />
          </View>
        </View>

        <Text style={styles.inputLabel}>Location on Map</Text>
        <Text style={styles.mapHint}>Tap on the map to place a pin and auto-fill coordinates.</Text>
        <View
          style={styles.mapWrap}
          onTouchStart={() => setScrollEnabled(false)}
          onTouchEnd={() => setScrollEnabled(true)}
          onTouchCancel={() => setScrollEnabled(true)}
        >
          <TransportMap latitude={form.latitude} longitude={form.longitude} onMapTap={onMapTap} />
        </View>

        <View style={styles.formGrid}>
          <View style={styles.formCol}>
            <Text style={styles.inputLabel}>Latitude</Text>
            <TextInput
              value={form.latitude}
              onChangeText={(v) => setForm({ ...form, latitude: v })}
              style={styles.inputBox}
              keyboardType="decimal-pad"
              placeholder="Latitude"
              placeholderTextColor="#999"
            />
          </View>
          <View style={styles.formCol}>
            <Text style={styles.inputLabel}>Longitude</Text>
            <TextInput
              value={form.longitude}
              onChangeText={(v) => setForm({ ...form, longitude: v })}
              style={styles.inputBox}
              keyboardType="decimal-pad"
              placeholder="Longitude"
              placeholderTextColor="#999"
            />
          </View>
        </View>

        <Text style={styles.inputLabel}>Address</Text>
        <TextInput
          value={form.address}
          onChangeText={(v) => setForm({ ...form, address: v })}
          style={styles.textArea}
          multiline
          placeholder="Address"
          placeholderTextColor="#999"
        />

        <Text style={styles.inputLabel}>GST No</Text>
        <TextInput
          value={form.gstNo}
          onChangeText={(v) => setForm({ ...form, gstNo: v })}
          style={styles.inputBox}
          placeholder="GST Number"
          placeholderTextColor="#999"
        />

        <View style={styles.activeRow}>
          <Switch
            value={form.active}
            onValueChange={(v) => setForm({ ...form, active: v })}
            trackColor={{ false: '#ccc', true: '#8db2ff' }}
            thumbColor={form.active ? '#2453e6' : '#f4f3f4'}
          />
          <Text style={styles.activeText}>Active</Text>
        </View>
      </ScrollView>

      <View style={styles.modalFooter}>
        <TouchableOpacity style={styles.primaryModalBtn} onPress={onPrimaryPress} disabled={submitting}>
          {submitting ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.primaryModalBtnText}>{primaryLabel}</Text>}
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelModalBtn} onPress={onClose}>
          <Text style={styles.cancelModalBtnText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function TransportCard({ transport, onEdit, onDelete }) {
  const isActive = transport.isActive;
  return (
    <View style={styles.transportCard}>
      <View style={styles.cardRow1}>
        <View style={styles.transportInfo}>
          <View style={styles.transportIconWrap}>
            <MaterialCommunityIcons name="truck-outline" size={24} color="#9e9e9e" />
          </View>
          <View style={styles.transportDetails}>
            <Text style={styles.transportName} numberOfLines={1}>{transport.name}</Text>
            <Text style={styles.transportPhone}>{transport.phone}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, isActive ? styles.badgeActive : styles.badgeInactive]}>
          <Text style={[styles.statusBadgeText, isActive ? styles.badgeTextActive : styles.badgeTextInactive]}>
            {isActive ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>

      {transport.address ? (
        <View style={styles.cardMetaRow}>
          <MaterialCommunityIcons name="map-marker-outline" size={13} color="#888" />
          <Text style={styles.cardMeta} numberOfLines={2}> {transport.address}</Text>
        </View>
      ) : null}

      <View style={styles.cardMetaRow}>
        <MaterialCommunityIcons name="crosshairs-gps" size={13} color="#888" />
        <Text style={styles.cardMeta}>
          {' '}{transport.location?.lat?.toFixed(4)}, {transport.location?.lon?.toFixed(4)}
        </Text>
        {transport.gstno ? (
          <>
            <Text style={styles.dot}>  ·  </Text>
            <MaterialCommunityIcons name="file-document-outline" size={13} color="#888" />
            <Text style={styles.cardMeta}> GST: {transport.gstno}</Text>
          </>
        ) : null}
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7} onPress={() => onEdit(transport)}>
          <MaterialCommunityIcons name="pencil-outline" size={17} color="#555" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7} onPress={() => onDelete(transport)}>
          <MaterialCommunityIcons name="trash-can-outline" size={17} color="#e53935" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function TransportScreen() {
  const [transports, setTransports] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTransport, setSelectedTransport] = useState(null);
  const [addForm, setAddForm] = useState(EMPTY_FORM);
  const [editForm, setEditForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  const fetchTransports = async (page = currentPage) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getTransports(page, PAGE_SIZE);
      setTransports(response.data || []);
      setTotalPages(response.pagination?.totalPages || 1);
      setTotalItems(response.pagination?.totalItems || 0);
    } catch (err) {
      setError('Failed to fetch transports');
      console.error('Error fetching transports:', err);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchTransports(currentPage);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTransports(currentPage);
  }, [currentPage]);

  const openEdit = (transport) => {
    setSelectedTransport(transport);
    setEditForm({
      name: transport.name || '',
      phone: transport.phone || '',
      latitude: String(transport.location?.lat ?? 20.5937),
      longitude: String(transport.location?.lon ?? 78.9629),
      address: transport.address || '',
      gstNo: transport.gstno || '',
      active: transport.isActive !== false,
    });
    setShowEditModal(true);
  };

  const handleAddMapTap = useCallback(async (latitude, longitude) => {
    const address = await reverseGeocode(latitude, longitude);
    setAddForm((prev) => ({
      ...prev,
      latitude: String(latitude.toFixed(6)),
      longitude: String(longitude.toFixed(6)),
      address: address || prev.address,
    }));
  }, []);

  const handleEditMapTap = useCallback(async (latitude, longitude) => {
    const address = await reverseGeocode(latitude, longitude);
    setEditForm((prev) => ({
      ...prev,
      latitude: String(latitude.toFixed(6)),
      longitude: String(longitude.toFixed(6)),
      address: address || prev.address,
    }));
  }, []);

  const submitCreate = async () => {
    if (!addForm.name.trim()) {
      Alert.alert('Missing Data', 'Transport name is required');
      return;
    }
    const payload = {
      name: addForm.name.trim(),
      phone: addForm.phone.trim(),
      location: {
        lat: Number(addForm.latitude) || 0,
        lon: Number(addForm.longitude) || 0,
      },
      address: addForm.address.trim(),
      gstno: addForm.gstNo.trim(),
      isActive: addForm.active,
    };
    try {
      setSubmitting(true);
      await createTransport(payload);
      setAddForm(EMPTY_FORM);
      setShowAddModal(false);
      fetchTransports(1);
      setCurrentPage(1);
      Alert.alert('Success', 'Transport created successfully');
    } catch (err) {
      Alert.alert('Create Failed', err.response?.data?.message || 'Unable to create transport');
    } finally {
      setSubmitting(false);
    }
  };

  const submitEdit = async () => {
    if (!selectedTransport?._id) return;
    if (!editForm.name.trim()) {
      Alert.alert('Missing Data', 'Transport name is required');
      return;
    }
    const payload = {
      name: editForm.name.trim(),
      phone: editForm.phone.trim(),
      location: {
        lat: Number(editForm.latitude) || 0,
        lon: Number(editForm.longitude) || 0,
      },
      address: editForm.address.trim(),
      gstno: editForm.gstNo.trim(),
      isActive: editForm.active,
    };
    try {
      setSubmitting(true);
      await updateTransport(selectedTransport._id, payload);
      setShowEditModal(false);
      setSelectedTransport(null);
      fetchTransports(currentPage);
      Alert.alert('Success', 'Transport updated successfully');
    } catch (err) {
      Alert.alert('Update Failed', err.response?.data?.message || 'Unable to update transport');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!selectedTransport?._id) return;
    try {
      setSubmitting(true);
      await deleteTransport(selectedTransport._id);
      setShowDeleteModal(false);
      setSelectedTransport(null);
      fetchTransports(currentPage);
      Alert.alert('Success', 'Transport deleted successfully');
    } catch (err) {
      Alert.alert('Delete Failed', err.response?.data?.message || 'Unable to delete transport');
    } finally {
      setSubmitting(false);
    }
  };

  const showingStart = transports.length ? (currentPage - 1) * PAGE_SIZE + 1 : 0;
  const showingEnd = transports.length ? showingStart + transports.length - 1 : 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <MaterialCommunityIcons name="truck-outline" size={20} color={COLORS.textPrimary} style={styles.headerIcon} />
          <Text style={styles.headerTitle}>Transport Management</Text>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2453e6']} tintColor="#2453e6" />
        }
      >
        <View style={styles.innerContent}>
          <View style={styles.titleToolbar}>
            <View style={styles.titleBlock}>
              <Text style={styles.screenTitle}>Transports</Text>
              <Text style={styles.screenSubtitle}>Manage transport providers with contact and location details.</Text>
            </View>
          </View>

          <View style={styles.toolbar}>
            <View style={styles.filterButton}>
              <Text style={styles.filterButtonText}>All Transports</Text>
              <MaterialCommunityIcons name="chevron-down" size={16} color={COLORS.textPrimary} />
            </View>
            <TouchableOpacity style={styles.createButton} activeOpacity={0.85} onPress={() => setShowAddModal(true)}>
              <MaterialCommunityIcons name="plus" size={17} color={COLORS.white} />
              <Text style={styles.createButtonText}>Add Transport</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.stateBox}>
              <ActivityIndicator size="large" color="#2453e6" />
              <Text style={styles.stateText}>Loading transports...</Text>
            </View>
          ) : error ? (
            <View style={styles.stateBox}>
              <MaterialCommunityIcons name="alert-circle-outline" size={40} color="#e53935" />
              <Text style={styles.stateText}>{error}</Text>
              <TouchableOpacity style={styles.retryBtn} onPress={() => fetchTransports(currentPage)}>
                <Text style={styles.retryBtnText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : transports.length === 0 ? (
            <View style={styles.stateBox}>
              <MaterialCommunityIcons name="truck-outline" size={40} color="#9e9e9e" />
              <Text style={styles.stateText}>No transports found</Text>
            </View>
          ) : (
            <View style={styles.cardList}>
              {transports.map((t) => (
                <TransportCard
                  key={t._id}
                  transport={t}
                  onEdit={openEdit}
                  onDelete={(t) => { setSelectedTransport(t); setShowDeleteModal(true); }}
                />
              ))}
            </View>
          )}

          <Text style={styles.paginationSummary}>
            Showing {showingStart} to {showingEnd} of {totalItems} transports
          </Text>
          <View style={styles.paginationRow}>
            <TouchableOpacity
              style={[styles.paginationButton, currentPage === 1 && styles.paginationButtonDisabled]}
              onPress={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              activeOpacity={0.85}
            >
              <Text style={[styles.paginationButtonText, currentPage === 1 && styles.paginationButtonTextDisabled]}>Previous</Text>
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
              <Text style={[styles.paginationButtonText, currentPage === totalPages && styles.paginationButtonTextDisabled]}>Next</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <Modal visible={showAddModal} transparent animationType="fade" onRequestClose={() => setShowAddModal(false)}>
        <View style={styles.modalBackdrop}>
          <TransportFormModal
            title="Add New Transport"
            form={addForm}
            setForm={setAddForm}
            onMapTap={handleAddMapTap}
            primaryLabel="Create Transport"
            onPrimaryPress={submitCreate}
            onClose={() => setShowAddModal(false)}
            submitting={submitting}
          />
        </View>
      </Modal>

      <Modal visible={showEditModal} transparent animationType="fade" onRequestClose={() => setShowEditModal(false)}>
        <View style={styles.modalBackdrop}>
          <TransportFormModal
            title="Edit Transport"
            form={editForm}
            setForm={setEditForm}
            onMapTap={handleEditMapTap}
            primaryLabel="Update Transport"
            onPrimaryPress={submitEdit}
            onClose={() => setShowEditModal(false)}
            submitting={submitting}
          />
        </View>
      </Modal>

      <Modal visible={showDeleteModal} transparent animationType="fade" onRequestClose={() => setShowDeleteModal(false)}>
        <View style={styles.modalBackdropCenter}>
          <View style={styles.confirmCard}>
            <Text style={styles.confirmTitle}>Confirm Delete</Text>
            <Text style={styles.confirmMessage}>
              Are you sure you want to delete transport "{selectedTransport?.name}"? This action cannot be undone.
            </Text>
            <View style={styles.confirmActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowDeleteModal(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteBtn} onPress={confirmDelete} disabled={submitting}>
                {submitting ? <ActivityIndicator size="small" color="#e53935" /> : <Text style={styles.deleteBtnText}>Delete</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  transportCard: { backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.lg, borderWidth: 1, borderColor: COLORS.gray200, padding: 14 },
  cardRow1: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  transportInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  transportIconWrap: { width: 52, height: 52, borderRadius: 8, backgroundColor: '#f6f6f6', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  transportDetails: { flex: 1 },
  transportName: { fontSize: 16, fontWeight: '700', color: '#151515' },
  transportPhone: { fontSize: 13, color: '#676767', marginTop: 2 },
  statusBadge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  badgeActive: { backgroundColor: '#2453e6' },
  badgeInactive: { backgroundColor: '#fce4ec' },
  statusBadgeText: { fontSize: 12, fontWeight: '600' },
  badgeTextActive: { color: COLORS.white },
  badgeTextInactive: { color: '#c62828' },
  cardMetaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  cardMeta: { fontSize: 13, color: '#555' },
  dot: { fontSize: 13, color: '#ccc' },
  cardActions: { flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 8 },
  iconBtn: { width: 34, height: 34, borderRadius: 8, borderWidth: 1, borderColor: '#dfdfdf', backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center' },
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
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', padding: 10, justifyContent: 'center' },
  modalCard: { height: '90%', maxHeight: '94%', width: '100%', maxWidth: 760, alignSelf: 'center', marginHorizontal: 8, backgroundColor: COLORS.white, borderRadius: 16, borderWidth: 1, borderColor: '#dcdcdc', overflow: 'hidden' },
  modalHeader: { minHeight: 56, borderBottomWidth: 1, borderBottomColor: '#ececec', paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  modalTitle: { fontSize: 22, fontWeight: '700', color: '#111' },
  modalCloseBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  modalBody: { flex: 1 },
  modalBodyContent: { padding: 14, paddingBottom: 24 },
  formGrid: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 14, rowGap: 10 },
  formCol: { width: '48%' },
  inputLabel: { fontSize: 16, fontWeight: '600', color: '#222', marginBottom: 8, marginTop: 2 },
  inputBox: { minHeight: 46, borderRadius: 12, borderWidth: 1, borderColor: '#d6d6d6', backgroundColor: '#fff', paddingHorizontal: 12, fontSize: 17, color: '#111' },
  textArea: { minHeight: 76, borderRadius: 12, borderWidth: 1, borderColor: '#d6d6d6', backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, color: '#111', textAlignVertical: 'top' },
  mapWrap: { height: 280, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#d6d6d6', marginTop: 4, marginBottom: 12 },
  mapHint: { fontSize: 13, color: '#666', marginBottom: 6 },
  activeRow: { marginTop: 10, flexDirection: 'row', alignItems: 'center', gap: 10 },
  activeText: { fontSize: 18, fontWeight: '500', color: '#111' },
  modalFooter: { borderTopWidth: 1, borderTopColor: '#ececec', padding: 12, flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  primaryModalBtn: { minHeight: 40, borderRadius: 12, backgroundColor: '#2453e6', paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center' },
  primaryModalBtnText: { fontSize: 17, fontWeight: '700', color: COLORS.white },
  cancelModalBtn: { minHeight: 40, borderRadius: 12, borderWidth: 1, borderColor: '#d2d2d2', backgroundColor: '#fff', paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center' },
  cancelModalBtnText: { fontSize: 17, color: '#111' },
  modalBackdropCenter: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center', padding: 16 },
  confirmCard: { width: '94%', maxWidth: 760, backgroundColor: COLORS.white, borderRadius: 22, borderWidth: 1, borderColor: '#d8d8d8', overflow: 'hidden', padding: 24 },
  confirmTitle: { fontSize: 46, fontWeight: '700', color: '#111' },
  confirmMessage: { marginTop: 18, fontSize: 24, lineHeight: 34, color: '#6d6d6d' },
  confirmActions: { marginTop: 22, flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  cancelBtn: { minHeight: 48, borderRadius: 14, borderWidth: 1, borderColor: '#d2d2d2', backgroundColor: '#fff', paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center' },
  cancelBtnText: { fontSize: 22, color: '#111' },
  deleteBtn: { minHeight: 48, borderRadius: 14, backgroundColor: '#fbe8e8', paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center' },
  deleteBtnText: { fontSize: 22, fontWeight: '600', color: '#e53935' },
});
