import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { SPACING, RADIUS, FONT, COMPONENT } from '../theme/theme';

export default function PrimaryButton({ title, onPress, loading, disabled, variant, style }) {
  const { colors } = useTheme();

  const isOutline = variant === 'outline';
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: isOutline ? 'transparent' : colors.accent },
        isOutline && { borderWidth: 1, borderColor: colors.border },
        isDisabled && { opacity: 0.5 },
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={isOutline ? colors.accent : '#FFFFFF'} size="small" />
      ) : (
        <Text style={[
          styles.label,
          { color: isOutline ? colors.accent : '#FFFFFF' },
        ]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: COMPONENT.buttonHeight,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  label: {
    fontSize: 15,
    fontWeight: FONT.medium,
  },
});
