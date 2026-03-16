import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { BORDER_RADIUS, COLORS, SPACING } from '../constants/theme';

export default function SettingsScreen() {
  const [name, setName] = useState('Admin User');
  const [phone, setPhone] = useState('1234567890');
  const [password, setPassword] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <MaterialCommunityIcons name="account-cog-outline" size={20} color={COLORS.textPrimary} style={styles.headerIcon} />
          <Text style={styles.headerTitle}>Profile Settings</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.innerContent}>
          <View style={styles.formCard}>
            <Text style={styles.cardTitle}>My Profile</Text>
            <Text style={styles.cardSubtitle}>Update your personal information and password.</Text>

            <Text style={styles.label}>Name</Text>
            <View style={styles.inputWrap}>
              <MaterialCommunityIcons name="account-outline" size={22} color="#7c7c7c" style={styles.inputIcon} />
              <TextInput value={name} onChangeText={setName} style={styles.input} placeholder="Enter your name" placeholderTextColor="#9a9a9a" />
            </View>

            <Text style={styles.label}>Phone Number</Text>
            <View style={styles.inputWrap}>
              <MaterialCommunityIcons name="phone-outline" size={22} color="#7c7c7c" style={styles.inputIcon} />
              <TextInput value={phone} onChangeText={setPhone} style={styles.input} keyboardType="phone-pad" placeholder="Enter phone number" placeholderTextColor="#9a9a9a" />
            </View>

            <Text style={styles.label}>New Password (optional)</Text>
            <View style={styles.inputWrap}>
              <MaterialCommunityIcons name="lock-outline" size={22} color="#7c7c7c" style={styles.inputIcon} />
              <TextInput value={password} onChangeText={setPassword} style={styles.input} secureTextEntry placeholder="Enter new password (leave blank to keep current)" placeholderTextColor="#9a9a9a" />
            </View>

            <TouchableOpacity style={styles.submitButton} activeOpacity={0.85}>
              <Text style={styles.submitButtonText}>Update Profile</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
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
  formCard: { backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.xl, borderWidth: 1, borderColor: COLORS.gray200, padding: 16 },
  cardTitle: { fontSize: 22, fontWeight: '700', color: '#171717' },
  cardSubtitle: { marginTop: 6, marginBottom: 22, fontSize: 14, color: '#6d6d6d', lineHeight: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#222', marginBottom: 8, marginTop: 6 },
  inputWrap: { minHeight: 56, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#dcdcdc', borderRadius: 14, backgroundColor: '#fff', paddingHorizontal: 14, marginBottom: 18 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16, color: '#171717', paddingVertical: 12 },
  submitButton: { alignSelf: 'flex-start', height: 42, borderRadius: 12, backgroundColor: '#2453e6', paddingHorizontal: 22, alignItems: 'center', justifyContent: 'center', marginTop: 6 },
  submitButtonText: { color: COLORS.white, fontSize: 15, fontWeight: '600' },
});