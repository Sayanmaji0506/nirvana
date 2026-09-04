import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { SPACING, RADIUS, FONT, TYPE } from '../theme/theme';
import SettingsRow from '../components/SettingsRow';
import ThemeToggle from '../components/ThemeToggle';
import SectionHeader from '../components/SectionHeader';

export default function AboutScreen({ onBack }) {
  const { colors, isDark } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={onBack} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[TYPE.h3, { color: colors.textPrimary }]}>About</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* App identity */}
        <View style={styles.identitySection}>
          <View style={[styles.appIcon, { backgroundColor: colors.accentLight }]}>
            <Ionicons name="navigate" size={32} color={colors.accent} />
          </View>
          <Text style={[TYPE.h2, { color: colors.textPrimary, marginTop: SPACING.md }]}>NIRVANA</Text>
          <Text style={[TYPE.bodySmall, { color: colors.textSecondary, textAlign: 'center', marginTop: SPACING.xs }]}>
            Smart logistics and route safety for{'\n'}Northeast India hill corridors
          </Text>
          <View style={[styles.versionBadge, { backgroundColor: colors.background }]}>
            <Text style={[TYPE.caption, { color: colors.textTertiary }]}>Version 1.0.0</Text>
          </View>
        </View>

        {/* Settings */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <SectionHeader title="Preferences" />
          <SettingsRow
            icon={isDark ? 'moon' : 'sunny-outline'}
            label="Dark Mode"
            rightElement={<ThemeToggle />}
          />
          <SettingsRow
            icon="notifications-outline"
            label="Notifications"
            value="Enabled"
          />
          <SettingsRow
            icon="language-outline"
            label="Language"
            value="English"
          />
        </View>

        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <SectionHeader title="About" />
          <SettingsRow
            icon="code-outline"
            label="Smart India Hackathon"
            value="Problem SIH26002"
          />
          <SettingsRow
            icon="git-branch-outline"
            label="Stack"
            value="React Native, Express, PostGIS"
          />
          <SettingsRow
            icon="cloud-offline-outline"
            label="Architecture"
            value="Offline-first with sync"
          />
          <SettingsRow
            icon="hardware-chip-outline"
            label="AI Engine"
            value="FastAPI risk scorer"
          />
        </View>

        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <SectionHeader title="Offline Fallback" />
          <View style={styles.offlineInfo}>
            <Text style={[TYPE.bodySmall, { color: colors.textPrimary }]}>
              When mobile internet drops in deep valleys, dial or send SMS:
            </Text>
            <View style={[styles.ussdBadge, { backgroundColor: colors.accent }]}>
              <Text style={styles.ussdText}>*566#</Text>
            </View>
            <Text style={[TYPE.caption, { color: colors.textSecondary }]}>
              Example: "BLOCKED NH6 KM40 Landslide"
            </Text>
          </View>
        </View>

        <Text style={[TYPE.caption, { color: colors.textTertiary, textAlign: 'center', paddingVertical: SPACING.xl }]}>
          Built for the North Eastern Region of India
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  scrollContent: {
    paddingBottom: SPACING.xxl,
  },
  identitySection: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  appIcon: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  versionBadge: {
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  section: {
    marginHorizontal: SPACING.base,
    marginBottom: SPACING.md,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.base,
    paddingBottom: SPACING.sm,
  },
  offlineInfo: {
    paddingVertical: SPACING.sm,
  },
  ussdBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
    marginVertical: SPACING.sm,
  },
  ussdText: {
    color: '#FFFFFF',
    fontWeight: FONT.medium,
    fontSize: 16,
    letterSpacing: 1.5,
  },
});
