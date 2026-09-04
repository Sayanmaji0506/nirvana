import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { SPACING, RADIUS, FONT, TYPE } from '../theme/theme';

export default function LandingScreen({ onSelectRole, onLogin }) {
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <View style={[styles.logoWrap, { backgroundColor: colors.accentLight }]}>
            <Ionicons name="navigate" size={32} color={colors.accent} />
          </View>
          <Text style={[TYPE.h1, styles.title, { color: colors.textPrimary }]}>NIRVANA</Text>
          <Text style={[TYPE.bodySmall, styles.subtitle, { color: colors.textSecondary }]}>
            Smart logistics and route safety{'\n'}for Northeast India corridors
          </Text>
        </View>

        {/* Portal cards */}
        <View style={styles.cardContainer}>
          <TouchableOpacity
            style={[styles.portalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            activeOpacity={0.7}
            onPress={() => onSelectRole('driver')}
          >
            <View style={[styles.portalIcon, { backgroundColor: colors.accentLight }]}>
              <Ionicons name="car-outline" size={24} color={colors.accent} />
            </View>
            <View style={styles.portalTextWrap}>
              <Text style={[TYPE.label, { color: colors.textPrimary }]}>Sign up as Driver</Text>
              <Text style={[TYPE.caption, { color: colors.textSecondary }]}>
                Route navigation, live reroutes and safe spots
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.portalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            activeOpacity={0.7}
            onPress={() => onSelectRole('reporter')}
          >
            <View style={[styles.portalIcon, { backgroundColor: 'rgba(245,158,11,0.08)' }]}>
              <Ionicons name="megaphone-outline" size={24} color="#F59E0B" />
            </View>
            <View style={styles.portalTextWrap}>
              <Text style={[TYPE.label, { color: colors.textPrimary }]}>Sign up as Reporter</Text>
              <Text style={[TYPE.caption, { color: colors.textSecondary }]}>
                Report road hazards and view community map
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
          </TouchableOpacity>
        </View>

        {/* Login link */}
        <TouchableOpacity style={styles.loginLink} onPress={onLogin} activeOpacity={0.6}>
          <Text style={[TYPE.bodySmall, { color: colors.textSecondary }]}>
            Already have an account?{' '}
            <Text style={{ color: colors.accent, fontWeight: FONT.medium }}>Sign In</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xxxl,
  },
  logoWrap: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.base,
  },
  title: {
    letterSpacing: 2,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    textAlign: 'center',
    lineHeight: 20,
  },
  cardContainer: {
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  portalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.base,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
  },
  portalIcon: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  portalTextWrap: {
    flex: 1,
  },
  loginLink: {
    alignItems: 'center',
    paddingVertical: SPACING.base,
  },
});
