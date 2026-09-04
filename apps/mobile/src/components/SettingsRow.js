import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { SPACING, RADIUS, FONT } from '../theme/theme';

export default function SettingsRow({ icon, label, value, onPress, rightElement }) {
  const { colors } = useTheme();

  const content = (
    <View style={[styles.row, { borderBottomColor: colors.borderLight }]}>
      {icon && (
        <View style={[styles.iconWrap, { backgroundColor: colors.background }]}>
          <Ionicons name={icon} size={18} color={colors.textSecondary} />
        </View>
      )}
      <View style={styles.labelWrap}>
        <Text style={[styles.label, { color: colors.textPrimary }]}>{label}</Text>
        {value && <Text style={[styles.value, { color: colors.textTertiary }]}>{value}</Text>}
      </View>
      {rightElement || (onPress && (
        <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
      ))}
    </View>
  );

  if (onPress) {
    return <TouchableOpacity onPress={onPress} activeOpacity={0.6}>{content}</TouchableOpacity>;
  }

  return content;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  labelWrap: {
    flex: 1,
  },
  label: {
    fontSize: 15,
    fontWeight: FONT.regular,
  },
  value: {
    fontSize: 12,
    fontWeight: FONT.regular,
    marginTop: 1,
  },
});
