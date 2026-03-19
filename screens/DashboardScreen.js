import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';

export default function DashboardScreen({ navigation }) {
  const moduleCards = [
    {
      title: 'Order Management',
      description: 'Create, update, and track orders with real-time status updates.',
      icon: 'package-variant-closed',
      screen: 'Orders',
    },
    {
      title: 'Inventory Management',
      description: 'Manage products and raw materials with consistent stock workflows.',
      icon: 'warehouse',
      screen: 'Products',
    },
    {
      title: 'Transport Management',
      description: 'Maintain transport providers and operational delivery contacts.',
      icon: 'truck-outline',
      screen: 'Transport',
    },
    {
      title: 'Warehouse Inventory',
      description: 'Track stock, reservations, and low-stock status by warehouse.',
      icon: 'home-city-outline',
      screen: 'WarehouseInventory',
    },
    {
      title: 'Warehouse Master',
      description: 'Manage warehouse locations and active warehouse records.',
      icon: 'chart-box-outline',
      screen: 'WarehouseMaster',
    },
    {
      title: 'User Management',
      description: 'Control role-based access and user account permissions.',
      icon: 'account-group-outline',
      screen: 'UserManagement',
    },
    {
      title: 'Customer Management',
      description: 'Manage your customer database and contact details.',
      icon: 'account-multiple-outline',
      screen: 'Customers',
    },
    {
      title: 'Raw Material Management',
      description: 'Manage raw materials, units, and supplier information.',
      icon: 'package-variant-closed',
      screen: 'RawMaterials',
    },
    {
      title: 'Profile',
      description: 'Update your personal information and account password.',
      icon: 'account-circle-outline',
      screen: 'Profile',
    },
  ];

  const handleModulePress = (screen) => {
    if (!screen) {
      return;
    }

    navigation.navigate(screen);
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
          <Text style={styles.headerTitle}>Dashboard</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.innerContent}>
          <View style={styles.heroCard}>
            <Text style={styles.heroTitle}>Welcome back, Admin User</Text>
            <Text style={styles.heroDescription}>
              Monitor operations and open modules directly from one place.
            </Text>
            <TouchableOpacity style={styles.heroButton} activeOpacity={0.85}>
              <Text style={styles.heroButtonText}>Full Access</Text>
            </TouchableOpacity>
          </View>

          {moduleCards.map((item, index) => (
            <View
              key={index}
              style={styles.moduleCard}
            >
              <View style={styles.moduleHeader}>
                <MaterialCommunityIcons
                  name={item.icon}
                  size={20}
                  color={COLORS.gray600}
                  style={styles.moduleHeaderIcon}
                />
                <Text style={styles.moduleTitle}>{item.title}</Text>
              </View>
              <Text style={styles.moduleDescription}>{item.description}</Text>
              <TouchableOpacity
                style={styles.moduleButton}
                onPress={() => handleModulePress(item.screen)}
                activeOpacity={0.8}
              >
                <Text style={styles.moduleButtonText}>Access Module</Text>
                <MaterialCommunityIcons
                  name="arrow-right"
                  size={20}
                  color={COLORS.textPrimary}
                />
              </TouchableOpacity>
            </View>
          ))}

          <View style={styles.accountCard}>
            <Text style={styles.accountTitle}>Account Information</Text>
            <Text style={styles.accountRow}>
              <Text style={styles.accountLabel}>Role:</Text> No Role Assigned
            </Text>
            <Text style={styles.accountRow}>
              <Text style={styles.accountLabel}>Permissions:</Text> Full Access
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginRight: SPACING.md,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  content: {
    flex: 1,
    backgroundColor: '#fcfcfa',
  },
  innerContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xxxl,
  },
  heroCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    paddingHorizontal: 20,
    paddingVertical: 24,
    marginBottom: SPACING.lg,
  },
  heroTitle: {
    fontSize: 22,
    lineHeight: 30,
    fontWeight: '700',
    color: '#181818',
  },
  heroDescription: {
    marginTop: 18,
    fontSize: 15,
    lineHeight: 22,
    color: '#6d6d6d',
    maxWidth: '92%',
  },
  heroButton: {
    alignSelf: 'flex-start',
    marginTop: 18,
    backgroundColor: '#2453e6',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  heroButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
  },
  moduleCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginBottom: SPACING.lg,
  },
  moduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moduleHeaderIcon: {
    marginRight: 10,
  },
  moduleTitle: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '700',
    color: '#171717',
  },
  moduleDescription: {
    marginTop: 22,
    marginBottom: 18,
    fontSize: 15,
    lineHeight: 22,
    color: '#6d6d6d',
  },
  moduleButton: {
    height: 32,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dfdfdf',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
  },
  moduleButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111111',
  },
  accountCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    paddingHorizontal: 20,
    paddingVertical: 22,
    marginBottom: SPACING.lg,
  },
  accountTitle: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '700',
    color: '#171717',
    marginBottom: 22,
  },
  accountRow: {
    fontSize: 15,
    lineHeight: 24,
    color: '#161616',
    marginBottom: 8,
  },
  accountLabel: {
    fontWeight: '700',
  },
});