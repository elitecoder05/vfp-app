import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export default function ReportsScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState('Monthly');

  const periods = ['Weekly', 'Monthly', 'Quarterly', 'Yearly'];

  const salesData = [
    { month: 'Jan', sales: 45000, orders: 120 },
    { month: 'Feb', sales: 52000, orders: 145 },
    { month: 'Mar', sales: 48000, orders: 132 },
    { month: 'Apr', sales: 61000, orders: 168 },
    { month: 'May', sales: 55000, orders: 155 },
    { month: 'Jun', sales: 67000, orders: 189 },
  ];

  const topProducts = [
    { name: 'Wireless Headphones', sales: 2340, revenue: '$210,660' },
    { name: 'Smart Watch Pro', sales: 1890, revenue: '$377,910' },
    { name: 'Laptop Stand', sales: 1650, revenue: '$82,350' },
    { name: 'USB-C Hub', sales: 1420, revenue: '$71,000' },
    { name: 'Bluetooth Speaker', sales: 1280, revenue: '$102,400' },
  ];

  const topCustomers = [
    { name: 'Acme Corporation', orders: 45, spent: '$12,450' },
    { name: 'Tech Solutions Ltd', orders: 38, spent: '$9,870' },
    { name: 'Global Industries', orders: 32, spent: '$8,560' },
    { name: 'Enterprise Co', orders: 28, spent: '$7,890' },
    { name: 'Innovation Labs', orders: 25, spent: '$6,340' },
  ];

  const kpiData = [
    { title: 'Total Revenue', value: '$328,000', change: '+12.5%', color: '#34C759' },
    { title: 'Total Orders', value: '909', change: '+8.3%', color: '#007AFF' },
    { title: 'Avg Order Value', value: '$361', change: '+4.2%', color: '#FF9500' },
    { title: 'Customer Growth', value: '+23%', change: '+5.1%', color: '#AF52DE' },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Reports & Analytics</Text>
        <TouchableOpacity style={styles.exportButton}>
          <Text style={styles.exportButtonText}>Export</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.periodSelector}>
        {periods.map((period) => (
          <TouchableOpacity
            key={period}
            style={[styles.periodButton, selectedPeriod === period && styles.activePeriod]}
            onPress={() => setSelectedPeriod(period)}
          >
            <Text style={[styles.periodText, selectedPeriod === period && styles.activePeriodText]}>
              {period}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.kpiContainer}>
        {kpiData.map((kpi, index) => (
          <View key={index} style={[styles.kpiCard, { borderLeftColor: kpi.color }]}>
            <Text style={styles.kpiTitle}>{kpi.title}</Text>
            <Text style={styles.kpiValue}>{kpi.value}</Text>
            <Text style={[styles.kpiChange, { color: kpi.color }]}>{kpi.change}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sales Overview</Text>
        <View style={styles.chartContainer}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Monthly Sales Trend</Text>
            <Text style={styles.chartSubtitle}>Last 6 months</Text>
          </View>
          <View style={styles.chartBars}>
            {salesData.map((data, index) => (
              <View key={index} style={styles.barContainer}>
                <View style={[styles.bar, { height: (data.sales / 70000) * 120 }]} />
                <Text style={styles.barLabel}>{data.month}</Text>
                <Text style={styles.barValue}>${(data.sales / 1000).toFixed(0)}k</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Top Products</Text>
        {topProducts.map((product, index) => (
          <View key={index} style={styles.listItem}>
            <View style={styles.rankBadge}>
              <Text style={styles.rankText}>{index + 1}</Text>
            </View>
            <View style={styles.listItemInfo}>
              <Text style={styles.listItemName}>{product.name}</Text>
              <Text style={styles.listItemDetail}>{product.sales} units sold</Text>
            </View>
            <Text style={styles.listItemValue}>{product.revenue}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Top Customers</Text>
        {topCustomers.map((customer, index) => (
          <View key={index} style={styles.listItem}>
            <View style={styles.rankBadge}>
              <Text style={styles.rankText}>{index + 1}</Text>
            </View>
            <View style={styles.listItemInfo}>
              <Text style={styles.listItemName}>{customer.name}</Text>
              <Text style={styles.listItemDetail}>{customer.orders} orders</Text>
            </View>
            <Text style={styles.listItemValue}>{customer.spent}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Reports</Text>
        <View style={styles.quickReportsGrid}>
          <TouchableOpacity style={styles.quickReportCard}>
            <Text style={styles.quickReportIcon}>📊</Text>
            <Text style={styles.quickReportText}>Sales Report</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickReportCard}>
            <Text style={styles.quickReportIcon}>📦</Text>
            <Text style={styles.quickReportText}>Inventory Report</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickReportCard}>
            <Text style={styles.quickReportIcon}>👥</Text>
            <Text style={styles.quickReportText}>Customer Report</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickReportCard}>
            <Text style={styles.quickReportIcon}>💰</Text>
            <Text style={styles.quickReportText}>Revenue Report</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#007AFF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  exportButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  exportButtonText: {
    color: '#007AFF',
    fontWeight: '600',
    fontSize: 14,
  },
  periodSelector: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    margin: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  activePeriod: {
    backgroundColor: '#007AFF',
  },
  periodText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activePeriodText: {
    color: '#fff',
  },
  kpiContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 15,
  },
  kpiCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    width: (width - 45) / 2,
    marginHorizontal: 7.5,
    marginBottom: 15,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  kpiTitle: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  kpiValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 5,
  },
  kpiChange: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 5,
  },
  section: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartHeader: {
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  chartSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  chartBars: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 150,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
  },
  bar: {
    width: 30,
    backgroundColor: '#007AFF',
    borderRadius: 4,
    marginBottom: 8,
  },
  barLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  barValue: {
    fontSize: 10,
    color: '#999',
  },
  listItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  rankBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  rankText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  listItemInfo: {
    flex: 1,
  },
  listItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  listItemDetail: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  listItemValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  quickReportsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  quickReportCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: (width - 45) / 2,
    marginHorizontal: 7.5,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  quickReportIcon: {
    fontSize: 30,
    marginBottom: 10,
  },
  quickReportText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
});