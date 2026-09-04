import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { SPACING, RADIUS, FONT, TYPE } from '../theme/theme';
import SettingsRow from '../components/SettingsRow';
import ThemeToggle from '../components/ThemeToggle';
import SectionHeader from '../components/SectionHeader';

export default function DrawerMenu({ visible, onClose, currentUser, onLogout, onOpenReports, onOpenAbout }) {
  const { colors, isDark } = useTheme();

  return (
    <Modal visible={visible} animationType="fade" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.drawer, { backgroundColor: colors.surface }]}>
          <SafeAreaView style={styles.safeArea}>
            {/* Profile header */}
            <View style={[styles.profileSection, { borderBottomColor: colors.borderLight }]}>
              <View style={[styles.avatar, { backgroundColor: colors.accentLight }]}>
                <Text style={[styles.avatarText, { color: colors.accent }]}>
                  {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'N'}
                </Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={[TYPE.h3, { color: colors.textPrimary }]}>
                  {currentUser?.name || 'NIRVANA User'}
                </Text>
                <Text style={[TYPE.caption, { color: colors.textSecondary }]}>
                  {currentUser?.phone || '+919876543210'}
                </Text>
              </View>
              <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Menu */}
            <ScrollView style={styles.menuList} showsVerticalScrollIndicator={false}>
              {/* Role badge */}
              <View style={[styles.roleBadge, { backgroundColor: colors.background }]}>
                <Ionicons name="shield-checkmark" size={16} color={colors.success} />
                <Text style={[TYPE.bodySmall, { color: colors.textPrimary, marginLeft: SPACING.sm }]}>
                  {(currentUser?.role || 'driver').toUpperCase()} — KYC {(currentUser?.kyc_status || 'verified').toUpperCase()}
                </Text>
              </View>

              <SectionHeader title="Navigation" />

              <SettingsRow
                icon="document-text-outline"
                label="Reports"
                value="View pending and verified"
                onPress={() => { onClose(); onOpenReports(); }}
              />

              <SettingsRow
                icon="information-circle-outline"
                label="About NIRVANA"
                onPress={() => { if (onOpenAbout) { onClose(); onOpenAbout(); } }}
              />

              <SectionHeader title="Preferences" />

              <SettingsRow
                icon={isDark ? 'moon' : 'sunny-outline'}
                label="Dark Mode"
                rightElement={<ThemeToggle />}
              />

              <SectionHeader title="Offline Fallback" />

              <View style={[styles.infoCard, { backgroundColor: colors.background }]}>
                <Text style={[TYPE.bodySmall, { color: colors.textPrimary, marginBottom: SPACING.xs }]}>
                  When mobile internet drops, dial or SMS:
                </Text>
                <View style={[styles.ussdBadge, { backgroundColor: colors.accent }]}>
                  <Text style={styles.ussdText}>*566#</Text>
                </View>
                <Text style={[TYPE.caption, { color: colors.textSecondary }]}>
                  SMS: "BLOCKED NH6 KM40" to Gateway
                </Text>
              </View>
            </ScrollView>

            {/* Footer */}
            <View style={[styles.footer, { borderTopColor: colors.borderLight }]}>
              <TouchableOpacity
                style={[styles.logoutBtn, { borderColor: colors.danger }]}
                onPress={onLogout}
              >
                <Ionicons name="log-out-outline" size={18} color={colors.danger} />
                <Text style={[styles.logoutText, { color: colors.danger }]}>Log Out</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>

        <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  drawer: {
    width: '80%',
    maxWidth: 320,
    height: '100%',
  },
  backdrop: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: FONT.medium,
  },
  profileInfo: {
    flex: 1,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginTop: SPACING.base,
  },
  menuList: {
    flex: 1,
  },
  infoCard: {
    padding: SPACING.md,
    borderRadius: RADIUS.md,
  },
  ussdBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
    marginVertical: SPACING.xs,
  },
  ussdText: {
    color: '#FFFFFF',
    fontWeight: FONT.medium,
    fontSize: 14,
    letterSpacing: 1,
  },
  footer: {
    paddingVertical: SPACING.base,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    gap: SPACING.sm,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: FONT.medium,
  },
});
