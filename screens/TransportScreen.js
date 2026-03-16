import React, { useMemo, useState } from 'react';
import { Modal, SafeAreaView, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { WebView } from 'react-native-webview';
import { BORDER_RADIUS, COLORS, SPACING } from '../constants/theme';

const PAGE_SIZE = 10;

const INITIAL_TRANSPORT_ROWS = [
  { id: 'TR001', name: 'Vrl', phone: '8076177654', gstNo: '12345', address: 'P-34 Bihari Colony Shahdara P-34', latitude: '22.154249', longitude: '77.780654', status: 'Active' },
  { id: 'TR002', name: 'Two Wheeler', phone: '1234567800', gstNo: '1234567890', address: 'Delhi', latitude: '28.4795', longitude: '77.3126', status: 'Active' },
];

const EMPTY_FORM = {
  name: '',
  phone: '',
  latitude: '35.439414',
  longitude: '74.882813',
  address: '',
  gstNo: '',
  active: true,
};

function buildMapHtml(lat, lng) {
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    html, body, #map { margin: 0; padding: 0; width: 100%; height: 100%; }
    .leaflet-control-attribution { font-size: 11px; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    const initial = [${lat || 20.5937}, ${lng || 78.9629}];
    const map = L.map('map').setView(initial, 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.in" target="_blank">OpenStreetMap India</a> contributors'
    }).addTo(map);
    let marker;
    function pushLocation(lat, lng) {
      if (marker) {
        marker.setLatLng([lat, lng]);
      } else {
        marker = L.marker([lat, lng]).addTo(map);
      }
      window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'location', latitude: lat, longitude: lng }));
    }
    map.on('click', function(e) {
      pushLocation(e.latlng.lat, e.latlng.lng);
    });
    pushLocation(initial[0], initial[1]);
  </script>
</body>
</html>`;
}

function StatusBadge({ status }) {
  const active = status === 'Active';
  return (
    <View style={[styles.badge, active ? styles.badgeActive : styles.badgeInactive]}>
      <Text style={[styles.badgeText, active ? styles.badgeTextActive : styles.badgeTextInactive]}>{status}</Text>
    </View>
  );
}

export default function TransportScreen() {
  const [transportRows, setTransportRows] = useState(INITIAL_TRANSPORT_ROWS);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTransport, setSelectedTransport] = useState(null);
  const [addForm, setAddForm] = useState(EMPTY_FORM);
  const [editForm, setEditForm] = useState(EMPTY_FORM);

  const totalPages = Math.max(1, Math.ceil(transportRows.length / PAGE_SIZE));
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const pageRows = useMemo(() => transportRows.slice(pageStart, pageStart + PAGE_SIZE), [transportRows, pageStart]);
  const showingStart = pageRows.length ? pageStart + 1 : 0;
  const showingEnd = Math.min(pageStart + PAGE_SIZE, transportRows.length);

  const parseCoord = (value, fallback) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  };

  const reverseGeocode = async (latitude, longitude, setter, currentForm) => {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=jsonv2`;
      const response = await fetch(url, {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'vfp-app',
        },
      });
      const data = await response.json();
      const displayName = data?.display_name || '';
      setter({ ...currentForm, latitude: String(latitude.toFixed(6)), longitude: String(longitude.toFixed(6)), address: displayName || currentForm.address });
    } catch (error) {
      setter({ ...currentForm, latitude: String(latitude.toFixed(6)), longitude: String(longitude.toFixed(6)) });
    }
  };

  const onAddMapMessage = (event) => {
    try {
      const message = JSON.parse(event.nativeEvent.data || '{}');
      if (message.type === 'location') {
        reverseGeocode(message.latitude, message.longitude, setAddForm, addForm);
      }
    } catch (error) {
      // no-op
    }
  };

  const onEditMapMessage = (event) => {
    try {
      const message = JSON.parse(event.nativeEvent.data || '{}');
      if (message.type === 'location') {
        reverseGeocode(message.latitude, message.longitude, setEditForm, editForm);
      }
    } catch (error) {
      // no-op
    }
  };

  const openEditModal = (row) => {
    setSelectedTransport(row);
    setEditForm({
      name: row.name,
      phone: row.phone,
      latitude: row.latitude,
      longitude: row.longitude,
      address: row.address,
      gstNo: row.gstNo,
      active: row.status === 'Active',
    });
    setShowEditModal(true);
  };

  const submitAdd = () => {
    const next = {
      id: `TR${String(transportRows.length + 1).padStart(3, '0')}`,
      name: addForm.name.trim() || `Transport ${transportRows.length + 1}`,
      phone: addForm.phone.trim() || '0000000000',
      gstNo: addForm.gstNo.trim(),
      address: addForm.address.trim() || 'Address not set',
      latitude: addForm.latitude,
      longitude: addForm.longitude,
      status: addForm.active ? 'Active' : 'Inactive',
    };
    setTransportRows((prev) => [next, ...prev]);
    setAddForm(EMPTY_FORM);
    setShowAddModal(false);
    setCurrentPage(1);
  };

  const submitEdit = () => {
    if (!selectedTransport) return;
    setTransportRows((prev) =>
      prev.map((row) =>
        row.id === selectedTransport.id
          ? {
              ...row,
              name: editForm.name,
              phone: editForm.phone,
              latitude: editForm.latitude,
              longitude: editForm.longitude,
              address: editForm.address,
              gstNo: editForm.gstNo,
              status: editForm.active ? 'Active' : 'Inactive',
            }
          : row
      )
    );
    setShowEditModal(false);
    setSelectedTransport(null);
  };

  const confirmDelete = () => {
    if (!selectedTransport) return;
    setTransportRows((prev) => prev.filter((row) => row.id !== selectedTransport.id));
    setShowDeleteModal(false);
    setSelectedTransport(null);
  };

  const TransportFormModal = ({ title, form, setForm, onMapMessage, primaryLabel, onPrimaryPress, onClose }) => (
    <View style={styles.modalCard}>
      <View style={styles.modalHeader}>
        <Text style={styles.modalTitle}>{title}</Text>
        <TouchableOpacity style={styles.modalCloseBtn} onPress={onClose}>
          <MaterialCommunityIcons name="close" size={20} color="#222" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.modalBody} contentContainerStyle={styles.modalBodyContent}>
        <View style={styles.formGrid}>
          <View style={styles.formCol}>
            <Text style={styles.inputLabel}>Name *</Text>
            <TextInput value={form.name} onChangeText={(v) => setForm({ ...form, name: v })} style={styles.inputBox} />
          </View>
          <View style={styles.formCol}>
            <Text style={styles.inputLabel}>Phone</Text>
            <TextInput value={form.phone} onChangeText={(v) => setForm({ ...form, phone: v })} style={styles.inputBox} keyboardType="phone-pad" />
          </View>
        </View>

        <Text style={styles.inputLabel}>Location on Map</Text>
        <View style={styles.mapWrap}>
          <WebView
            key={`${title}-${form.latitude}-${form.longitude}`}
            originWhitelist={['*']}
            source={{ html: buildMapHtml(parseCoord(form.latitude, 20.5937), parseCoord(form.longitude, 78.9629)) }}
            onMessage={onMapMessage}
            javaScriptEnabled
            domStorageEnabled
            mixedContentMode="always"
            style={styles.mapWebView}
          />
        </View>
        <Text style={styles.mapHint}>Click on the map to place marker and auto-fill latitude/longitude.</Text>

        <View style={styles.formGrid}>
          <View style={styles.formCol}>
            <Text style={styles.inputLabel}>Latitude</Text>
            <TextInput value={form.latitude} onChangeText={(v) => setForm({ ...form, latitude: v })} style={styles.inputBox} keyboardType="decimal-pad" />
          </View>
          <View style={styles.formCol}>
            <Text style={styles.inputLabel}>Longitude</Text>
            <TextInput value={form.longitude} onChangeText={(v) => setForm({ ...form, longitude: v })} style={styles.inputBox} keyboardType="decimal-pad" />
          </View>
        </View>

        <Text style={styles.inputLabel}>Address</Text>
        <TextInput value={form.address} onChangeText={(v) => setForm({ ...form, address: v })} style={styles.textArea} multiline />

        <Text style={styles.inputLabel}>GST No</Text>
        <TextInput value={form.gstNo} onChangeText={(v) => setForm({ ...form, gstNo: v })} style={styles.inputBox} />

        <View style={styles.activeRow}>
          <Switch value={form.active} onValueChange={(v) => setForm({ ...form, active: v })} trackColor={{ false: '#ccc', true: '#8db2ff' }} thumbColor={form.active ? '#2453e6' : '#f4f3f4'} />
          <Text style={styles.activeText}>Active</Text>
        </View>
      </ScrollView>

      <View style={styles.modalFooter}>
        <TouchableOpacity style={styles.primaryModalBtn} onPress={onPrimaryPress}>
          <Text style={styles.primaryModalBtnText}>{primaryLabel}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelModalBtn} onPress={onClose}>
          <Text style={styles.cancelModalBtnText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

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
            <TouchableOpacity style={styles.addButton} activeOpacity={0.85} onPress={() => setShowAddModal(true)}>
              <MaterialCommunityIcons name="plus" size={17} color={COLORS.white} />
              <Text style={styles.addButtonText}>Add Transport</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.tableCard}>
            <ScrollView horizontal showsHorizontalScrollIndicator>
              <View>
                <View style={styles.tableHeaderRow}>
                  <Text style={[styles.tableHeaderText, styles.nameCol]}>Name</Text>
                  <Text style={[styles.tableHeaderText, styles.phoneCol]}>Phone</Text>
                  <Text style={[styles.tableHeaderText, styles.gstCol]}>GST No</Text>
                  <Text style={[styles.tableHeaderText, styles.addressCol]}>Address</Text>
                  <Text style={[styles.tableHeaderText, styles.locationCol]}>Location</Text>
                  <Text style={[styles.tableHeaderText, styles.statusCol]}>Status</Text>
                  <Text style={[styles.tableHeaderText, styles.actionCol]}>Actions</Text>
                </View>

                {pageRows.map((row) => (
                  <View key={row.id} style={styles.tableBodyRow}>
                    <View style={[styles.nameCol, styles.nameCell]}>
                      <MaterialCommunityIcons name="truck-outline" size={22} color="#6f6f6f" style={styles.nameIcon} />
                      <Text style={styles.tableBodyTextStrong}>{row.name}</Text>
                    </View>
                    <View style={[styles.phoneCol, styles.inlineIconCell]}>
                      <MaterialCommunityIcons name="phone-outline" size={22} color="#6f6f6f" />
                      <Text style={styles.tableBodyTextMuted}>{row.phone}</Text>
                    </View>
                    <Text style={[styles.tableBodyTextMuted, styles.gstCol]}>{row.gstNo || '-'}</Text>
                    <Text style={[styles.tableBodyTextMuted, styles.addressCol]} numberOfLines={2}>{row.address}</Text>
                    <View style={[styles.locationCol, styles.inlineIconCell]}>
                      <MaterialCommunityIcons name="map-marker-outline" size={20} color="#6f6f6f" />
                      <Text style={styles.tableBodyTextMuted}>{row.latitude}, {row.longitude}</Text>
                    </View>
                    <View style={styles.statusCol}>
                      <StatusBadge status={row.status} />
                    </View>
                    <View style={[styles.actionCol, styles.actionRow]}>
                      <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7} onPress={() => openEditModal(row)}>
                        <MaterialCommunityIcons name="pencil-outline" size={16} color="#555" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.iconBtn}
                        activeOpacity={0.7}
                        onPress={() => {
                          setSelectedTransport(row);
                          setShowDeleteModal(true);
                        }}
                      >
                        <MaterialCommunityIcons name="trash-can-outline" size={16} color="#ff3b30" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>

          <Text style={styles.paginationSummary}>Showing {showingStart} to {showingEnd} of {transportRows.length} transports</Text>
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

      <Modal visible={showAddModal} transparent animationType="fade" onRequestClose={() => setShowAddModal(false)}>
        <View style={styles.modalBackdrop}>
          <TransportFormModal
            title="Add New Transport"
            form={addForm}
            setForm={setAddForm}
            onMapMessage={onAddMapMessage}
            primaryLabel="Create Transport"
            onPrimaryPress={submitAdd}
            onClose={() => setShowAddModal(false)}
          />
        </View>
      </Modal>

      <Modal visible={showEditModal} transparent animationType="fade" onRequestClose={() => setShowEditModal(false)}>
        <View style={styles.modalBackdrop}>
          <TransportFormModal
            title="Edit Transport"
            form={editForm}
            setForm={setEditForm}
            onMapMessage={onEditMapMessage}
            primaryLabel="Update Transport"
            onPrimaryPress={submitEdit}
            onClose={() => setShowEditModal(false)}
          />
        </View>
      </Modal>

      <Modal visible={showDeleteModal} transparent animationType="fade" onRequestClose={() => setShowDeleteModal(false)}>
        <View style={styles.modalBackdropCenter}>
          <View style={styles.deleteModalCard}>
            <Text style={styles.deleteTitle}>Confirm Delete</Text>
            <Text style={styles.deleteMessage}>Are you sure you want to delete transport "{selectedTransport?.name}"? This action cannot be undone.</Text>
            <View style={styles.deleteActionRow}>
              <TouchableOpacity style={styles.cancelModalBtn} onPress={() => setShowDeleteModal(false)}>
                <Text style={styles.cancelModalBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteConfirmBtn} onPress={confirmDelete}>
                <Text style={styles.deleteConfirmBtnText}>Delete</Text>
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
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 16 },
  titleGroup: { flex: 1 },
  screenTitle: { fontSize: 22, fontWeight: '700', color: '#161616' },
  screenSubtitle: { marginTop: 3, fontSize: 13, color: '#6d6d6d' },
  addButton: { height: 36, borderRadius: 10, backgroundColor: '#2453e6', paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 5 },
  addButtonText: { fontSize: 13, fontWeight: '600', color: COLORS.white },
  tableCard: { backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.xl, borderWidth: 1, borderColor: COLORS.gray200, overflow: 'hidden' },
  tableHeaderRow: { flexDirection: 'row', alignItems: 'center', minHeight: 52, borderBottomWidth: 1, borderBottomColor: COLORS.gray200, paddingHorizontal: 10, backgroundColor: '#fff' },
  tableBodyRow: { flexDirection: 'row', alignItems: 'center', minHeight: 62, borderBottomWidth: 1, borderBottomColor: COLORS.gray200, paddingHorizontal: 10, backgroundColor: '#fff' },
  tableHeaderText: { fontSize: 15, fontWeight: '700', color: '#222' },
  tableBodyTextStrong: { fontSize: 15, fontWeight: '600', color: '#222' },
  tableBodyTextMuted: { fontSize: 15, color: '#676767' },
  nameCol: { width: 220 },
  phoneCol: { width: 210 },
  gstCol: { width: 130 },
  addressCol: { width: 390 },
  locationCol: { width: 220 },
  statusCol: { width: 120 },
  actionCol: { width: 110 },
  nameCell: { flexDirection: 'row', alignItems: 'center' },
  nameIcon: { marginRight: 10 },
  inlineIconCell: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  badge: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  badgeActive: { backgroundColor: '#2453e6' },
  badgeInactive: { backgroundColor: '#fce4ec' },
  badgeText: { fontSize: 12, fontWeight: '700' },
  badgeTextActive: { color: COLORS.white },
  badgeTextInactive: { color: '#c62828' },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBtn: { width: 30, height: 30, borderRadius: 8, borderWidth: 1, borderColor: '#dfdfdf', backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center' },
  paginationSummary: { marginTop: 24, fontSize: 14, color: '#6d6d6d' },
  paginationRow: { marginTop: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  paginationButton: { minWidth: 80, height: 32, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1, borderColor: '#dfdfdf', backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center' },
  paginationButtonDisabled: { backgroundColor: '#fbfbfb' },
  paginationButtonText: { fontSize: 14, fontWeight: '600', color: '#111111' },
  paginationButtonTextDisabled: { color: '#a6a6a6' },
  pageIndicator: { minWidth: 120, height: 36, borderRadius: 8, borderWidth: 1, borderColor: '#dfdfdf', backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center' },
  pageIndicatorText: { fontSize: 14, fontWeight: '600', color: '#151515' },

  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', padding: 10, justifyContent: 'center' },
  modalCard: { maxHeight: '94%', backgroundColor: COLORS.white, borderRadius: 18, borderWidth: 1, borderColor: '#dcdcdc', overflow: 'hidden' },
  modalHeader: { minHeight: 56, borderBottomWidth: 1, borderBottomColor: '#ececec', paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  modalTitle: { fontSize: 36, fontWeight: '700', color: '#111' },
  modalCloseBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  modalBody: { flex: 1 },
  modalBodyContent: { padding: 16, paddingBottom: 22 },
  formGrid: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 14, rowGap: 10 },
  formCol: { width: '48%' },
  inputLabel: { fontSize: 16, fontWeight: '600', color: '#222', marginBottom: 8, marginTop: 2 },
  inputBox: { minHeight: 46, borderRadius: 12, borderWidth: 1, borderColor: '#d6d6d6', backgroundColor: '#fff', paddingHorizontal: 12, fontSize: 17, color: '#111' },
  textArea: { minHeight: 84, borderRadius: 12, borderWidth: 1, borderColor: '#d6d6d6', backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, color: '#111', textAlignVertical: 'top' },
  mapWrap: { height: 300, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#d6d6d6', marginTop: 2 },
  mapWebView: { flex: 1, backgroundColor: '#f5f5f5' },
  mapHint: { marginTop: 8, fontSize: 13, color: '#666' },
  activeRow: { marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 10 },
  activeText: { fontSize: 20, fontWeight: '500', color: '#111' },
  modalFooter: { borderTopWidth: 1, borderTopColor: '#ececec', padding: 12, flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  primaryModalBtn: { minHeight: 42, borderRadius: 12, backgroundColor: '#2453e6', paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center' },
  primaryModalBtnText: { fontSize: 17, fontWeight: '700', color: COLORS.white },
  cancelModalBtn: { minHeight: 42, borderRadius: 12, borderWidth: 1, borderColor: '#d2d2d2', backgroundColor: '#fff', paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center' },
  cancelModalBtnText: { fontSize: 17, color: '#111' },

  modalBackdropCenter: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center', padding: 16 },
  deleteModalCard: { width: '95%', maxWidth: 900, backgroundColor: COLORS.white, borderRadius: 24, borderWidth: 1, borderColor: '#d8d8d8', overflow: 'hidden', padding: 24 },
  deleteTitle: { fontSize: 52, fontWeight: '700', color: '#111' },
  deleteMessage: { marginTop: 20, fontSize: 24, lineHeight: 36, color: '#6d6d6d' },
  deleteActionRow: { marginTop: 26, flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  deleteConfirmBtn: { minHeight: 52, borderRadius: 16, backgroundColor: '#fbe8e8', paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center' },
  deleteConfirmBtnText: { fontSize: 22, fontWeight: '600', color: '#e53935' },
});
