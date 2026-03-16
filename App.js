import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { COLORS, FONTS } from './constants/theme';

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

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <Stack.Navigator 
          initialRouteName="SignIn"
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen 
            name="SignIn" 
            component={SignInScreen}
          />
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
        </Stack.Navigator>
        <StatusBar style="auto" />
      </NavigationContainer>
    </Provider>
  );
}
