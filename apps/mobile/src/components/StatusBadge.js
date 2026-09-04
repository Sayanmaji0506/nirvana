import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { SPACING, RADIUS, FONT } from '../theme/theme';

const STATUS_CONFIG = {
  clear: { icon: 'checkmark-circle', label: 'Clear', color: '#22C55E', bg: 'rgba(34,197,94,0.1)' },
  open: { icon: 'checkmark-circle', label: 'Clear', color: '#22C55E', bg: 'rgba(34,197,94,0.1)' },
  risky: { icon: 'warning', label: 'Risky', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  blocked: { icon: 'close-circle', label: 'Blocked', color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
  pending: { icon: 'time', label: 'Pending', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  verified: { icon: 'checkmark-circle', label: 'Verified', color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
};

export default function StatusBadge({ status, size }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.clear;
  const isSmall = size === 'small';

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }, isSmall && styles.badgeSmall]}>
      <Ionicons name={config.icon} size={isSmall ? 12 : 14} color={config.color} />
      <Text style={[styles.label, { color: config.color }, isSmall && styles.labelSmall]}>
        {config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    alignSelf: 'flex-start',
  },
  badgeSmall: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  label: {
    fontSize: 12,
    fontWeight: FONT.medium,
    marginLeft: SPACING.xs,
  },
  labelSmall: {
    fontSize: 10,
  },
});
