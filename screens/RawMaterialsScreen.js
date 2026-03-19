import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { createRawMaterial, deleteRawMaterial, generateUploadUrl, getRawMaterials, updateRawMaterial } from '../api/api-methods';
import { COLORS, SPACING } from '../constants/theme';

const PAGE_SIZE = 10;

const EMPTY_FORM = {
  name: '',
  unit: '',
  category: '',
  supplier: '',
  description: '',
  imageUrls: [],
  isActive: true,
};

function StatusBadge({ isActive }) {
  return (
    <View style={[styles.statusBadge, isActive ? styles.statusBadgeActive : styles.statusBadgeInactive]}>
      <Text style={[styles.statusBadgeText, isActive ? styles.statusBadgeTextActive : styles.statusBadgeTextInactive]}>
        {isActive ? 'Active' : 'Inactive'}
      </Text>
    </View>
  );
}

function RawMaterialMobileCard({ item, onEdit, onDelete }) {
  const imageText = item.images?.length ? `${item.images.length} image${item.images.length > 1 ? 's' : ''}` : 'No images';

  return (
    <View style={styles.mobileCard}>
      <View style={styles.mobileCardHeader}>
        <View style={styles.mobileCardHeaderTextWrap}>
          <Text style={styles.mobileCardTitle} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.mobileCardSubTitle}>{item.unit || 'N/A'}</Text>
        </View>
        <StatusBadge isActive={item.isActive !== false} />
      </View>

      <View style={styles.mobileMetaRow}>
        <MaterialCommunityIcons name="image-outline" size={13} color="#767676" />
        <Text style={styles.mobileMetaText}> {imageText}</Text>
      </View>
      <View style={styles.mobileMetaRow}>
        <MaterialCommunityIcons name="shape-outline" size={13} color="#767676" />
        <Text style={styles.mobileMetaText}> {item.category || 'N/A'}</Text>
      </View>
      <View style={styles.mobileMetaRow}>
        <MaterialCommunityIcons name="truck-outline" size={13} color="#767676" />
        <Text style={styles.mobileMetaText}> {item.supplier || 'N/A'}</Text>
      </View>

      <View style={styles.mobileCardActions}>
        <TouchableOpacity style={styles.actionIconBtn} activeOpacity={0.8} onPress={() => onEdit(item)}>
          <MaterialCommunityIcons name="pencil-outline" size={17} color="#1a1a1a" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionIconBtn} activeOpacity={0.8} onPress={() => onDelete(item)}>
          <MaterialCommunityIcons name="trash-can-outline" size={17} color="#f04438" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function RawMaterialsTable({ rows, onEdit, onDelete }) {
  return (
    <View style={styles.tableCard}>
      <View style={styles.tableHeaderRow}>
        <Text style={[styles.tableHeaderText, styles.colName]}>Name</Text>
        <Text style={[styles.tableHeaderText, styles.colUnit]}>Unit</Text>
        <Text style={[styles.tableHeaderText, styles.colImages]}>Images</Text>
        <Text style={[styles.tableHeaderText, styles.colStatus]}>Status</Text>
        <Text style={[styles.tableHeaderText, styles.colActions]}>Actions</Text>
      </View>

      {rows.map((item, index) => (
        <View key={item._id} style={[styles.tableRow, index === rows.length - 1 && styles.tableRowLast]}>
          <Text style={[styles.tableCellPrimary, styles.colName]} numberOfLines={1}>{item.name}</Text>
          <Text style={[styles.tableCellText, styles.colUnit]} numberOfLines={1}>{item.unit || 'N/A'}</Text>
          <Text style={[styles.tableCellMuted, styles.colImages]} numberOfLines={1}>
            {item.images?.length ? `${item.images.length} image${item.images.length > 1 ? 's' : ''}` : 'No images'}
          </Text>
          <View style={[styles.colStatus, styles.statusCellWrap]}>
            <StatusBadge isActive={item.isActive !== false} />
          </View>
          <View style={[styles.colActions, styles.actionsCellWrap]}>
            <TouchableOpacity style={styles.actionIconBtn} activeOpacity={0.8} onPress={() => onEdit(item)}>
              <MaterialCommunityIcons name="pencil-outline" size={17} color="#1a1a1a" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionIconBtn} activeOpacity={0.8} onPress={() => onDelete(item)}>
              <MaterialCommunityIcons name="trash-can-outline" size={17} color="#f04438" />
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );
}

function RawMaterialModalForm({
  title,
  form,
  setForm,
  primaryLabel,
  onPrimaryPress,
  onClose,
  submitting,
  compact,
}) {
  const [imageUploading, setImageUploading] = useState(false);

  const uploadToS3 = async (uploadUrl, fileUri, mimeType) => {
    const uploadResult = await FileSystem.uploadAsync(uploadUrl, fileUri, {
      headers: { 'Content-Type': mimeType },
      httpMethod: 'PUT',
      uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
    });

    if (uploadResult.status < 200 || uploadResult.status >= 300) {
      throw new Error(`S3 upload failed: ${uploadResult.status}`);
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please allow gallery permission to upload images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: false,
        quality: 0.85,
      });

      if (result.canceled || !result.assets?.length) return;

      const asset = result.assets[0];
      const fileUri = asset.uri;
      const fileName = asset.fileName || fileUri.split('/').pop() || `raw_material_${Date.now()}.jpg`;
      const mimeType = asset.mimeType || 'image/jpeg';

      setImageUploading(true);

      const { uploadUrl, fileUrl } = await generateUploadUrl(fileName, mimeType, 'raw-materials');
      await uploadToS3(uploadUrl, fileUri, mimeType);

      setForm((currentForm) => ({
        ...currentForm,
        imageUrls: [...currentForm.imageUrls, fileUrl],
      }));
    } catch (error) {
      console.error('Raw material image upload error:', error);
      Alert.alert('Upload Failed', 'Could not upload image. Please try again.');
    } finally {
      setImageUploading(false);
    }
  };

  return (
    <View style={[styles.formModalCard, compact && styles.formModalCardCompact]}>
      <View style={styles.formModalHeader}>
        <Text style={[styles.formModalTitle, compact && styles.formModalTitleCompact]}>{title}</Text>
        <TouchableOpacity onPress={onClose} disabled={submitting || imageUploading}>
          <MaterialCommunityIcons name="close" size={22} color="#1f1f1f" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.formModalBody} contentContainerStyle={styles.formModalBodyContent}>
        <View style={styles.formGrid}>
          <View style={[styles.formCol, compact && styles.formColCompact]}>
            <Text style={styles.formLabel}>Name *</Text>
            <TextInput
              value={form.name}
              onChangeText={(value) => setForm((current) => ({ ...current, name: value }))}
              style={styles.formInput}
              placeholder="Enter raw material name"
              placeholderTextColor="#9d9d9d"
            />
          </View>
          <View style={[styles.formCol, compact && styles.formColCompact]}>
            <Text style={styles.formLabel}>Unit *</Text>
            <TextInput
              value={form.unit}
              onChangeText={(value) => setForm((current) => ({ ...current, unit: value }))}
              style={styles.formInput}
              placeholder="Enter unit"
              placeholderTextColor="#9d9d9d"
            />
          </View>
          <View style={[styles.formCol, compact && styles.formColCompact]}>
            <Text style={styles.formLabel}>Category *</Text>
            <TextInput
              value={form.category}
              onChangeText={(value) => setForm((current) => ({ ...current, category: value }))}
              style={styles.formInput}
              placeholder="Enter category"
              placeholderTextColor="#9d9d9d"
            />
          </View>
          <View style={[styles.formCol, compact && styles.formColCompact]}>
            <Text style={styles.formLabel}>Supplier *</Text>
            <TextInput
              value={form.supplier}
              onChangeText={(value) => setForm((current) => ({ ...current, supplier: value }))}
              style={styles.formInput}
              placeholder="Enter supplier"
              placeholderTextColor="#9d9d9d"
            />
          </View>
        </View>

        <Text style={styles.formLabel}>Description</Text>
        <TextInput
          value={form.description}
          onChangeText={(value) => setForm((current) => ({ ...current, description: value }))}
          style={styles.formTextArea}
          multiline
          placeholder="Enter description"
          placeholderTextColor="#9d9d9d"
          textAlignVertical="top"
        />

        <Text style={styles.formLabel}>Images</Text>
        <TouchableOpacity
          style={[styles.chooseImageBtn, imageUploading && styles.chooseImageBtnDisabled]}
          onPress={pickImage}
          disabled={imageUploading || submitting}
          activeOpacity={0.85}
        >
          {imageUploading ? (
            <>
              <ActivityIndicator size="small" color="#2453e6" />
              <Text style={styles.chooseImageBtnText}>Uploading...</Text>
            </>
          ) : (
            <>
              <MaterialCommunityIcons name="image-plus" size={18} color="#2453e6" />
              <Text style={styles.chooseImageBtnText}>Choose Files</Text>
            </>
          )}
        </TouchableOpacity>

        {form.imageUrls.length > 0 ? (
          <View style={styles.thumbnailList}>
            {form.imageUrls.map((url, index) => (
              <View key={`${url}-${index}`} style={styles.thumbnailWrap}>
                <Image source={{ uri: url }} style={styles.thumbnailImage} />
                <TouchableOpacity
                  style={styles.thumbnailRemoveBtn}
                  onPress={() => setForm((currentForm) => ({
                    ...currentForm,
                    imageUrls: currentForm.imageUrls.filter((_, idx) => idx !== index),
                  }))}
                >
                  <MaterialCommunityIcons name="close-circle" size={20} color="#e53935" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.noImageText}>No file chosen</Text>
        )}

        <View style={styles.switchRow}>
          <Switch
            value={form.isActive}
            onValueChange={(value) => setForm((current) => ({ ...current, isActive: value }))}
            trackColor={{ false: '#d0d5dd', true: '#8fb2ff' }}
            thumbColor={form.isActive ? '#2453e6' : '#ffffff'}
          />
          <Text style={styles.switchText}>Active</Text>
        </View>
      </ScrollView>

      <View style={styles.formModalFooter}>
        <TouchableOpacity style={styles.primaryBtn} onPress={onPrimaryPress} disabled={submitting || imageUploading}>
          {submitting ? <ActivityIndicator size="small" color="#ffffff" /> : <Text style={styles.primaryBtnText}>{primaryLabel}</Text>}
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryBtn} onPress={onClose} disabled={submitting || imageUploading}>
          <Text style={styles.secondaryBtnText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function RawMaterialsScreen() {
  const { width } = useWindowDimensions();
  const desktopLayout = width >= 900;

  const [rawMaterials, setRawMaterials] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [addForm, setAddForm] = useState(EMPTY_FORM);
  const [editForm, setEditForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  const fetchRawMaterials = async (page = currentPage) => {
    setLoading(true);
    setError(null);

    try {
      const response = await getRawMaterials(page, PAGE_SIZE);
      setRawMaterials(response.data || []);
      setTotalPages(response.pagination?.totalPages || 1);
      setTotalItems(response.pagination?.totalItems || 0);
    } catch (err) {
      console.error('Error fetching raw materials:', err);
      setError('Failed to fetch raw materials');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRawMaterials(currentPage);
  }, [currentPage]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchRawMaterials(currentPage);
    } finally {
      setRefreshing(false);
    }
  };

  const pagination = useMemo(() => {
    const start = rawMaterials.length ? (currentPage - 1) * PAGE_SIZE + 1 : 0;
    const end = rawMaterials.length ? start + rawMaterials.length - 1 : 0;
    return { start, end };
  }, [rawMaterials.length, currentPage]);

  const validateForm = (form, mode = 'create') => {
    if (!form.name.trim()) {
      Alert.alert('Validation Error', 'Name is required');
      return false;
    }
    if (!form.unit.trim()) {
      Alert.alert('Validation Error', 'Unit is required');
      return false;
    }
    if (!form.category.trim()) {
      Alert.alert('Validation Error', 'Category is required');
      return false;
    }
    if (!form.supplier.trim()) {
      Alert.alert('Validation Error', 'Supplier is required');
      return false;
    }
    if (mode === 'edit' && !selectedItem?._id) {
      Alert.alert('Error', 'No raw material selected');
      return false;
    }

    return true;
  };

  const buildPayload = (form) => ({
    name: form.name.trim(),
    unit: form.unit.trim(),
    category: form.category.trim(),
    supplier: form.supplier.trim(),
    description: form.description.trim() || '',
    images: form.imageUrls,
    isActive: form.isActive,
  });

  const submitCreate = async () => {
    if (!validateForm(addForm, 'create')) return;

    try {
      setSubmitting(true);
      await createRawMaterial(buildPayload(addForm));
      setShowAddModal(false);
      setAddForm(EMPTY_FORM);
      setCurrentPage(1);
      await fetchRawMaterials(1);
      Alert.alert('Success', 'Raw material created successfully');
    } catch (err) {
      Alert.alert('Create Failed', err.response?.data?.message || 'Unable to create raw material');
    } finally {
      setSubmitting(false);
    }
  };

  const openEdit = (item) => {
    setSelectedItem(item);
    setEditForm({
      name: item.name || '',
      unit: item.unit || '',
      category: item.category || '',
      supplier: item.supplier || '',
      description: item.description || '',
      imageUrls: item.images || [],
      isActive: item.isActive !== false,
    });
    setShowEditModal(true);
  };

  const submitEdit = async () => {
    if (!validateForm(editForm, 'edit')) return;

    try {
      setSubmitting(true);
      await updateRawMaterial(selectedItem._id, buildPayload(editForm));
      setShowEditModal(false);
      setSelectedItem(null);
      await fetchRawMaterials(currentPage);
      Alert.alert('Success', 'Raw material updated successfully');
    } catch (err) {
      Alert.alert('Update Failed', err.response?.data?.message || 'Unable to update raw material');
    } finally {
      setSubmitting(false);
    }
  };

  const openDelete = (item) => {
    setSelectedItem(item);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedItem?._id) return;

    try {
      setSubmitting(true);
      await deleteRawMaterial(selectedItem._id);
      setShowDeleteModal(false);
      setSelectedItem(null);
      await fetchRawMaterials(currentPage);
      Alert.alert('Success', 'Raw material deleted successfully');
    } catch (err) {
      Alert.alert('Delete Failed', err.response?.data?.message || 'Unable to delete raw material');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <MaterialCommunityIcons name="package-variant-closed" size={20} color={COLORS.textPrimary} style={styles.headerIcon} />
          <Text style={styles.headerTitle}>Raw Material Management</Text>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2453e6']}
            tintColor="#2453e6"
          />
        }
      >
        <View style={styles.innerContent}>
          <View style={styles.titleToolbar}>
            <View style={styles.titleBlock}>
              <Text style={[styles.screenTitle, width < 700 && styles.screenTitleCompact]}>Raw Materials</Text>
              <Text style={[styles.screenSubtitle, width < 700 && styles.screenSubtitleCompact]}>Manage raw materials and suppliers.</Text>
            </View>
            <TouchableOpacity style={[styles.addButton, width < 700 && styles.addButtonCompact]} activeOpacity={0.85} onPress={() => setShowAddModal(true)}>
              <MaterialCommunityIcons name="plus" size={17} color={COLORS.white} />
              <Text style={styles.addButtonText}>Add Raw Material</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.stateBox}>
              <ActivityIndicator size="large" color="#2453e6" />
              <Text style={styles.stateText}>Loading raw materials...</Text>
            </View>
          ) : error ? (
            <View style={styles.stateBox}>
              <MaterialCommunityIcons name="alert-circle-outline" size={40} color="#e53935" />
              <Text style={styles.stateText}>{error}</Text>
              <TouchableOpacity style={styles.retryBtn} onPress={() => fetchRawMaterials(currentPage)}>
                <Text style={styles.retryBtnText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : rawMaterials.length === 0 ? (
            <View style={styles.stateBox}>
              <MaterialCommunityIcons name="package-variant" size={40} color="#9e9e9e" />
              <Text style={styles.stateText}>No raw materials found</Text>
            </View>
          ) : desktopLayout ? (
            <RawMaterialsTable rows={rawMaterials} onEdit={openEdit} onDelete={openDelete} />
          ) : (
            <View style={styles.mobileCardList}>
              {rawMaterials.map((item) => (
                <RawMaterialMobileCard key={item._id} item={item} onEdit={openEdit} onDelete={openDelete} />
              ))}
            </View>
          )}

          <Text style={styles.paginationSummary}>
            Showing {pagination.start} to {pagination.end} of {totalItems} raw materials
          </Text>
          <View style={styles.paginationRow}>
            <TouchableOpacity
              style={[styles.paginationButton, currentPage === 1 && styles.paginationButtonDisabled]}
              onPress={() => setCurrentPage((page) => Math.max(1, page - 1))}
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
              onPress={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
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
          <RawMaterialModalForm
            title="Add New Raw Material"
            form={addForm}
            setForm={setAddForm}
            primaryLabel="Create Raw Material"
            onPrimaryPress={submitCreate}
            onClose={() => setShowAddModal(false)}
            submitting={submitting}
            compact={width < 700}
          />
        </View>
      </Modal>

      <Modal visible={showEditModal} transparent animationType="fade" onRequestClose={() => setShowEditModal(false)}>
        <View style={styles.modalBackdrop}>
          <RawMaterialModalForm
            title="Edit Raw Material"
            form={editForm}
            setForm={setEditForm}
            primaryLabel="Update Raw Material"
            onPrimaryPress={submitEdit}
            onClose={() => setShowEditModal(false)}
            submitting={submitting}
            compact={width < 700}
          />
        </View>
      </Modal>

      <Modal visible={showDeleteModal} transparent animationType="fade" onRequestClose={() => setShowDeleteModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.deleteModalCard, width < 700 && styles.deleteModalCardCompact]}>
            <View style={styles.deleteModalHeader}>
              <Text style={[styles.deleteTitle, width < 700 && styles.deleteTitleCompact]}>Confirm Delete</Text>
            </View>
            <View style={styles.deleteModalBody}>
              <Text style={[styles.deleteMessage, width < 700 && styles.deleteMessageCompact]}>
                Are you sure you want to delete the raw material "{selectedItem?.name}"? This action cannot be undone.
              </Text>
            </View>
            <View style={styles.deleteActions}>
              <TouchableOpacity style={styles.secondaryBtn} onPress={() => setShowDeleteModal(false)} disabled={submitting}>
                <Text style={styles.secondaryBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteBtn} onPress={confirmDelete} disabled={submitting}>
                {submitting ? <ActivityIndicator size="small" color="#f04438" /> : <Text style={styles.deleteBtnText}>Delete</Text>}
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
  header: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center' },
  headerIcon: { marginRight: SPACING.md },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },

  content: { flex: 1, backgroundColor: '#fcfcfa' },
  innerContent: { paddingHorizontal: 16, paddingTop: 22, paddingBottom: 40 },
  titleToolbar: {
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    flexWrap: 'wrap',
  },
  titleBlock: { flexShrink: 1 },
  screenTitle: { fontSize: 36, fontWeight: '700', color: '#151515', lineHeight: 40 },
  screenTitleCompact: { fontSize: 28, lineHeight: 32 },
  screenSubtitle: { marginTop: 4, fontSize: 16, color: '#6f6f6f' },
  screenSubtitleCompact: { fontSize: 14 },
  addButton: {
    height: 40,
    borderRadius: 12,
    backgroundColor: '#2453e6',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  addButtonCompact: { height: 38 },
  addButtonText: { fontSize: 15, fontWeight: '600', color: '#ffffff' },

  tableCard: {
    borderWidth: 1,
    borderColor: '#d8d8d8',
    borderRadius: 14,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
  },
  tableHeaderRow: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#dfdfdf',
    paddingHorizontal: 12,
    gap: 10,
  },
  tableHeaderText: { fontSize: 16, fontWeight: '700', color: '#292929' },
  tableRow: {
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ececec',
    paddingHorizontal: 12,
    gap: 10,
  },
  tableRowLast: { borderBottomWidth: 0 },
  colName: { flex: 3.1 },
  colUnit: { flex: 1.5 },
  colImages: { flex: 2.4 },
  colStatus: { flex: 1.5 },
  colActions: { flex: 1.2 },
  tableCellPrimary: { fontSize: 16, fontWeight: '700', color: '#181818' },
  tableCellText: { fontSize: 16, color: '#606060' },
  tableCellMuted: { fontSize: 16, color: '#7a7a7a' },
  statusCellWrap: { alignItems: 'flex-start' },
  actionsCellWrap: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionIconBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  mobileCardList: { gap: 12 },
  mobileCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e3e3e3',
    backgroundColor: '#ffffff',
    padding: 12,
  },
  mobileCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  mobileCardHeaderTextWrap: { flex: 1, marginRight: 10 },
  mobileCardTitle: { fontSize: 16, fontWeight: '700', color: '#171717' },
  mobileCardSubTitle: { marginTop: 2, fontSize: 13, color: '#6a6a6a' },
  mobileMetaRow: { marginTop: 6, flexDirection: 'row', alignItems: 'center' },
  mobileMetaText: { fontSize: 13, color: '#636363' },
  mobileCardActions: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#efefef',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },

  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 13,
    paddingVertical: 5,
    alignSelf: 'flex-start',
  },
  statusBadgeActive: { backgroundColor: '#2453e6' },
  statusBadgeInactive: { backgroundColor: '#fdebec' },
  statusBadgeText: { fontSize: 13, fontWeight: '700' },
  statusBadgeTextActive: { color: '#ffffff' },
  statusBadgeTextInactive: { color: '#f04438' },

  stateBox: { padding: 40, alignItems: 'center', justifyContent: 'center' },
  stateText: { marginTop: 12, fontSize: 14, color: '#6d6d6d', textAlign: 'center' },
  retryBtn: {
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#2453e6',
  },
  retryBtnText: { fontSize: 14, fontWeight: '600', color: '#ffffff' },

  paginationSummary: { marginTop: 18, fontSize: 14, color: '#6d6d6d' },
  paginationRow: {
    marginTop: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  paginationButton: {
    minWidth: 90,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#dfdfdf',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  paginationButtonDisabled: { backgroundColor: '#fbfbfb' },
  paginationButtonText: { fontSize: 14, fontWeight: '600', color: '#111111' },
  paginationButtonTextDisabled: { color: '#a6a6a6' },
  pageIndicator: {
    minWidth: 130,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dfdfdf',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  pageIndicatorText: { fontSize: 14, fontWeight: '600', color: '#151515' },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },

  formModalCard: {
    width: '100%',
    maxWidth: 1050,
    maxHeight: '92%',
    minHeight: 360,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#d9d9d9',
    overflow: 'hidden',
  },
  formModalCardCompact: {
    maxWidth: 680,
    height: '86%',
  },
  formModalHeader: {
    minHeight: 72,
    borderBottomWidth: 1,
    borderBottomColor: '#ececec',
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  formModalTitle: { fontSize: 34, fontWeight: '700', color: '#141414', lineHeight: 38 },
  formModalTitleCompact: { fontSize: 28, lineHeight: 32 },
  formModalBody: { flex: 1 },
  formModalBodyContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 24,
  },
  formGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 8,
    columnGap: 14,
  },
  formCol: { width: '48.5%' },
  formColCompact: { width: '100%' },
  formLabel: { marginTop: 6, marginBottom: 8, fontSize: 16, fontWeight: '700', color: '#1f1f1f' },
  formInput: {
    minHeight: 54,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#d5d5d5',
    paddingHorizontal: 14,
    fontSize: 16,
    color: '#111111',
    backgroundColor: '#ffffff',
  },
  formTextArea: {
    minHeight: 108,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#d5d5d5',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111111',
    backgroundColor: '#ffffff',
  },
  chooseImageBtn: {
    minHeight: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#cfcfcf',
    backgroundColor: '#fafafa',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  chooseImageBtnDisabled: { backgroundColor: '#f0f0f0', borderColor: '#d9d9d9' },
  chooseImageBtnText: { fontSize: 15, fontWeight: '600', color: '#2453e6' },
  noImageText: { marginTop: 8, fontSize: 14, color: '#6f6f6f' },
  thumbnailList: { marginTop: 10, flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  thumbnailWrap: { position: 'relative' },
  thumbnailImage: { width: 74, height: 74, borderRadius: 10, backgroundColor: '#f2f2f2' },
  thumbnailRemoveBtn: { position: 'absolute', top: -8, right: -8 },
  switchRow: { marginTop: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
  switchText: { fontSize: 17, fontWeight: '600', color: '#1a1a1a' },

  formModalFooter: {
    minHeight: 74,
    borderTopWidth: 1,
    borderTopColor: '#ececec',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  primaryBtn: {
    minHeight: 44,
    borderRadius: 12,
    backgroundColor: '#2453e6',
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: { fontSize: 16, fontWeight: '700', color: '#ffffff' },
  secondaryBtn: {
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d0d5dd',
    backgroundColor: '#ffffff',
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: { fontSize: 16, fontWeight: '600', color: '#191919' },

  deleteModalCard: {
    width: '100%',
    maxWidth: 760,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#d7d7d7',
    overflow: 'hidden',
  },
  deleteModalCardCompact: { maxWidth: 560 },
  deleteModalHeader: {
    minHeight: 80,
    borderBottomWidth: 1,
    borderBottomColor: '#ececec',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  deleteTitle: { fontSize: 42, fontWeight: '700', color: '#161616', lineHeight: 46 },
  deleteTitleCompact: { fontSize: 32, lineHeight: 36 },
  deleteModalBody: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 14 },
  deleteMessage: { fontSize: 24, lineHeight: 33, color: '#666666' },
  deleteMessageCompact: { fontSize: 19, lineHeight: 27 },
  deleteActions: {
    paddingHorizontal: 24,
    paddingVertical: 18,
    borderTopWidth: 1,
    borderTopColor: '#ececec',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  deleteBtn: {
    minHeight: 44,
    borderRadius: 12,
    backgroundColor: '#fdeced',
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtnText: { fontSize: 16, fontWeight: '700', color: '#f04438' },
});
