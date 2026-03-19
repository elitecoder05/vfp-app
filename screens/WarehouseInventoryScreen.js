import React, { useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { BORDER_RADIUS, COLORS, SPACING } from '../constants/theme';

const PAGE_SIZE = 10;
const ITEM_TYPES = ['Product', 'Raw Material'];

const INVENTORY_ROWS = [
  {
    id: '1',
    warehouseId: '6971d565cebe6ab0e3c64a5f',
    warehouse: 'Warehouse 1',
    itemType: 'Product',
    itemId: '6971d565cebe6ab0e3c64a78',
    itemName: 'Product 5',
    itemCode: 'PROD0005',
    stock: 476,
    reserved: 20,
    minStock: 11,
    maxStock: 207,
  },
  {
    id: '2',
    warehouseId: '6971d565cebe6ab0e3c64a60',
    warehouse: 'Warehouse 2',
    itemType: 'Product',
    itemId: '6971d565cebe6ab0e3c64a79',
    itemName: 'Product 11',
    itemCode: 'PROD0011',
    stock: 300,
    reserved: 49,
    minStock: 20,
    maxStock: 360,
  },
  {
    id: '3',
    warehouseId: '6971d565cebe6ab0e3c64a61',
    warehouse: 'Warehouse 2',
    itemType: 'Product',
    itemId: '6971d565cebe6ab0e3c64a80',
    itemName: 'Product 16',
    itemCode: 'PROD0016',
    stock: 490,
    reserved: 16,
    minStock: 40,
    maxStock: 550,
  },
  {
    id: '4',
    warehouseId: '6971d565cebe6ab0e3c64a62',
    warehouse: 'Warehouse 3',
    itemType: 'Product',
    itemId: '6971d565cebe6ab0e3c64a81',
    itemName: 'Product 10',
    itemCode: 'PROD0010',
    stock: 227,
    reserved: 34,
    minStock: 60,
    maxStock: 300,
  },
  {
    id: '5',
    warehouseId: '6971d565cebe6ab0e3c64a63',
    warehouse: 'Warehouse 3',
    itemType: 'Product',
    itemId: '6971d565cebe6ab0e3c64a82',
    itemName: 'Product 19',
    itemCode: 'PROD0019',
    stock: 555,
    reserved: 1,
    minStock: 25,
    maxStock: 650,
  },
  {
    id: '6',
    warehouseId: '6971d565cebe6ab0e3c64a64',
    warehouse: 'Warehouse 4',
    itemType: 'Raw Material',
    itemId: '6971d565cebe6ab0e3c64a83',
    itemName: 'Raw Material 15',
    itemCode: 'RM0004',
    stock: 784,
    reserved: 34,
    minStock: 120,
    maxStock: 920,
  },
  {
    id: '7',
    warehouseId: '6971d565cebe6ab0e3c64a65',
    warehouse: 'Warehouse 4',
    itemType: 'Raw Material',
    itemId: '6971d565cebe6ab0e3c64a84',
    itemName: 'Raw Material 19',
    itemCode: 'RM0001',
    stock: 150,
    reserved: 18,
    minStock: 120,
    maxStock: 350,
  },
  {
    id: '8',
    warehouseId: '6971d565cebe6ab0e3c64a66',
    warehouse: 'Warehouse 4',
    itemType: 'Raw Material',
    itemId: '6971d565cebe6ab0e3c64a85',
    itemName: 'Raw Material 6',
    itemCode: 'RM0003',
    stock: 616,
    reserved: 10,
    minStock: 100,
    maxStock: 800,
  },
  {
    id: '9',
    warehouseId: '6971d565cebe6ab0e3c64a67',
    warehouse: 'Warehouse 5',
    itemType: 'Product',
    itemId: '6971d565cebe6ab0e3c64a86',
    itemName: 'Product 14',
    itemCode: 'PROD0014',
    stock: 922,
    reserved: 24,
    minStock: 150,
    maxStock: 1000,
  },
  {
    id: '10',
    warehouseId: '6971d565cebe6ab0e3c64a68',
    warehouse: 'Warehouse 6',
    itemType: 'Product',
    itemId: '6971d565cebe6ab0e3c64a87',
    itemName: 'Product 18',
    itemCode: 'PROD0018',
    stock: 492,
    reserved: 37,
    minStock: 85,
    maxStock: 700,
  },
  {
    id: '11',
    warehouseId: '6971d565cebe6ab0e3c64a69',
    warehouse: 'Warehouse 1',
    itemType: 'Product',
    itemId: '6971d565cebe6ab0e3c64a88',
    itemName: 'Product 2',
    itemCode: 'PROD0002',
    stock: 328,
    reserved: 22,
    minStock: 330,
    maxStock: 500,
  },
  {
    id: '12',
    warehouseId: '6971d565cebe6ab0e3c64a6a',
    warehouse: 'Warehouse 2',
    itemType: 'Product',
    itemId: '6971d565cebe6ab0e3c64a89',
    itemName: 'Product 7',
    itemCode: 'PROD0007',
    stock: 411,
    reserved: 40,
    minStock: 100,
    maxStock: 560,
  },
  {
    id: '13',
    warehouseId: '6971d565cebe6ab0e3c64a6b',
    warehouse: 'Warehouse 3',
    itemType: 'Product',
    itemId: '6971d565cebe6ab0e3c64a8a',
    itemName: 'Product 12',
    itemCode: 'PROD0012',
    stock: 205,
    reserved: 15,
    minStock: 50,
    maxStock: 320,
  },
  {
    id: '14',
    warehouseId: '6971d565cebe6ab0e3c64a6c',
    warehouse: 'Warehouse 4',
    itemType: 'Raw Material',
    itemId: '6971d565cebe6ab0e3c64a8b',
    itemName: 'Raw Material 3',
    itemCode: 'RM0002',
    stock: 120,
    reserved: 30,
    minStock: 140,
    maxStock: 300,
  },
  {
    id: '15',
    warehouseId: '6971d565cebe6ab0e3c64a6d',
    warehouse: 'Warehouse 5',
    itemType: 'Product',
    itemId: '6971d565cebe6ab0e3c64a8c',
    itemName: 'Product 1',
    itemCode: 'PROD0001',
    stock: 700,
    reserved: 60,
    minStock: 90,
    maxStock: 900,
  },
  {
    id: '16',
    warehouseId: '6971d565cebe6ab0e3c64a6e',
    warehouse: 'Warehouse 5',
    itemType: 'Product',
    itemId: '6971d565cebe6ab0e3c64a8d',
    itemName: 'Product 8',
    itemCode: 'PROD0008',
    stock: 270,
    reserved: 20,
    minStock: 70,
    maxStock: 380,
  },
  {
    id: '17',
    warehouseId: '6971d565cebe6ab0e3c64a6f',
    warehouse: 'Warehouse 6',
    itemType: 'Product',
    itemId: '6971d565cebe6ab0e3c64a8e',
    itemName: 'Product 20',
    itemCode: 'PROD0020',
    stock: 680,
    reserved: 42,
    minStock: 100,
    maxStock: 880,
  },
  {
    id: '18',
    warehouseId: '6971d565cebe6ab0e3c64a70',
    warehouse: 'Warehouse 1',
    itemType: 'Product',
    itemId: '6971d565cebe6ab0e3c64a8f',
    itemName: 'Product 3',
    itemCode: 'PROD0003',
    stock: 190,
    reserved: 25,
    minStock: 220,
    maxStock: 420,
  },
  {
    id: '19',
    warehouseId: '6971d565cebe6ab0e3c64a71',
    warehouse: 'Warehouse 2',
    itemType: 'Product',
    itemId: '6971d565cebe6ab0e3c64a90',
    itemName: 'Product 9',
    itemCode: 'PROD0009',
    stock: 350,
    reserved: 26,
    minStock: 80,
    maxStock: 520,
  },
  {
    id: '20',
    warehouseId: '6971d565cebe6ab0e3c64a72',
    warehouse: 'Warehouse 3',
    itemType: 'Product',
    itemId: '6971d565cebe6ab0e3c64a91',
    itemName: 'Product 13',
    itemCode: 'PROD0013',
    stock: 560,
    reserved: 31,
    minStock: 70,
    maxStock: 740,
  },
  {
    id: '21',
    warehouseId: '6971d565cebe6ab0e3c64a73',
    warehouse: 'Warehouse 4',
    itemType: 'Product',
    itemId: '6971d565cebe6ab0e3c64a92',
    itemName: 'Product 15',
    itemCode: 'PROD0015',
    stock: 625,
    reserved: 17,
    minStock: 95,
    maxStock: 780,
  },
  {
    id: '22',
    warehouseId: '6971d565cebe6ab0e3c64a74',
    warehouse: 'Warehouse 5',
    itemType: 'Product',
    itemId: '6971d565cebe6ab0e3c64a93',
    itemName: 'Product 4',
    itemCode: 'PROD0004',
    stock: 445,
    reserved: 19,
    minStock: 60,
    maxStock: 540,
  },
  {
    id: '23',
    warehouseId: '6971d565cebe6ab0e3c64a75',
    warehouse: 'Warehouse 5',
    itemType: 'Product',
    itemId: '6971d565cebe6ab0e3c64a94',
    itemName: 'Product 6',
    itemCode: 'PROD0006',
    stock: 530,
    reserved: 24,
    minStock: 75,
    maxStock: 690,
  },
  {
    id: '24',
    warehouseId: '6971d565cebe6ab0e3c64a76',
    warehouse: 'Warehouse 6',
    itemType: 'Product',
    itemId: '6971d565cebe6ab0e3c64a95',
    itemName: 'Product 17',
    itemCode: 'PROD0017',
    stock: 610,
    reserved: 33,
    minStock: 110,
    maxStock: 820,
  },
  {
    id: '25',
    warehouseId: '6971d565cebe6ab0e3c64a77',
    warehouse: 'Warehouse 1',
    itemType: 'Raw Material',
    itemId: '6971d565cebe6ab0e3c64a96',
    itemName: 'Raw Material 1',
    itemCode: 'RM0005',
    stock: 230,
    reserved: 12,
    minStock: 45,
    maxStock: 320,
  },
  {
    id: '26',
    warehouseId: '6971d565cebe6ab0e3c64a97',
    warehouse: 'Warehouse 2',
    itemType: 'Raw Material',
    itemId: '6971d565cebe6ab0e3c64a98',
    itemName: 'Raw Material 7',
    itemCode: 'RM0006',
    stock: 140,
    reserved: 18,
    minStock: 160,
    maxStock: 260,
  },
  {
    id: '27',
    warehouseId: '6971d565cebe6ab0e3c64a99',
    warehouse: 'Warehouse 3',
    itemType: 'Raw Material',
    itemId: '6971d565cebe6ab0e3c64a9a',
    itemName: 'Raw Material 2',
    itemCode: 'RM0007',
    stock: 380,
    reserved: 20,
    minStock: 70,
    maxStock: 500,
  },
];

const EMPTY_FORM = {
  warehouseId: '',
  warehouse: '',
  itemType: 'Product',
  itemId: '',
  itemName: '',
  itemCode: '',
  stock: '0',
  reserved: '0',
  minStock: '10',
  maxStock: '0',
};

function getStatus(stock, minStock) {
  return stock <= minStock ? 'Low Stock' : 'In Stock';
}

function StatusBadge({ stock, minStock }) {
  const inStock = getStatus(stock, minStock) === 'In Stock';
  const status = inStock ? 'In Stock' : 'Low Stock';

  return (
    <View style={[styles.badge, inStock ? styles.badgeInStock : styles.badgeLowStock]}>
      <Text style={[styles.badgeText, inStock ? styles.badgeTextInStock : styles.badgeTextLowStock]}>{status}</Text>
    </View>
  );
}

function InventoryFormModal({
  title,
  form,
  setForm,
  primaryLabel,
  onPrimaryPress,
  onClose,
  compact,
}) {
  const [showItemTypeOptions, setShowItemTypeOptions] = useState(false);

  return (
    <View style={[styles.formModalCard, compact && styles.formModalCardCompact]}>
      <View style={styles.formModalHeader}>
        <Text style={[styles.formModalTitle, compact && styles.formModalTitleCompact]}>{title}</Text>
        <TouchableOpacity onPress={onClose} activeOpacity={0.8}>
          <MaterialCommunityIcons name="close" size={22} color="#1f1f1f" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.formModalBody} contentContainerStyle={styles.formModalBodyContent}>
        <Text style={styles.formLabel}>Warehouse ID *</Text>
        <TextInput
          value={form.warehouseId}
          onChangeText={(value) => setForm((current) => ({ ...current, warehouseId: value }))}
          style={styles.formInput}
          placeholder="Enter warehouse id"
          placeholderTextColor="#9d9d9d"
        />

        <Text style={styles.formLabel}>Warehouse Name *</Text>
        <TextInput
          value={form.warehouse}
          onChangeText={(value) => setForm((current) => ({ ...current, warehouse: value }))}
          style={styles.formInput}
          placeholder="Enter warehouse name"
          placeholderTextColor="#9d9d9d"
        />

        <Text style={styles.formLabel}>Item Type</Text>
        <View style={styles.dropdownWrap}>
          <TouchableOpacity
            style={styles.selectTrigger}
            activeOpacity={0.85}
            onPress={() => setShowItemTypeOptions((open) => !open)}
          >
            <Text style={styles.selectTriggerText}>{form.itemType}</Text>
            <MaterialCommunityIcons
              name={showItemTypeOptions ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#6e6e6e"
            />
          </TouchableOpacity>
          {showItemTypeOptions ? (
            <View style={styles.optionList}>
              {ITEM_TYPES.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={styles.optionItem}
                  onPress={() => {
                    setForm((current) => ({ ...current, itemType: type }));
                    setShowItemTypeOptions(false);
                  }}
                >
                  <Text style={styles.optionItemText}>{type}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : null}
        </View>

        <Text style={styles.formLabel}>Item ID *</Text>
        <TextInput
          value={form.itemId}
          onChangeText={(value) => setForm((current) => ({ ...current, itemId: value }))}
          style={styles.formInput}
          placeholder="Enter item id"
          placeholderTextColor="#9d9d9d"
        />

        <Text style={styles.formLabel}>Item Name *</Text>
        <TextInput
          value={form.itemName}
          onChangeText={(value) => setForm((current) => ({ ...current, itemName: value }))}
          style={styles.formInput}
          placeholder="Enter item name"
          placeholderTextColor="#9d9d9d"
        />

        <Text style={styles.formLabel}>Item Code *</Text>
        <TextInput
          value={form.itemCode}
          onChangeText={(value) => setForm((current) => ({ ...current, itemCode: value }))}
          style={styles.formInput}
          placeholder="Enter item code"
          placeholderTextColor="#9d9d9d"
          autoCapitalize="characters"
        />

        <View style={[styles.formGrid, compact && styles.formGridCompact]}>
          <View style={[styles.formCol, compact && styles.formColCompact]}>
            <Text style={styles.formLabel}>Stock Quantity *</Text>
            <TextInput
              value={form.stock}
              onChangeText={(value) => setForm((current) => ({ ...current, stock: value.replace(/[^0-9]/g, '') }))}
              style={styles.formInput}
              keyboardType="number-pad"
              placeholder="0"
              placeholderTextColor="#9d9d9d"
            />
          </View>

          <View style={[styles.formCol, compact && styles.formColCompact]}>
            <Text style={styles.formLabel}>Min Stock Level *</Text>
            <TextInput
              value={form.minStock}
              onChangeText={(value) => setForm((current) => ({ ...current, minStock: value.replace(/[^0-9]/g, '') }))}
              style={styles.formInput}
              keyboardType="number-pad"
              placeholder="10"
              placeholderTextColor="#9d9d9d"
            />
          </View>
        </View>

        <Text style={styles.formLabel}>Max Stock Level</Text>
        <TextInput
          value={form.maxStock}
          onChangeText={(value) => setForm((current) => ({ ...current, maxStock: value.replace(/[^0-9]/g, '') }))}
          style={styles.formInput}
          keyboardType="number-pad"
          placeholder="0"
          placeholderTextColor="#9d9d9d"
        />
      </ScrollView>

      <View style={styles.formModalFooter}>
        <TouchableOpacity style={styles.primaryBtn} onPress={onPrimaryPress} activeOpacity={0.85}>
          <Text style={styles.primaryBtnText}>{primaryLabel}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryBtn} onPress={onClose} activeOpacity={0.85}>
          <Text style={styles.secondaryBtnText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function WarehouseInventoryScreen() {
  const { width } = useWindowDimensions();
  const compact = width < 700;

  const [inventoryRows, setInventoryRows] = useState(INVENTORY_ROWS);
  const [currentPage, setCurrentPage] = useState(1);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const [addForm, setAddForm] = useState(EMPTY_FORM);
  const [editForm, setEditForm] = useState(EMPTY_FORM);

  const totalPages = Math.max(1, Math.ceil(inventoryRows.length / PAGE_SIZE));
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const pageRows = useMemo(() => inventoryRows.slice(pageStart, pageStart + PAGE_SIZE), [inventoryRows, pageStart]);

  const showingStart = pageRows.length ? pageStart + 1 : 0;
  const showingEnd = Math.min(pageStart + PAGE_SIZE, inventoryRows.length);

  const validateForm = (form) => {
    if (!form.warehouseId.trim()) {
      Alert.alert('Validation Error', 'Warehouse ID is required');
      return false;
    }
    if (!form.warehouse.trim()) {
      Alert.alert('Validation Error', 'Warehouse name is required');
      return false;
    }
    if (!form.itemId.trim()) {
      Alert.alert('Validation Error', 'Item ID is required');
      return false;
    }
    if (!form.itemName.trim()) {
      Alert.alert('Validation Error', 'Item name is required');
      return false;
    }
    if (!form.itemCode.trim()) {
      Alert.alert('Validation Error', 'Item code is required');
      return false;
    }
    if (!form.stock.trim()) {
      Alert.alert('Validation Error', 'Stock quantity is required');
      return false;
    }
    if (!form.minStock.trim()) {
      Alert.alert('Validation Error', 'Min stock level is required');
      return false;
    }

    return true;
  };

  const buildRowFromForm = (form, existing = null) => {
    const stock = Number(form.stock || 0);
    const minStock = Number(form.minStock || 0);
    const maxStock = Number(form.maxStock || 0);
    const reserved = existing ? existing.reserved : 0;

    return {
      id: existing ? existing.id : String(Date.now()),
      warehouseId: form.warehouseId.trim(),
      warehouse: form.warehouse.trim(),
      itemType: form.itemType,
      itemId: form.itemId.trim(),
      itemName: form.itemName.trim(),
      itemCode: form.itemCode.trim().toUpperCase(),
      stock,
      reserved,
      minStock,
      maxStock,
    };
  };

  const openAdd = () => {
    setAddForm(EMPTY_FORM);
    setShowAddModal(true);
  };

  const submitAdd = () => {
    if (!validateForm(addForm)) return;

    const newRow = buildRowFromForm(addForm);
    setInventoryRows((current) => [newRow, ...current]);
    setCurrentPage(1);
    setShowAddModal(false);
    Alert.alert('Success', 'Inventory entry added successfully');
  };

  const openEdit = (item) => {
    setSelectedItem(item);
    setEditForm({
      warehouseId: item.warehouseId,
      warehouse: item.warehouse,
      itemType: item.itemType,
      itemId: item.itemId,
      itemName: item.itemName,
      itemCode: item.itemCode,
      stock: String(item.stock),
      reserved: String(item.reserved),
      minStock: String(item.minStock),
      maxStock: String(item.maxStock),
    });
    setShowEditModal(true);
  };

  const submitEdit = () => {
    if (!selectedItem) return;
    if (!validateForm(editForm)) return;

    const updatedRow = buildRowFromForm(editForm, selectedItem);
    setInventoryRows((current) => current.map((item) => (item.id === selectedItem.id ? updatedRow : item)));
    setShowEditModal(false);
    setSelectedItem(null);
    Alert.alert('Success', 'Inventory entry updated successfully');
  };

  const openDelete = (item) => {
    setSelectedItem(item);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (!selectedItem) return;

    setInventoryRows((current) => {
      const nextRows = current.filter((item) => item.id !== selectedItem.id);
      const nextPages = Math.max(1, Math.ceil(nextRows.length / PAGE_SIZE));
      setCurrentPage((page) => Math.min(page, nextPages));
      return nextRows;
    });

    setShowDeleteModal(false);
    setSelectedItem(null);
    Alert.alert('Success', 'Inventory entry deleted successfully');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <MaterialCommunityIcons
            name="view-grid-outline"
            size={20}
            color={COLORS.textPrimary}
            style={styles.headerIcon}
          />
          <Text style={styles.headerTitle}>Warehouse Inventory Management</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.innerContent}>
          <View style={styles.titleRow}>
            <View style={styles.titleGroup}>
              <Text style={styles.screenTitle}>Warehouse Inventory</Text>
              <Text style={styles.screenSubtitle}>Manage warehouse inventory and stock levels.</Text>
            </View>
            <TouchableOpacity style={styles.addButton} activeOpacity={0.85} onPress={openAdd}>
              <MaterialCommunityIcons name="plus" size={17} color={COLORS.white} />
              <Text style={styles.addButtonText}>Add Inventory</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.cardList}>
            {pageRows.map((row) => {
              const available = Math.max(0, row.stock - row.reserved);

              return (
                <View key={row.id} style={styles.card}>
                  <View style={styles.cardTopRow}>
                    <View style={styles.cardTopLeft}>
                      <Text style={styles.rowWarehouse}>{row.warehouse}</Text>
                      <Text style={styles.itemType}>{row.itemType}</Text>
                    </View>
                    <StatusBadge stock={row.stock} minStock={row.minStock} />
                  </View>

                  <Text style={styles.rowItemName}>{row.itemName}</Text>
                  <Text style={styles.rowItemCode}>{row.itemCode}</Text>

                  <View style={styles.statsGrid}>
                    <View style={styles.statChip}>
                      <Text style={styles.statLabel}>Stock</Text>
                      <Text style={styles.statValue}>{row.stock}</Text>
                    </View>
                    <View style={styles.statChip}>
                      <Text style={styles.statLabel}>Reserved</Text>
                      <Text style={styles.statValue}>{row.reserved}</Text>
                    </View>
                    <View style={styles.statChip}>
                      <Text style={styles.statLabel}>Available</Text>
                      <Text style={styles.statValue}>{available}</Text>
                    </View>
                  </View>

                  <View style={styles.actionRow}>
                    <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7} onPress={() => openEdit(row)}>
                      <MaterialCommunityIcons name="pencil-outline" size={16} color="#555" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
                      <MaterialCommunityIcons name="chart-line" size={16} color="#1db954" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7} onPress={() => openDelete(row)}>
                      <MaterialCommunityIcons name="trash-can-outline" size={16} color="#ff3b30" />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>

          <Text style={styles.paginationSummary}>
            Showing {showingStart} to {showingEnd} of {inventoryRows.length} inventories
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
              <Text style={[styles.paginationButtonText, currentPage === totalPages && styles.paginationButtonTextDisabled]}>
                Next
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={showAddModal}
        transparent
        animationType="fade"
        presentationStyle="overFullScreen"
        statusBarTranslucent
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <InventoryFormModal
            title="Add Inventory Entry"
            form={addForm}
            setForm={setAddForm}
            primaryLabel="Add Inventory"
            onPrimaryPress={submitAdd}
            onClose={() => setShowAddModal(false)}
            compact={compact}
          />
        </View>
      </Modal>

      <Modal
        visible={showEditModal}
        transparent
        animationType="fade"
        presentationStyle="overFullScreen"
        statusBarTranslucent
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <InventoryFormModal
            title="Edit Inventory Entry"
            form={editForm}
            setForm={setEditForm}
            primaryLabel="Update Inventory"
            onPrimaryPress={submitEdit}
            onClose={() => setShowEditModal(false)}
            compact={compact}
          />
        </View>
      </Modal>

      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        presentationStyle="overFullScreen"
        statusBarTranslucent
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.deleteModalCard, compact && styles.deleteModalCardCompact]}>
            <View style={styles.deleteModalHeader}>
              <Text style={[styles.deleteTitle, compact && styles.deleteTitleCompact]}>Confirm Delete</Text>
            </View>
            <View style={styles.deleteModalBody}>
              <Text style={[styles.deleteMessage, compact && styles.deleteMessageCompact]}>
                Are you sure you want to delete the inventory entry for "{selectedItem?.itemName}"? This action
                cannot be undone.
              </Text>
            </View>
            <View style={styles.deleteActions}>
              <TouchableOpacity style={styles.secondaryBtn} onPress={() => setShowDeleteModal(false)}>
                <Text style={styles.secondaryBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteBtn} onPress={confirmDelete}>
                <Text style={styles.deleteBtnText}>Delete</Text>
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
    borderBottomColor: COLORS.gray200,
  },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center' },
  headerIcon: { marginRight: SPACING.md },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  content: { flex: 1, backgroundColor: '#fcfcfa' },
  innerContent: { paddingHorizontal: 16, paddingTop: 22, paddingBottom: 40 },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
  },
  titleGroup: { flex: 1 },
  screenTitle: { fontSize: 22, fontWeight: '700', color: '#161616' },
  screenSubtitle: { marginTop: 3, fontSize: 13, color: '#6d6d6d' },
  addButton: {
    height: 36,
    borderRadius: 10,
    backgroundColor: '#2453e6',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  addButtonText: { fontSize: 13, fontWeight: '600', color: COLORS.white },
  cardList: { gap: 10 },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    padding: 12,
  },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 },
  cardTopLeft: { flex: 1 },
  rowWarehouse: { fontSize: 15, fontWeight: '600', color: '#171717' },
  itemType: { marginTop: 2, fontSize: 12, color: '#6d6d6d' },
  rowItemName: { marginTop: 10, fontSize: 14, fontWeight: '600', color: '#171717' },
  rowItemCode: { marginTop: 2, fontSize: 12, color: '#6d6d6d' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  statChip: {
    minWidth: 88,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#f6f6f6',
  },
  statLabel: { fontSize: 11, color: '#777' },
  statValue: { marginTop: 2, fontSize: 14, fontWeight: '600', color: '#222' },
  badge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  badgeInStock: { backgroundColor: '#2453e6' },
  badgeLowStock: { backgroundColor: '#fff3e0' },
  badgeText: { fontSize: 12, fontWeight: '600' },
  badgeTextInStock: { color: COLORS.white },
  badgeTextLowStock: { color: '#e65100' },
  actionRow: { marginTop: 12, flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
  iconBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dfdfdf',
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paginationSummary: { marginTop: 24, fontSize: 14, color: '#6d6d6d' },
  paginationRow: { marginTop: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  paginationButton: {
    minWidth: 80,
    height: 32,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#dfdfdf',
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paginationButtonDisabled: { backgroundColor: '#fbfbfb' },
  paginationButtonText: { fontSize: 14, fontWeight: '600', color: '#111111' },
  paginationButtonTextDisabled: { color: '#a6a6a6' },
  pageIndicator: {
    minWidth: 120,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dfdfdf',
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
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
    maxWidth: 760,
    maxHeight: '92%',
    minHeight: 380,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#d9d9d9',
    overflow: 'visible',
  },
  formModalCardCompact: {
    maxWidth: 640,
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
  formModalTitle: { fontSize: 39, fontWeight: '700', color: '#141414', lineHeight: 44 },
  formModalTitleCompact: { fontSize: 22, lineHeight: 28 },
  formModalBody: { flex: 1 },
  formModalBodyContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 24,
  },
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
  dropdownWrap: { zIndex: 20 },
  selectTrigger: {
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#d5d5d5',
    backgroundColor: '#ffffff',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectTriggerText: { fontSize: 16, color: '#1d1d1d' },
  optionList: {
    marginTop: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d9d9d9',
    backgroundColor: '#ffffff',
    overflow: 'hidden',
  },
  optionItem: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
  },
  optionItemText: { fontSize: 15, color: '#1a1a1a' },
  formGrid: {
    marginTop: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    columnGap: 14,
  },
  formGridCompact: { flexDirection: 'column' },
  formCol: { width: '48.5%' },
  formColCompact: { width: '100%' },
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
  deleteTitle: { fontSize: 46, fontWeight: '700', color: '#161616', lineHeight: 50 },
  deleteTitleCompact: { fontSize: 34, lineHeight: 38 },
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
