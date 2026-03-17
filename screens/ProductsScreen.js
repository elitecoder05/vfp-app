import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, RefreshControl, SafeAreaView, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { createProduct, deleteProduct, generateUploadUrl, getProducts, updateProduct } from '../api/api-methods';
import { BORDER_RADIUS, COLORS, SPACING } from '../constants/theme';

const PAGE_SIZE = 10;

const EMPTY_FORM = {
  name: '',
  sku: '',
  unit: '',
  category: '',
  price: '0',
  weight: '0',
  description: '',
  dimensionLength: '',
  dimensionWidth: '',
  dimensionHeight: '',
  dimensionUnit: '',
  imageUrls: [],
  active: true,
};

function ProductModalForm({ title, form, setForm, primaryLabel, onPrimaryPress, onClose, showActiveToggle, submitting }) {
  const [imageUploading, setImageUploading] = useState(false);

  const uploadToS3WithRetry = async (uploadUrl, fileUri, mimeType, maxRetries = 3) => {
    console.log('========================================');
    console.log('[S3 UPLOAD] Starting S3 upload process');
    console.log('[S3 UPLOAD] Upload URL:', uploadUrl);
    console.log('[S3 UPLOAD] File URI:', fileUri);
    console.log('[S3 UPLOAD] MIME Type:', mimeType);
    console.log('[S3 UPLOAD] Max retries:', maxRetries);
    console.log('========================================');
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[S3 UPLOAD] -------- Attempt ${attempt}/${maxRetries} --------`);
        console.log(`[S3 UPLOAD] Timestamp:`, new Date().toISOString());

        const fileInfo = await FileSystem.getInfoAsync(fileUri);
        console.log('[S3 UPLOAD] File exists:', fileInfo.exists);
        console.log('[S3 UPLOAD] File size:', fileInfo.size);

        if (!fileInfo.exists) {
          throw new TypeError('Could not read the selected image file');
        }

        const uploadResult = await FileSystem.uploadAsync(uploadUrl, fileUri, {
          headers: {
            'Content-Type': mimeType,
          },
          httpMethod: 'PUT',
          uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
        });

        const status = uploadResult.status;

        console.log(`[S3 UPLOAD] Response status:`, status);
        console.log('[S3 UPLOAD] Response headers:', uploadResult.headers);
        console.log('[S3 UPLOAD] Response body:', uploadResult.body);

        if (status >= 200 && status < 300) {
          console.log('========================================');
          console.log(`[S3 UPLOAD] ✅ SUCCESS on attempt ${attempt}`);
          console.log(`[S3 UPLOAD] Upload completed at:`, new Date().toISOString());
          console.log('========================================');
          return true;
        }

        console.error('========================================');
        console.error(`[S3 UPLOAD] ❌ FAILED on attempt ${attempt}`);
        console.error(`[S3 UPLOAD] Status code:`, status);
        console.error('========================================');

        if (attempt === maxRetries) {
          throw new Error(`S3 upload failed after ${maxRetries} attempts: ${status}`);
        }

        // Exponential backoff: wait 1s, 2s, 4s...
        const delay = Math.pow(2, attempt - 1) * 1000;
        console.log(`[S3 UPLOAD] Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } catch (error) {
        console.error('========================================');
        console.error(`[S3 UPLOAD] ❌ ERROR on attempt ${attempt}`);
        console.error(`[S3 UPLOAD] Error name:`, error.name);
        console.error(`[S3 UPLOAD] Error message:`, error.message);
        console.error(`[S3 UPLOAD] Error stack:`, error.stack);
        console.error('========================================');
        
        if (attempt === maxRetries) {
          throw error;
        }
        
        const delay = Math.pow(2, attempt - 1) * 1000;
        console.log(`[S3 UPLOAD] Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  };

  const pickImage = async () => {
    console.log('========================================');
    console.log('[IMAGE PICKER] Starting image picker process');
    console.log('[IMAGE PICKER] Timestamp:', new Date().toISOString());
    console.log('========================================');
    
    try {
      console.log('[IMAGE PICKER] Step 1: Requesting media library permissions...');
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      console.log('[IMAGE PICKER] Permission status:', status);
      
      if (status !== 'granted') {
        console.log('[IMAGE PICKER] ❌ Permission denied by user');
        Alert.alert('Permission Denied', 'Please allow access to your photo library to upload images.');
        return;
      }
      console.log('[IMAGE PICKER] ✅ Permission granted');
      
      console.log('[IMAGE PICKER] Step 2: Launching image library...');
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: false,
        quality: 0.85,
      });
      
      console.log('[IMAGE PICKER] Image picker result:');
      console.log('[IMAGE PICKER] - Canceled:', result.canceled);
      console.log('[IMAGE PICKER] - Assets count:', result.assets?.length || 0);
      
      if (result.canceled) {
        console.log('[IMAGE PICKER] ⚠️ User canceled image selection');
        return;
      }
      
      if (!result.assets?.length) {
        console.log('[IMAGE PICKER] ⚠️ No assets returned from picker');
        return;
      }
      
      const asset = result.assets[0];
      console.log('[IMAGE PICKER] Selected asset details:');
      console.log('[IMAGE PICKER] - URI:', asset.uri);
      console.log('[IMAGE PICKER] - Width:', asset.width);
      console.log('[IMAGE PICKER] - Height:', asset.height);
      console.log('[IMAGE PICKER] - File name:', asset.fileName);
      console.log('[IMAGE PICKER] - File size:', asset.fileSize);
      console.log('[IMAGE PICKER] - MIME type:', asset.mimeType);
      console.log('[IMAGE PICKER] - Type:', asset.type);
      
      const uri = asset.uri;
      const fileName = asset.fileName || uri.split('/').pop() || `image_${Date.now()}.jpg`;
      const mimeType = asset.mimeType || 'image/jpeg';
      
      console.log('========================================');
      console.log('[IMAGE UPLOAD] Starting upload process');
      console.log('[IMAGE UPLOAD] File name:', fileName);
      console.log('[IMAGE UPLOAD] MIME type:', mimeType);
      console.log('[IMAGE UPLOAD] URI:', uri);
      console.log('========================================');
      
      setImageUploading(true);
      
      // Step 1: Get presigned URL from backend
      console.log('[IMAGE UPLOAD] Step 1: Requesting presigned URL from backend...');
      console.log('[IMAGE UPLOAD] Calling generateUploadUrl with:');
      console.log('[IMAGE UPLOAD] - fileName:', fileName);
      console.log('[IMAGE UPLOAD] - fileType:', mimeType);
      console.log('[IMAGE UPLOAD] - folderName: products');
      
      const uploadUrlResponse = await generateUploadUrl(fileName, mimeType, 'products');
      
      console.log('[IMAGE UPLOAD] Backend response received:');
      console.log('[IMAGE UPLOAD] - Response type:', typeof uploadUrlResponse);
      console.log('[IMAGE UPLOAD] - Response:', JSON.stringify(uploadUrlResponse, null, 2));
      
      // Validate the response
      if (!uploadUrlResponse) {
        console.error('[IMAGE UPLOAD] ❌ Response is null or undefined');
        throw new Error('Invalid upload URL response from server');
      }
      
      if (!uploadUrlResponse.uploadUrl) {
        console.error('[IMAGE UPLOAD] ❌ Missing uploadUrl in response');
        console.error('[IMAGE UPLOAD] Available keys:', Object.keys(uploadUrlResponse));
        throw new Error('Invalid upload URL response from server');
      }
      
      if (!uploadUrlResponse.fileUrl) {
        console.error('[IMAGE UPLOAD] ❌ Missing fileUrl in response');
        console.error('[IMAGE UPLOAD] Available keys:', Object.keys(uploadUrlResponse));
        throw new Error('Invalid upload URL response from server');
      }
      
      const { uploadUrl, fileUrl } = uploadUrlResponse;
      console.log('========================================');
      console.log('[IMAGE UPLOAD] ✅ Got presigned URL successfully');
      console.log('[IMAGE UPLOAD] Upload URL:', uploadUrl);
      console.log('[IMAGE UPLOAD] File URL:', fileUrl);
      console.log('[IMAGE UPLOAD] File key:', uploadUrlResponse.fileKey);
      console.log('[IMAGE UPLOAD] Expires in:', uploadUrlResponse.expiresIn, 'seconds');
      console.log('========================================');
      
      // Step 2: Upload file directly to S3 from local URI
      console.log('[IMAGE UPLOAD] Step 2: Uploading local file URI to S3...');
      await uploadToS3WithRetry(uploadUrl, uri, mimeType);
      
      // Step 3: Add the file URL to the form
      console.log('[IMAGE UPLOAD] Step 3: Adding file URL to form...');
      console.log('[IMAGE UPLOAD] Current imageUrls:', form.imageUrls);
      console.log('[IMAGE UPLOAD] Adding fileUrl:', fileUrl);

      setForm((currentForm) => ({
        ...currentForm,
        imageUrls: [...currentForm.imageUrls, fileUrl],
      }));
      
      console.log('========================================');
      console.log('[IMAGE UPLOAD] ✅ UPLOAD COMPLETE SUCCESSFULLY');
      console.log('[IMAGE UPLOAD] File URL added to form');
      console.log('[IMAGE UPLOAD] New imageUrls:', [...form.imageUrls, fileUrl]);
      console.log('========================================');
      
      Alert.alert('Success', 'Image uploaded successfully!');
      
    } catch (err) {
      console.error('========================================');
      console.error('[IMAGE UPLOAD] ❌ ERROR OCCURRED');
      console.error('[IMAGE UPLOAD] Error name:', err.name);
      console.error('[IMAGE UPLOAD] Error message:', err.message);
      console.error('[IMAGE UPLOAD] Error stack:', err.stack);
      console.error('========================================');
      
      let errorMessage = 'Could not upload the image. Please try again.';
      if (err.message.includes('Invalid upload URL')) {
        errorMessage = 'Server error: Could not generate upload URL. Please check your connection and try again.';
      } else if (err.message.includes('Failed to read image file')) {
        errorMessage = 'Could not read the selected image. Please try selecting a different image.';
      } else if (err.message.includes('S3 upload failed') || err.message.includes('Network request failed during S3 upload')) {
        errorMessage = 'Upload to cloud storage failed. Please check your internet connection and try again.';
      }
      
      Alert.alert('Upload Failed', errorMessage);
    } finally {
      console.log('[IMAGE UPLOAD] Setting imageUploading to false');
      setImageUploading(false);
    }
  };

  return (
    <View style={styles.modalCard}>
      <View style={styles.modalHeader}>
        <Text style={styles.modalTitle}>{title}</Text>
        <TouchableOpacity onPress={onClose} style={styles.modalCloseBtn} disabled={imageUploading || submitting}>
          <MaterialCommunityIcons name="close" size={20} color="#222" />
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.modalBody} contentContainerStyle={styles.modalBodyContent}>
        <View style={styles.formGrid}>
          <View style={styles.formCol}>
            <Text style={styles.inputLabel}>Name *</Text>
            <TextInput value={form.name} onChangeText={(v) => setForm({ ...form, name: v })} style={styles.inputBox} placeholder="Product name" placeholderTextColor="#999" />
          </View>
          <View style={styles.formCol}>
            <Text style={styles.inputLabel}>SKU *</Text>
            <TextInput value={form.sku} onChangeText={(v) => setForm({ ...form, sku: v })} style={styles.inputBox} placeholder="SKU" placeholderTextColor="#999" />
          </View>
          <View style={styles.formCol}>
            <Text style={styles.inputLabel}>Unit *</Text>
            <TextInput value={form.unit} onChangeText={(v) => setForm({ ...form, unit: v })} style={styles.inputBox} placeholder="e.g., pieces, kg" placeholderTextColor="#999" />
          </View>
          <View style={styles.formCol}>
            <Text style={styles.inputLabel}>Category *</Text>
            <TextInput value={form.category} onChangeText={(v) => setForm({ ...form, category: v })} style={styles.inputBox} placeholder="Category" placeholderTextColor="#999" />
          </View>
          <View style={styles.formCol}>
            <Text style={styles.inputLabel}>Price *</Text>
            <TextInput value={form.price} onChangeText={(v) => setForm({ ...form, price: v })} style={styles.inputBox} keyboardType="decimal-pad" placeholder="0" placeholderTextColor="#999" />
          </View>
          <View style={styles.formCol}>
            <Text style={styles.inputLabel}>Weight</Text>
            <TextInput value={form.weight} onChangeText={(v) => setForm({ ...form, weight: v })} style={styles.inputBox} keyboardType="decimal-pad" placeholder="0" placeholderTextColor="#999" />
          </View>
        </View>

        <Text style={styles.inputLabel}>Description</Text>
        <TextInput value={form.description} onChangeText={(v) => setForm({ ...form, description: v })} style={styles.textArea} multiline placeholder="Product description" placeholderTextColor="#999" />

        <Text style={styles.inputLabel}>Dimensions</Text>
        <View style={styles.dimensionRow}>
          <TextInput value={form.dimensionLength} onChangeText={(v) => setForm({ ...form, dimensionLength: v })} style={styles.dimensionInput} placeholder="Length" placeholderTextColor="#9a9a9a" keyboardType="decimal-pad" />
          <TextInput value={form.dimensionWidth} onChangeText={(v) => setForm({ ...form, dimensionWidth: v })} style={styles.dimensionInput} placeholder="Width" placeholderTextColor="#9a9a9a" keyboardType="decimal-pad" />
          <TextInput value={form.dimensionHeight} onChangeText={(v) => setForm({ ...form, dimensionHeight: v })} style={styles.dimensionInput} placeholder="Height" placeholderTextColor="#9a9a9a" keyboardType="decimal-pad" />
          <TextInput value={form.dimensionUnit} onChangeText={(v) => setForm({ ...form, dimensionUnit: v })} style={styles.dimensionInput} placeholder="Unit" placeholderTextColor="#9a9a9a" />
        </View>

        <Text style={styles.inputLabel}>Images</Text>
        <TouchableOpacity
          style={[styles.pickImageBtn, imageUploading && styles.pickImageBtnDisabled]}
          onPress={pickImage}
          disabled={imageUploading}
          activeOpacity={0.8}
        >
          {imageUploading ? (
            <>
              <ActivityIndicator size="small" color="#2453e6" />
              <Text style={styles.pickImageBtnText}>Uploading...</Text>
            </>
          ) : (
            <>
              <MaterialCommunityIcons name="image-plus" size={20} color="#2453e6" />
              <Text style={styles.pickImageBtnText}>Pick from Gallery</Text>
            </>
          )}
        </TouchableOpacity>

        {form.imageUrls.length > 0 && (
          <View style={styles.imageThumbnailRow}>
            {form.imageUrls.map((url, idx) => (
              <View key={`${url}-${idx}`} style={styles.imageThumbnailWrap}>
                <Image source={{ uri: url }} style={styles.imageThumbnail} />
                <TouchableOpacity
                  style={styles.imageThumbnailRemove}
                  onPress={() => setForm((currentForm) => ({
                    ...currentForm,
                    imageUrls: currentForm.imageUrls.filter((_, i) => i !== idx),
                  }))}
                >
                  <MaterialCommunityIcons name="close-circle" size={20} color="#e53935" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {showActiveToggle && (
          <View style={styles.activeRow}>
            <Switch value={form.active} onValueChange={(v) => setForm({ ...form, active: v })} trackColor={{ false: '#ccc', true: '#8db2ff' }} thumbColor={form.active ? '#2453e6' : '#f4f3f4'} />
            <Text style={styles.activeText}>Active</Text>
          </View>
        )}
      </ScrollView>
      <View style={styles.modalFooter}>
        <TouchableOpacity style={[styles.primaryModalBtn, (submitting || imageUploading) && styles.primaryModalBtnDisabled]} onPress={onPrimaryPress} disabled={submitting || imageUploading}>
          {submitting ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.primaryModalBtnText}>{imageUploading ? 'Uploading Image...' : primaryLabel}</Text>}
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelModalBtn} onPress={onClose} disabled={imageUploading || submitting}>
          <Text style={styles.cancelModalBtnText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function ProductCard({ product, onEdit, onDelete }) {
  const formatPrice = (value) => `₹${Number(value || 0).toFixed(2)}`;
  
  return (
    <View style={styles.productCard}>
      <View style={styles.cardRow1}>
        <View style={styles.productInfo}>
          {product.images && product.images.length > 0 ? (
            <Image source={{ uri: product.images[0] }} style={styles.productImage} />
          ) : (
            <View style={styles.productImagePlaceholder}>
              <MaterialCommunityIcons name="package-variant" size={24} color="#9e9e9e" />
            </View>
          )}
          <View style={styles.productDetails}>
            <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
            <Text style={styles.productSku}>SKU: {product.sku}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, product.isActive ? styles.badgeActive : styles.badgeInactive]}>
          <Text style={[styles.statusBadgeText, product.isActive ? styles.badgeTextActive : styles.badgeTextInactive]}>
            {product.isActive ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>
      
      <View style={styles.cardMetaRow}>
        <MaterialCommunityIcons name="tag-outline" size={13} color="#888" />
        <Text style={styles.cardMeta}> {product.category || 'N/A'}</Text>
        <Text style={styles.dot}>  ·  </Text>
        <MaterialCommunityIcons name="currency-inr" size={13} color="#888" />
        <Text style={styles.cardMeta}> {formatPrice(product.price)}</Text>
      </View>
      
      <View style={styles.cardMetaRow}>
        <MaterialCommunityIcons name="cube-outline" size={13} color="#888" />
        <Text style={styles.cardMeta}> {product.unit || 'N/A'}</Text>
        <Text style={styles.dot}>  ·  </Text>
        <MaterialCommunityIcons name="weight" size={13} color="#888" />
        <Text style={styles.cardMeta}> {product.weight || 0} kg</Text>
      </View>
      
      {product.description ? (
        <View style={styles.cardMetaRow}>
          <MaterialCommunityIcons name="text" size={13} color="#888" />
          <Text style={styles.cardMeta} numberOfLines={1}> {product.description}</Text>
        </View>
      ) : null}
      
      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7} onPress={() => onEdit(product)}>
          <MaterialCommunityIcons name="pencil-outline" size={17} color="#555" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7} onPress={() => onDelete(product)}>
          <MaterialCommunityIcons name="trash-can-outline" size={17} color="#e53935" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function ProductsScreen() {
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [addForm, setAddForm] = useState(EMPTY_FORM);
  const [editForm, setEditForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  const fetchProducts = async (page = currentPage) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getProducts(page, PAGE_SIZE);
      setProducts(response.data || []);
      setTotalPages(response.pagination?.totalPages || 1);
      setTotalItems(response.pagination?.totalItems || 0);
    } catch (err) {
      setError('Failed to fetch products');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchProducts(currentPage);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProducts(currentPage);
  }, [currentPage]);

  const openEdit = (product) => {
    setSelectedProduct(product);
    setEditForm({
      name: product.name || '',
      sku: product.sku || '',
      unit: product.unit || '',
      category: product.category || '',
      price: String(product.price ?? 0),
      weight: String(product.weight ?? 0),
      description: product.description || '',
      dimensionLength: product.dimensions?.length ? String(product.dimensions.length) : '',
      dimensionWidth: product.dimensions?.width ? String(product.dimensions.width) : '',
      dimensionHeight: product.dimensions?.height ? String(product.dimensions.height) : '',
      dimensionUnit: product.dimensions?.unit || '',
      imageUrls: product.images || [],
      active: product.isActive !== false,
    });
    setShowEditModal(true);
  };

  const submitCreate = async () => {
    console.log('========================================');
    console.log('[CREATE PRODUCT] Starting product creation');
    console.log('[CREATE PRODUCT] Timestamp:', new Date().toISOString());
    console.log('========================================');
    
    if (!addForm.name.trim()) {
      console.log('[CREATE PRODUCT] ❌ Validation failed: Product name is required');
      Alert.alert('Missing Data', 'Product name is required');
      return;
    }
    if (!addForm.sku.trim()) {
      console.log('[CREATE PRODUCT] ❌ Validation failed: SKU is required');
      Alert.alert('Missing Data', 'SKU is required');
      return;
    }

    console.log('[CREATE PRODUCT] Form data:');
    console.log('[CREATE PRODUCT] - Name:', addForm.name.trim());
    console.log('[CREATE PRODUCT] - SKU:', addForm.sku.trim());
    console.log('[CREATE PRODUCT] - Unit:', addForm.unit.trim());
    console.log('[CREATE PRODUCT] - Category:', addForm.category.trim());
    console.log('[CREATE PRODUCT] - Price:', addForm.price);
    console.log('[CREATE PRODUCT] - Weight:', addForm.weight);
    console.log('[CREATE PRODUCT] - Description:', addForm.description.trim());
    console.log('[CREATE PRODUCT] - Dimensions:', {
      length: addForm.dimensionLength,
      width: addForm.dimensionWidth,
      height: addForm.dimensionHeight,
      unit: addForm.dimensionUnit
    });
    console.log('[CREATE PRODUCT] - Image URLs:', addForm.imageUrls);
    console.log('[CREATE PRODUCT] - Image count:', addForm.imageUrls.length);
    console.log('[CREATE PRODUCT] - Active:', addForm.active);

    const payload = {
      name: addForm.name.trim(),
      sku: addForm.sku.trim(),
      unit: addForm.unit.trim(),
      description: addForm.description.trim(),
      category: addForm.category.trim(),
      price: Number(addForm.price) || 0,
      weight: Number(addForm.weight) || 0,
      dimensions: {
        length: Number(addForm.dimensionLength) || 0,
        width: Number(addForm.dimensionWidth) || 0,
        height: Number(addForm.dimensionHeight) || 0,
        unit: addForm.dimensionUnit.trim() || 'cm',
      },
      images: addForm.imageUrls,
      isActive: addForm.active,
    };

    console.log('[CREATE PRODUCT] Payload to send:');
    console.log(JSON.stringify(payload, null, 2));

    try {
      setSubmitting(true);
      console.log('[CREATE PRODUCT] Calling createProduct API...');
      
      const response = await createProduct(payload);
      
      console.log('========================================');
      console.log('[CREATE PRODUCT] ✅ Product created successfully');
      console.log('[CREATE PRODUCT] Response:', JSON.stringify(response, null, 2));
      console.log('========================================');
      
      setAddForm(EMPTY_FORM);
      setShowAddModal(false);
      fetchProducts(1);
      setCurrentPage(1);
      Alert.alert('Success', 'Product created successfully');
    } catch (err) {
      console.error('========================================');
      console.error('[CREATE PRODUCT] ❌ Error creating product');
      console.error('[CREATE PRODUCT] Error name:', err.name);
      console.error('[CREATE PRODUCT] Error message:', err.message);
      console.error('[CREATE PRODUCT] Error response:', err.response?.data);
      console.error('[CREATE PRODUCT] Error status:', err.response?.status);
      console.error('========================================');
      
      Alert.alert('Create Failed', err.response?.data?.message || 'Unable to create product');
    } finally {
      console.log('[CREATE PRODUCT] Setting submitting to false');
      setSubmitting(false);
    }
  };

  const submitEdit = async () => {
    console.log('========================================');
    console.log('[EDIT PRODUCT] Starting product update');
    console.log('[EDIT PRODUCT] Timestamp:', new Date().toISOString());
    console.log('[EDIT PRODUCT] Product ID:', selectedProduct?._id);
    console.log('========================================');
    
    if (!selectedProduct?._id) {
      console.log('[EDIT PRODUCT] ❌ No product selected');
      return;
    }
    if (!editForm.name.trim()) {
      console.log('[EDIT PRODUCT] ❌ Validation failed: Product name is required');
      Alert.alert('Missing Data', 'Product name is required');
      return;
    }
    if (!editForm.sku.trim()) {
      console.log('[EDIT PRODUCT] ❌ Validation failed: SKU is required');
      Alert.alert('Missing Data', 'SKU is required');
      return;
    }

    console.log('[EDIT PRODUCT] Form data:');
    console.log('[EDIT PRODUCT] - Name:', editForm.name.trim());
    console.log('[EDIT PRODUCT] - SKU:', editForm.sku.trim());
    console.log('[EDIT PRODUCT] - Unit:', editForm.unit.trim());
    console.log('[EDIT PRODUCT] - Category:', editForm.category.trim());
    console.log('[EDIT PRODUCT] - Price:', editForm.price);
    console.log('[EDIT PRODUCT] - Weight:', editForm.weight);
    console.log('[EDIT PRODUCT] - Description:', editForm.description.trim());
    console.log('[EDIT PRODUCT] - Dimensions:', {
      length: editForm.dimensionLength,
      width: editForm.dimensionWidth,
      height: editForm.dimensionHeight,
      unit: editForm.dimensionUnit
    });
    console.log('[EDIT PRODUCT] - Image URLs:', editForm.imageUrls);
    console.log('[EDIT PRODUCT] - Image count:', editForm.imageUrls.length);
    console.log('[EDIT PRODUCT] - Active:', editForm.active);

    const payload = {
      name: editForm.name.trim(),
      sku: editForm.sku.trim(),
      unit: editForm.unit.trim(),
      description: editForm.description.trim(),
      category: editForm.category.trim(),
      price: Number(editForm.price) || 0,
      weight: Number(editForm.weight) || 0,
      dimensions: {
        length: Number(editForm.dimensionLength) || 0,
        width: Number(editForm.dimensionWidth) || 0,
        height: Number(editForm.dimensionHeight) || 0,
        unit: editForm.dimensionUnit.trim() || 'cm',
      },
      images: editForm.imageUrls,
      isActive: editForm.active,
    };

    console.log('[EDIT PRODUCT] Payload to send:');
    console.log(JSON.stringify(payload, null, 2));

    try {
      setSubmitting(true);
      console.log('[EDIT PRODUCT] Calling updateProduct API...');
      
      const response = await updateProduct(selectedProduct._id, payload);
      
      console.log('========================================');
      console.log('[EDIT PRODUCT] ✅ Product updated successfully');
      console.log('[EDIT PRODUCT] Response:', JSON.stringify(response, null, 2));
      console.log('========================================');
      
      setShowEditModal(false);
      setSelectedProduct(null);
      fetchProducts(currentPage);
      Alert.alert('Success', 'Product updated successfully');
    } catch (err) {
      console.error('========================================');
      console.error('[EDIT PRODUCT] ❌ Error updating product');
      console.error('[EDIT PRODUCT] Error name:', err.name);
      console.error('[EDIT PRODUCT] Error message:', err.message);
      console.error('[EDIT PRODUCT] Error response:', err.response?.data);
      console.error('[EDIT PRODUCT] Error status:', err.response?.status);
      console.error('========================================');
      
      Alert.alert('Update Failed', err.response?.data?.message || 'Unable to update product');
    } finally {
      console.log('[EDIT PRODUCT] Setting submitting to false');
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!selectedProduct?._id) return;
    try {
      setSubmitting(true);
      await deleteProduct(selectedProduct._id);
      setShowDeleteModal(false);
      setSelectedProduct(null);
      fetchProducts(currentPage);
      Alert.alert('Success', 'Product deleted successfully');
    } catch (err) {
      Alert.alert('Delete Failed', err.response?.data?.message || 'Unable to delete product');
    } finally {
      setSubmitting(false);
    }
  };

  const showingStart = products.length ? (currentPage - 1) * PAGE_SIZE + 1 : 0;
  const showingEnd = products.length ? showingStart + products.length - 1 : 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <MaterialCommunityIcons name="package-variant" size={20} color={COLORS.textPrimary} style={styles.headerIcon} />
          <Text style={styles.headerTitle}>Product Management</Text>
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
              <Text style={styles.screenTitle}>Products</Text>
              <Text style={styles.screenSubtitle}>Manage products, their details, and inventory.</Text>
            </View>
          </View>

          <View style={styles.toolbar}>
            <View style={styles.filterButton}>
              <Text style={styles.filterButtonText}>All Products</Text>
              <MaterialCommunityIcons name="chevron-down" size={16} color={COLORS.textPrimary} />
            </View>
            <TouchableOpacity style={styles.createButton} activeOpacity={0.85} onPress={() => setShowAddModal(true)}>
              <MaterialCommunityIcons name="plus" size={17} color={COLORS.white} />
              <Text style={styles.createButtonText}>Add Product</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.stateBox}>
              <ActivityIndicator size="large" color="#2453e6" />
              <Text style={styles.stateText}>Loading products...</Text>
            </View>
          ) : error ? (
            <View style={styles.stateBox}>
              <MaterialCommunityIcons name="alert-circle-outline" size={40} color="#e53935" />
              <Text style={styles.stateText}>{error}</Text>
              <TouchableOpacity style={styles.retryBtn} onPress={() => fetchProducts(currentPage)}>
                <Text style={styles.retryBtnText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : products.length === 0 ? (
            <View style={styles.stateBox}>
              <MaterialCommunityIcons name="package-variant" size={40} color="#9e9e9e" />
              <Text style={styles.stateText}>No products found</Text>
            </View>
          ) : (
            <View style={styles.cardList}>
              {products.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onEdit={openEdit}
                  onDelete={(product) => { setSelectedProduct(product); setShowDeleteModal(true); }}
                />
              ))}
            </View>
          )}

          <Text style={styles.paginationSummary}>
            Showing {showingStart} to {showingEnd} of {totalItems} products
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

      <Modal visible={showAddModal} transparent animationType="fade" onRequestClose={() => setShowAddModal(false)}>
        <View style={styles.modalBackdrop}>
          <ProductModalForm
            title="Add New Product"
            form={addForm}
            setForm={setAddForm}
            primaryLabel="Create Product"
            onPrimaryPress={submitCreate}
            onClose={() => setShowAddModal(false)}
            showActiveToggle={true}
            submitting={submitting}
          />
        </View>
      </Modal>

      <Modal visible={showEditModal} transparent animationType="fade" onRequestClose={() => setShowEditModal(false)}>
        <View style={styles.modalBackdrop}>
          <ProductModalForm
            title="Edit Product"
            form={editForm}
            setForm={setEditForm}
            primaryLabel="Update Product"
            onPrimaryPress={submitEdit}
            onClose={() => setShowEditModal(false)}
            showActiveToggle={true}
            submitting={submitting}
          />
        </View>
      </Modal>

      <Modal visible={showDeleteModal} transparent animationType="fade" onRequestClose={() => setShowDeleteModal(false)}>
        <View style={styles.modalBackdropCenter}>
          <View style={styles.confirmCard}>
            <Text style={styles.confirmTitle}>Confirm Delete</Text>
            <Text style={styles.confirmMessage}>
              Are you sure you want to delete the product "{selectedProduct?.name}"? This action cannot be undone.
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
  productCard: { backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.lg, borderWidth: 1, borderColor: COLORS.gray200, padding: 14 },
  cardRow1: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  productInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  productImage: { width: 52, height: 52, borderRadius: 8, marginRight: 12 },
  productImagePlaceholder: { width: 52, height: 52, borderRadius: 8, backgroundColor: '#f6f6f6', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  productDetails: { flex: 1 },
  productName: { fontSize: 16, fontWeight: '700', color: '#151515' },
  productSku: { fontSize: 13, color: '#676767', marginTop: 2 },
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
  dimensionRow: { flexDirection: 'row', gap: 10 },
  dimensionInput: { flex: 1, minHeight: 44, borderRadius: 12, borderWidth: 1, borderColor: '#d6d6d6', backgroundColor: '#fff', paddingHorizontal: 12, fontSize: 16, color: '#111' },
  pickImageBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 46, borderRadius: 12, borderWidth: 1.5, borderColor: '#2453e6', borderStyle: 'dashed', backgroundColor: '#f0f4ff', marginBottom: 4 },
  pickImageBtnDisabled: { borderColor: '#aaa', backgroundColor: '#f9f9f9' },
  pickImageBtnText: { fontSize: 15, fontWeight: '600', color: '#2453e6' },
  imageThumbnailRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 10 },
  imageThumbnailWrap: { position: 'relative' },
  imageThumbnail: { width: 72, height: 72, borderRadius: 10, backgroundColor: '#eee' },
  imageThumbnailRemove: { position: 'absolute', top: -8, right: -8 },
  activeRow: { marginTop: 10, flexDirection: 'row', alignItems: 'center', gap: 10 },
  activeText: { fontSize: 18, fontWeight: '500', color: '#111' },
  modalFooter: { borderTopWidth: 1, borderTopColor: '#ececec', padding: 12, flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  primaryModalBtn: { minHeight: 40, borderRadius: 12, backgroundColor: '#2453e6', paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center' },
  primaryModalBtnDisabled: { backgroundColor: '#7b93e5' },
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