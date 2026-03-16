import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { store } from './store/store';
import { COLORS, FONTS } from './constants/theme';
import { bootstrapAuth, selectAuthInitialized, selectIsAuthenticated } from './store/authSlice';

import SignInScreen from './screens/SignInScreen';
import DashboardScreen from './screens/DashboardScreen';
import OrdersScreen from './screens/OrdersScreen';
import ProductsScreen from './screens/ProductsScreen';
import CustomersScreen from './screens/CustomersScreen';
import ReportsScreen from './screens/ReportsScreen';
import SettingsScreen from './screens/SettingsScreen';
import TransportScreen from './screens/TransportScreen';
import WarehouseInventoryScreen from './screens/WarehouseInventoryScreen';
import WarehouseMasterScreen from './screens/WarehouseMasterScreen';
import UserManagementScreen from './screens/UserManagementScreen';
import RawMaterialsScreen from './screens/RawMaterialsScreen';

const Stack = createNativeStackNavigator();

function RootNavigator() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const authInitialized = useSelector(selectAuthInitialized);

  useEffect(() => {
    dispatch(bootstrapAuth());
  }, [dispatch]);

  if (!authInitialized) {
    return (
      <View style={styles.loaderWrap}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {isAuthenticated ? (
          <>
            <Stack.Screen
              name="Dashboard"
              component={DashboardScreen}
            />
            <Stack.Screen
              name="Orders"
              component={OrdersScreen}
            />
            <Stack.Screen
              name="Products"
              component={ProductsScreen}
            />
            <Stack.Screen
              name="Customers"
              component={CustomersScreen}
            />
            <Stack.Screen
              name="Reports"
              component={ReportsScreen}
            />
            <Stack.Screen
              name="Settings"
              component={SettingsScreen}
            />
            <Stack.Screen
              name="Transport"
              component={TransportScreen}
            />
            <Stack.Screen
              name="WarehouseInventory"
              component={WarehouseInventoryScreen}
            />
            <Stack.Screen
              name="WarehouseMaster"
              component={WarehouseMasterScreen}
            />
            <Stack.Screen
              name="UserManagement"
              component={UserManagementScreen}
            />
            <Stack.Screen
              name="RawMaterials"
              component={RawMaterialsScreen}
            />
          </>
        ) : (
          <Stack.Screen
            name="SignIn"
            component={SignInScreen}
          />
        )}
      </Stack.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <RootNavigator />
    </Provider>
  );
}

const styles = StyleSheet.create({
  loaderWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
});
