import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Modal, RefreshControl, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { createOrder, deleteOrder, getCustomers, getOrders, getProducts, getRawMaterials, getTransports, updateOrder, updateOrderStatus } from '../api/api-methods';
import { BORDER_RADIUS, COLORS, SPACING } from '../constants/theme';

const PAGE_SIZE = 10;
const STATUS_OPTIONS = [
  { label: 'Placed', value: 'placed' },
  { label: 'Processing', value: 'processing' },
  { label: 'On Hold', value: 'on hold' },
  { label: 'Dispatched', value: 'dispatched' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Cancelled', value: 'cancelled' },
];

const STATUS_STYLES = {
  Placed: { bg: '#eceff1', text: '#455a64' },
  Dispatched: { bg: '#e3f2fd', text: '#1565c0' },
  Processing: { bg: '#fff3e0', text: '#e65100' },
  Delivered: { bg: '#e8f5e9', text: '#2e7d32' },
  Cancelled: { bg: '#fce4ec', text: '#c62828' },
  'On Hold': { bg: '#f3e5f5', text: '#6a1b9a' },
};

function toDisplayStatus(status) {
  const raw = (status || '').toString().trim().toLowerCase();
  if (!raw) return 'Placed';
  if (raw === 'on hold') return 'On Hold';
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

function formatDate(iso) {
  if (!iso) return 'N/A';
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
}

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || { bg: '#f5f5f5', text: '#555' };
  return (
    <View style={[styles.statusBadge, { backgroundColor: s.bg }]}>
      <Text style={[styles.statusBadgeText, { color: s.text }]}>{toDisplayStatus(status)}</Text>
    </View>
  );
}

function OrderCard({ order, onEdit, onDelete, onOpenStatus, statusUpdating }) {
  const itemCount = order.items?.length ?? order.itemCount ?? 0;
  const transport = order.transportName || order.transport_id?.name || 'N/A';
  const customer = order.customer_id?.name || 'N/A';
  const created = formatDate(order.order_date || order.createdAt);
  const statusLabel = toDisplayStatus(order.status);

  return (
    <View style={styles.orderCard}>
      <View style={styles.cardRow1}>
        <Text style={styles.orderNumber}>{order.orderNumber}</Text>
        <StatusBadge status={statusLabel} />
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
        <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7} onPress={() => onEdit(order)}>
          <MaterialCommunityIcons name="pencil-outline" size={17} color="#555" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7} onPress={() => onDelete(order)}>
          <MaterialCommunityIcons name="trash-can-outline" size={17} color="#e53935" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.statusDropBtn} activeOpacity={0.85} onPress={() => onOpenStatus(order)} disabled={statusUpdating}>
          {statusUpdating ? <ActivityIndicator size="small" color="#2453e6" /> : <Text style={styles.statusDropText}>{statusLabel}</Text>}
          {!statusUpdating && <MaterialCommunityIcons name="chevron-down" size={15} color="#333" />}
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
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const [statusOrder, setStatusOrder] = useState(null);
  const [deletingOrder, setDeletingOrder] = useState(null);
  const [editOrder, setEditOrder] = useState(null);
  const [editTransport, setEditTransport] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editItems, setEditItems] = useState([]);
  const [updatingOrderId, setUpdatingOrderId] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);
  
  // Create Order states
  const [createOrderModal, setCreateOrderModal] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [transports, setTransports] = useState([]);
  const [products, setProducts] = useState([]);
  const [rawMaterials, setRawMaterials] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedTransport, setSelectedTransport] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [orderNotes, setOrderNotes] = useState('');
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [loadingDropdowns, setLoadingDropdowns] = useState(false);
  const [customerDropdownOpen, setCustomerDropdownOpen] = useState(false);
  const [transportDropdownOpen, setTransportDropdownOpen] = useState(false);
  const [productDropdownOpen, setProductDropdownOpen] = useState(false);

  const fetchOrders = async (page, statusFilter = selectedFilter) => {
    setLoading(true);
    setError(null);
    try {
      let response;
      try {
        response = await getOrders(page, PAGE_SIZE, statusFilter);
      } catch (err) {
        if (statusFilter !== 'all') {
          response = await getOrders(page, PAGE_SIZE);
        } else {
          throw err;
        }
      }

      const rows = response.data || [];
      const filteredRows = statusFilter === 'all'
        ? rows
        : rows.filter((o) => (o.status || '').toLowerCase() === statusFilter);

      setOrders(filteredRows);
      setTotalPages(response.pagination?.totalPages || 1);
      setTotalItems(statusFilter === 'all' ? (response.pagination?.totalItems || 0) : filteredRows.length);
    } catch (err) {
      setError('Failed to fetch orders');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchOrders(currentPage, selectedFilter);
    } finally {
      setRefreshing(false);
    }
  };

  const fetchDropdownData = async () => {
    setLoadingDropdowns(true);
    try {
      const [customersRes, transportsRes, productsRes, rawMaterialsRes] = await Promise.all([
        getCustomers(1, 1000),
        getTransports(1, 1000),
        getProducts(1, 1000),
        getRawMaterials(1, 1000),
      ]);
      setCustomers(customersRes.data || []);
      setTransports(transportsRes.data || []);
      setProducts(productsRes.data || []);
      setRawMaterials(rawMaterialsRes.data || []);
    } catch (err) {
      console.error('Error fetching dropdown data:', err);
      Alert.alert('Error', 'Failed to load form data');
    } finally {
      setLoadingDropdowns(false);
    }
  };

  const openCreateOrder = () => {
    setCreateOrderModal(true);
    setSelectedCustomer(null);
    setSelectedTransport(null);
    setOrderItems([]);
    setOrderNotes('');
    fetchDropdownData();
  };

  const addOrderItem = (product) => {
    const existingIndex = orderItems.findIndex(item => item.item_id === product._id);
    if (existingIndex >= 0) {
      setOrderItems(prev => prev.map((item, i) => 
        i === existingIndex ? { ...item, quantity: String(Number(item.quantity) + 1) } : item
      ));
    } else {
      setOrderItems(prev => [...prev, {
        itemType: 'product',
        item_id: product._id,
        itemName: product.name,
        sku: product.sku,
        unit: product.unit,
        quantity: '1',
      }]);
    }
    setProductDropdownOpen(false);
  };

  const updateOrderItemQty = (index, qty) => {
    const quantity = qty.replace(/[^0-9]/g, '');
    setOrderItems(prev => prev.map((item, i) => i === index ? { ...item, quantity } : item));
  };

  const removeOrderItem = (index) => {
    setOrderItems(prev => prev.filter((_, i) => i !== index));
  };

  const submitCreateOrder = async () => {
    if (!selectedCustomer) {
      Alert.alert('Missing Data', 'Please select a customer');
      return;
    }
    if (!orderItems.length) {
      Alert.alert('Missing Items', 'Please add at least one product');
      return;
    }

    const itemsPayload = orderItems.map(item => ({
      itemType: item.itemType,
      item_id: item.item_id,
      quantity: Number(item.quantity) || 1,
    }));

    const payload = {
      customer_id: selectedCustomer._id,
      transport_id: selectedTransport?._id || '',
      items: itemsPayload,
      notes: orderNotes,
    };

    try {
      setCreatingOrder(true);
      await createOrder(payload);
      setCreateOrderModal(false);
      fetchOrders(currentPage, selectedFilter);
      Alert.alert('Success', 'Order created successfully');
    } catch (err) {
      Alert.alert('Create Failed', err.response?.data?.message || 'Unable to create order');
    } finally {
      setCreatingOrder(false);
    }
  };

  useEffect(() => {
    fetchOrders(currentPage, selectedFilter);
  }, [currentPage, selectedFilter]);

  const filterLabel = useMemo(() => {
    if (selectedFilter === 'all') return 'All Orders';
    return toDisplayStatus(selectedFilter);
  }, [selectedFilter]);

  const showingStart = orders.length ? (currentPage - 1) * PAGE_SIZE + 1 : 0;
  const showingEnd = orders.length ? showingStart + orders.length - 1 : 0;

  const openEdit = (order) => {
    setEditOrder(order);
    setEditTransport(order.transportName || order.transport_id?.name || '');
    setEditNotes(order.notes || '');
    setEditItems(order.items || []);
  };

  const applyStatusUpdate = async (orderId, status) => {
    try {
      setUpdatingOrderId(orderId);
      await updateOrderStatus(orderId, status);
      setOrders((prev) => prev.map((row) => (row._id === orderId ? { ...row, status } : row)));
      setStatusOrder(null);
    } catch (err) {
      Alert.alert('Status Update Failed', err.response?.data?.message || 'Unable to update order status');
    } finally {
      setUpdatingOrderId('');
    }
  };

  const confirmDelete = async () => {
    if (!deletingOrder?._id) return;
    try {
      setUpdatingOrderId(deletingOrder._id);
      await deleteOrder(deletingOrder._id);
      setDeletingOrder(null);
      fetchOrders(currentPage, selectedFilter);
    } catch (err) {
      Alert.alert('Delete Failed', err.response?.data?.message || 'Unable to delete this order');
    } finally {
      setUpdatingOrderId('');
    }
  };

  const changeQty = (index, text) => {
    const qty = text.replace(/[^0-9]/g, '');
    setEditItems((prev) => prev.map((item, i) => (i === index ? { ...item, quantity: qty } : item)));
  };

  const removeItem = (index) => {
    setEditItems((prev) => prev.filter((_, i) => i !== index));
  };

  const saveEditOrder = async () => {
    if (!editOrder?._id) return;
    if (!editOrder.customer_id?._id) {
      Alert.alert('Missing Data', 'Customer is required to update this order');
      return;
    }
    if (!editItems.length) {
      Alert.alert('Missing Items', 'Please keep at least one item in the order');
      return;
    }

    const itemsPayload = editItems.map((item) => ({
      itemType: item.itemType,
      item_id: item.item_id,
      quantity: Number(item.quantity) || 1,
    }));

    const payload = {
      customer_id: editOrder.customer_id._id,
      transportName: editTransport,
      items: itemsPayload,
      notes: editNotes,
      status: (editOrder.status || 'placed').toString().toLowerCase(),
    };

    try {
      setSavingEdit(true);
      await updateOrder(editOrder._id, payload);
      setEditOrder(null);
      fetchOrders(currentPage, selectedFilter);
    } catch (err) {
      Alert.alert('Update Failed', err.response?.data?.message || 'Unable to update this order');
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <MaterialCommunityIcons name="package-variant-closed" size={20} color={COLORS.textPrimary} style={styles.headerIcon} />
          <Text style={styles.headerTitle}>Order Management</Text>
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
              <Text style={styles.screenTitle}>Orders</Text>
              <Text style={styles.screenSubtitle}>Manage orders, track shipments, and handle customer requests.</Text>
            </View>
          </View>

          <View style={styles.toolbar}>
            <TouchableOpacity style={styles.filterButton} activeOpacity={0.85} onPress={() => setFilterMenuOpen(true)}>
              <Text style={styles.filterButtonText}>{filterLabel}</Text>
              <MaterialCommunityIcons name="chevron-down" size={16} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.createButton} activeOpacity={0.85} onPress={openCreateOrder}>
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
                <OrderCard
                  key={order._id}
                  order={order}
                  onEdit={openEdit}
                  onDelete={setDeletingOrder}
                  onOpenStatus={setStatusOrder}
                  statusUpdating={updatingOrderId === order._id}
                />
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

      <Modal transparent visible={filterMenuOpen} animationType="fade" onRequestClose={() => setFilterMenuOpen(false)}>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setFilterMenuOpen(false)}>
          <View style={styles.menuCard}>
            <TouchableOpacity style={styles.menuRow} onPress={() => { setSelectedFilter('all'); setCurrentPage(1); setFilterMenuOpen(false); }}>
              <Text style={styles.menuRowText}>All Orders</Text>
            </TouchableOpacity>
            {STATUS_OPTIONS.map((option) => (
              <TouchableOpacity key={option.value} style={styles.menuRow} onPress={() => { setSelectedFilter(option.value); setCurrentPage(1); setFilterMenuOpen(false); }}>
                <Text style={styles.menuRowText}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal transparent visible={Boolean(statusOrder)} animationType="fade" onRequestClose={() => setStatusOrder(null)}>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setStatusOrder(null)}>
          <View style={styles.menuCard}>
            {STATUS_OPTIONS.map((option) => (
              <TouchableOpacity key={option.value} style={styles.menuRow} onPress={() => applyStatusUpdate(statusOrder._id, option.value)}>
                <Text style={styles.menuRowText}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal transparent visible={Boolean(deletingOrder)} animationType="fade" onRequestClose={() => setDeletingOrder(null)}>
        <View style={styles.modalBackdropCenter}>
          <View style={styles.confirmCard}>
            <Text style={styles.confirmTitle}>Confirm Delete</Text>
            <Text style={styles.confirmMessage}>
              Are you sure you want to delete order {deletingOrder?.orderNumber}? This action cannot be undone.
            </Text>
            <View style={styles.confirmActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setDeletingOrder(null)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteBtn} onPress={confirmDelete}>
                <Text style={styles.deleteBtnText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal transparent visible={Boolean(editOrder)} animationType="slide" onRequestClose={() => setEditOrder(null)}>
        <View style={styles.modalBackdropCenter}>
          <View style={styles.editCard}>
            <View style={styles.editHeader}>
              <Text style={styles.editTitle}>Edit Order</Text>
              <TouchableOpacity onPress={() => setEditOrder(null)}>
                <MaterialCommunityIcons name="close" size={20} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.editBody}>
              <Text style={styles.inputLabel}>Customer *</Text>
              <View style={styles.readonlyInput}>
                <Text style={styles.readonlyText}>{editOrder?.customer_id?.name || 'N/A'}</Text>
              </View>

              <Text style={styles.inputLabel}>Transport</Text>
              <View style={styles.textInputWrap}>
                <TextInput value={editTransport} onChangeText={setEditTransport} style={styles.textInput} placeholder="Transport name" placeholderTextColor="#999" />
              </View>

              <Text style={styles.inputLabel}>Products *</Text>
              {editItems.map((item, index) => (
                <View key={item._id || `${item.item_id}-${index}`} style={styles.itemRow}>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.itemName} • {item.sku} • {item.unit}</Text>
                  </View>
                  <View style={styles.qtyInputWrap}>
                    <TextInput value={String(item.quantity || '')} onChangeText={(t) => changeQty(index, t)} style={styles.qtyInput} keyboardType="number-pad" />
                  </View>
                  <TouchableOpacity style={styles.itemDeleteBtn} onPress={() => removeItem(index)}>
                    <MaterialCommunityIcons name="trash-can-outline" size={18} color="#ff3b30" />
                  </TouchableOpacity>
                </View>
              ))}

              <TouchableOpacity style={styles.addProductBtn} onPress={() => Alert.alert('Coming Soon', 'Product picker will be connected next')}>
                <MaterialCommunityIcons name="plus" size={16} color="#333" />
                <Text style={styles.addProductText}>Add Product</Text>
              </TouchableOpacity>

              <Text style={styles.inputLabel}>Notes (Optional)</Text>
              <View style={styles.notesWrap}>
                <TextInput value={editNotes} onChangeText={setEditNotes} placeholder="Add notes..." placeholderTextColor="#999" multiline style={styles.notesInput} />
              </View>
            </ScrollView>

            <View style={styles.editFooter}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditOrder(null)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.updateBtn} onPress={saveEditOrder} disabled={savingEdit}>
                {savingEdit ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.updateBtnText}>Update</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Create Order Modal */}
      <Modal transparent visible={createOrderModal} animationType="slide" onRequestClose={() => setCreateOrderModal(false)}>
        <View style={styles.modalBackdropCenter}>
          <View style={styles.editCard}>
            <View style={styles.editHeader}>
              <Text style={styles.editTitle}>Create Order</Text>
              <TouchableOpacity onPress={() => setCreateOrderModal(false)}>
                <MaterialCommunityIcons name="close" size={20} color="#333" />
              </TouchableOpacity>
            </View>

            {loadingDropdowns ? (
              <View style={styles.stateBox}>
                <ActivityIndicator size="large" color="#2453e6" />
                <Text style={styles.stateText}>Loading form data...</Text>
              </View>
            ) : (
              <ScrollView style={styles.editBody}>
                {/* Customer Selection */}
                <Text style={styles.inputLabel}>Customer *</Text>
                <TouchableOpacity 
                  style={styles.textInputWrap} 
                  onPress={() => setCustomerDropdownOpen(!customerDropdownOpen)}
                >
                  <Text style={[styles.textInput, !selectedCustomer && { color: '#999' }]}>
                    {selectedCustomer ? selectedCustomer.name : 'Select a customer'}
                  </Text>
                  <MaterialCommunityIcons name={customerDropdownOpen ? "chevron-up" : "chevron-down"} size={20} color="#666" />
                </TouchableOpacity>
                
                {customerDropdownOpen && (
                  <View style={styles.dropdownList}>
                    <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled>
                      {customers.map((customer) => (
                        <TouchableOpacity
                          key={customer._id}
                          style={styles.dropdownItem}
                          onPress={() => {
                            setSelectedCustomer(customer);
                            setCustomerDropdownOpen(false);
                          }}
                        >
                          <Text style={styles.dropdownItemText}>{customer.name}</Text>
                          <Text style={styles.dropdownItemSubtext}>{customer.phone}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}

                {/* Transport Selection */}
                <Text style={styles.inputLabel}>Transport</Text>
                <TouchableOpacity 
                  style={styles.textInputWrap} 
                  onPress={() => setTransportDropdownOpen(!transportDropdownOpen)}
                >
                  <Text style={[styles.textInput, !selectedTransport && { color: '#999' }]}>
                    {selectedTransport ? selectedTransport.name : 'Select transport (optional)'}
                  </Text>
                  <MaterialCommunityIcons name={transportDropdownOpen ? "chevron-up" : "chevron-down"} size={20} color="#666" />
                </TouchableOpacity>
                
                {transportDropdownOpen && (
                  <View style={styles.dropdownList}>
                    <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled>
                      <TouchableOpacity
                        style={styles.dropdownItem}
                        onPress={() => {
                          setSelectedTransport(null);
                          setTransportDropdownOpen(false);
                        }}
                      >
                        <Text style={styles.dropdownItemText}>No Transport</Text>
                      </TouchableOpacity>
                      {transports.map((transport) => (
                        <TouchableOpacity
                          key={transport._id}
                          style={styles.dropdownItem}
                          onPress={() => {
                            setSelectedTransport(transport);
                            setTransportDropdownOpen(false);
                          }}
                        >
                          <Text style={styles.dropdownItemText}>{transport.name}</Text>
                          <Text style={styles.dropdownItemSubtext}>{transport.phone}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}

                {/* Product Selection */}
                <Text style={styles.inputLabel}>Products *</Text>
                <TouchableOpacity 
                  style={styles.textInputWrap} 
                  onPress={() => setProductDropdownOpen(!productDropdownOpen)}
                >
                  <Text style={styles.textInput}>Add products</Text>
                  <MaterialCommunityIcons name={productDropdownOpen ? "chevron-up" : "chevron-down"} size={20} color="#666" />
                </TouchableOpacity>
                
                {productDropdownOpen && (
                  <View style={styles.dropdownList}>
                    <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled>
                      {products.map((product) => (
                        <TouchableOpacity
                          key={product._id}
                          style={styles.dropdownItem}
                          onPress={() => addOrderItem(product)}
                        >
                          <Text style={styles.dropdownItemText}>{product.name}</Text>
                          <Text style={styles.dropdownItemSubtext}>SKU: {product.sku} • {product.unit}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}

                {/* Order Items */}
                {orderItems.map((item, index) => (
                  <View key={item.item_id} style={styles.itemRow}>
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName}>{item.itemName} • {item.sku} • {item.unit}</Text>
                    </View>
                    <View style={styles.qtyInputWrap}>
                      <TextInput 
                        value={String(item.quantity || '')} 
                        onChangeText={(t) => updateOrderItemQty(index, t)} 
                        style={styles.qtyInput} 
                        keyboardType="number-pad" 
                      />
                    </View>
                    <TouchableOpacity style={styles.itemDeleteBtn} onPress={() => removeOrderItem(index)}>
                      <MaterialCommunityIcons name="trash-can-outline" size={18} color="#ff3b30" />
                    </TouchableOpacity>
                  </View>
                ))}

                {/* Notes */}
                <Text style={styles.inputLabel}>Notes (Optional)</Text>
                <View style={styles.notesWrap}>
                  <TextInput 
                    value={orderNotes} 
                    onChangeText={setOrderNotes} 
                    placeholder="Add notes..." 
                    placeholderTextColor="#999" 
                    multiline 
                    style={styles.notesInput} 
                  />
                </View>
              </ScrollView>
            )}

            <View style={styles.editFooter}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setCreateOrderModal(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.updateBtn} onPress={submitCreateOrder} disabled={creatingOrder || loadingDropdowns}>
                {creatingOrder ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.updateBtnText}>Create Order</Text>}
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
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.25)', justifyContent: 'flex-start', paddingTop: 120, paddingHorizontal: 16 },
  menuCard: { backgroundColor: COLORS.white, borderRadius: 14, borderWidth: 1, borderColor: '#dcdcdc', overflow: 'hidden' },
  menuRow: { paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  menuRowText: { fontSize: 16, color: '#111' },
  modalBackdropCenter: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', padding: 16 },
  confirmCard: { backgroundColor: COLORS.white, borderRadius: 16, borderWidth: 1, borderColor: '#dcdcdc', padding: 20 },
  confirmTitle: { fontSize: 32, fontWeight: '700', color: '#111' },
  confirmMessage: { marginTop: 18, fontSize: 20, lineHeight: 30, color: '#666' },
  confirmActions: { marginTop: 22, flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  cancelBtn: { height: 40, borderRadius: 12, borderWidth: 1, borderColor: '#dcdcdc', paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.white },
  cancelBtnText: { fontSize: 15, fontWeight: '500', color: '#222' },
  deleteBtn: { height: 40, borderRadius: 12, backgroundColor: '#fce4ec', paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center' },
  deleteBtnText: { fontSize: 15, fontWeight: '600', color: '#e53935' },
  editCard: { maxHeight: '92%', backgroundColor: COLORS.white, borderRadius: 16, borderWidth: 1, borderColor: '#dcdcdc', overflow: 'hidden' },
  editHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#eee' },
  editTitle: { fontSize: 24, fontWeight: '700', color: '#111' },
  editBody: { paddingHorizontal: 16, paddingTop: 14 },
  inputLabel: { marginTop: 10, marginBottom: 8, fontSize: 14, fontWeight: '600', color: '#222' },
  readonlyInput: { minHeight: 48, borderWidth: 1, borderColor: '#dcdcdc', borderRadius: 12, paddingHorizontal: 12, justifyContent: 'center', backgroundColor: '#fafafa' },
  readonlyText: { fontSize: 16, color: '#111' },
  textInputWrap: { minHeight: 48, borderWidth: 1, borderColor: '#dcdcdc', borderRadius: 12, paddingHorizontal: 12, justifyContent: 'center' },
  textInput: { fontSize: 16, color: '#111', paddingVertical: 10 },
  itemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 8 },
  itemInfo: { flex: 1, minHeight: 48, borderWidth: 1, borderColor: '#dcdcdc', borderRadius: 12, paddingHorizontal: 12, justifyContent: 'center' },
  itemName: { fontSize: 14, color: '#222' },
  qtyInputWrap: { width: 70, minHeight: 48, borderWidth: 1, borderColor: '#dcdcdc', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  qtyInput: { width: '100%', textAlign: 'center', fontSize: 18, color: '#111', paddingVertical: 6 },
  itemDeleteBtn: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  addProductBtn: { alignSelf: 'flex-start', height: 36, borderRadius: 12, borderWidth: 1, borderColor: '#dcdcdc', flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, marginBottom: 8 },
  addProductText: { fontSize: 16, fontWeight: '600', color: '#222' },
  notesWrap: { minHeight: 110, borderWidth: 1, borderColor: '#dcdcdc', borderRadius: 12, paddingHorizontal: 12, paddingTop: 8, marginBottom: 16 },
  notesInput: { fontSize: 16, color: '#111', textAlignVertical: 'top' },
  editFooter: { borderTopWidth: 1, borderTopColor: '#eee', padding: 12, flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  updateBtn: { height: 40, borderRadius: 12, backgroundColor: '#2453e6', paddingHorizontal: 22, alignItems: 'center', justifyContent: 'center' },
  updateBtnText: { fontSize: 15, fontWeight: '600', color: COLORS.white },
  dropdownList: { backgroundColor: COLORS.white, borderRadius: 12, borderWidth: 1, borderColor: '#dcdcdc', marginTop: 4, marginBottom: 8, overflow: 'hidden' },
  dropdownItem: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  dropdownItemText: { fontSize: 16, color: '#111' },
  dropdownItemSubtext: { fontSize: 13, color: '#666', marginTop: 2 },
});
