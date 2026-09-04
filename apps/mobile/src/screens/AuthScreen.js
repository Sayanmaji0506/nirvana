import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { SPACING, RADIUS, FONT, TYPE } from '../theme/theme';
import InputField from '../components/InputField';
import PrimaryButton from '../components/PrimaryButton';
import apiClient from '../services/apiClient';

export default function AuthScreen({ initialRole = 'driver', onAuthSuccess, onBack }) {
  const { colors } = useTheme();
  const [step, setStep] = useState('PHONE');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+919876543210');
  const [otpCode, setOtpCode] = useState('123456');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [authenticatedUser, setAuthenticatedUser] = useState(null);

  const handleRequestOTP = async () => {
    if (!phone) {
      Alert.alert('Required', 'Please enter your mobile phone number');
      return;
    }
    setLoading(true);
    try {
      await apiClient.requestOTP(phone);
      setStep('OTP');
    } catch (err) {
      setStep('OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    const cleanCode = String(otpCode || '').trim();
    if (!cleanCode) {
      Alert.alert('Required', 'Please enter your 6-digit OTP code');
      return;
    }
    setLoading(true);
    try {
      const res = await apiClient.verifyOTP(phone, cleanCode, name || 'NER Transporter', initialRole);
      setAuthenticatedUser(res.user);
      setStep('KYC');
    } catch (err) {
      const msg = err.message || err.response?.data?.error || 'Invalid OTP code';
      Alert.alert('Verification Notice', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyKYC = async (type = 'license') => {
    setLoading(true);
    try {
      const res = await apiClient.verifyKYC(type, licenseNumber || 'AS-01-2026-MOCK');
      Alert.alert('Success', 'Identity verified successfully.');
      onAuthSuccess(res.user || authenticatedUser);
    } catch (err) {
      onAuthSuccess(authenticatedUser);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* Top nav */}
          <View style={styles.topNav}>
            <TouchableOpacity onPress={onBack} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
            </TouchableOpacity>
            <View style={[styles.rolePill, { backgroundColor: colors.accentLight }]}>
              <Text style={[styles.roleLabel, { color: colors.accent }]}>
                {initialRole.toUpperCase()}
              </Text>
            </View>
          </View>

          {/* STEP 1: Phone & Name */}
          {step === 'PHONE' && (
            <View style={styles.formWrap}>
              <Text style={[TYPE.h2, { color: colors.textPrimary, marginBottom: SPACING.xs }]}>
                Mobile Registration
              </Text>
              <Text style={[TYPE.bodySmall, { color: colors.textSecondary, marginBottom: SPACING.xl }]}>
                Enter your mobile number to receive a secure login code.
              </Text>

              <InputField
                label="Full Name"
                placeholder="e.g. Ratul Sharma"
                value={name}
                onChangeText={setName}
              />
              <InputField
                label="Phone Number"
                placeholder="+919876543210"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />

              <PrimaryButton
                title="Request OTP"
                onPress={handleRequestOTP}
                loading={loading}
              />
            </View>
          )}

          {/* STEP 2: OTP Entry */}
          {step === 'OTP' && (
            <View style={styles.formWrap}>
              <Text style={[TYPE.h2, { color: colors.textPrimary, marginBottom: SPACING.xs }]}>
                Verify Code
              </Text>
              <Text style={[TYPE.bodySmall, { color: colors.textSecondary, marginBottom: SPACING.xl }]}>
                Code sent to {phone}. Demo code: 123456
              </Text>

              <InputField
                label="6-Digit OTP"
                placeholder="000000"
                value={otpCode}
                onChangeText={setOtpCode}
                keyboardType="number-pad"
                maxLength={6}
              />

              <PrimaryButton
                title="Verify OTP"
                onPress={handleVerifyOTP}
                loading={loading}
              />
            </View>
          )}

          {/* STEP 3: KYC */}
          {step === 'KYC' && (
            <View style={styles.formWrap}>
              <Text style={[TYPE.h2, { color: colors.textPrimary, marginBottom: SPACING.xs }]}>
                Identity Verification
              </Text>
              <Text style={[TYPE.bodySmall, { color: colors.textSecondary, marginBottom: SPACING.xl }]}>
                Verify your credentials for road safety compliance.
              </Text>

              {initialRole === 'driver' && (
                <>
                  <InputField
                    label="Driving License Number"
                    placeholder="AS-01-2021-0045892"
                    value={licenseNumber}
                    onChangeText={setLicenseNumber}
                  />
                  <PrimaryButton
                    title="Verify License"
                    onPress={() => handleVerifyKYC('license')}
                    loading={loading}
                    style={{ marginBottom: SPACING.md }}
                  />
                  <View style={styles.orRow}>
                    <View style={[styles.orLine, { backgroundColor: colors.border }]} />
                    <Text style={[styles.orText, { color: colors.textTertiary }]}>or</Text>
                    <View style={[styles.orLine, { backgroundColor: colors.border }]} />
                  </View>
                </>
              )}

              <PrimaryButton
                title="Verify with DigiLocker"
                onPress={() => handleVerifyKYC('digilocker')}
                loading={loading}
                variant="outline"
                style={{ marginTop: SPACING.md }}
              />

              <TouchableOpacity
                style={styles.skipBtn}
                onPress={() => onAuthSuccess(authenticatedUser)}
              >
                <Text style={[TYPE.bodySmall, { color: colors.textTertiary }]}>
                  Skip for demo
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.xl,
  },
  topNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.base,
  },
  rolePill: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  roleLabel: {
    fontSize: 11,
    fontWeight: FONT.medium,
    letterSpacing: 0.5,
  },
  formWrap: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: SPACING.xxxl,
  },
  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.sm,
  },
  orLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  orText: {
    fontSize: 12,
    fontWeight: FONT.regular,
    marginHorizontal: SPACING.md,
  },
  skipBtn: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
});
