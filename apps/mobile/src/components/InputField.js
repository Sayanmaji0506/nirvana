import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { SPACING, RADIUS, FONT, COMPONENT } from '../theme/theme';

export default function InputField({ label, value, onChangeText, placeholder, keyboardType, maxLength, secureTextEntry, multiline, style }) {
  const { colors } = useTheme();

  return (
    <View style={[styles.wrapper, style]}>
      {label && (
        <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
      )}
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: colors.background,
            color: colors.textPrimary,
            borderColor: colors.border,
          },
          multiline && styles.multiline,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        keyboardType={keyboardType}
        maxLength={maxLength}
        secureTextEntry={secureTextEntry}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: SPACING.base,
  },
  label: {
    fontSize: 13,
    fontWeight: FONT.medium,
    marginBottom: SPACING.xs,
  },
  input: {
    height: COMPONENT.inputHeight,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    paddingHorizontal: SPACING.base,
    fontSize: 15,
    fontWeight: FONT.regular,
  },
  multiline: {
    height: 100,
    paddingTop: SPACING.md,
  },
});
