import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { SPACING, RADIUS, FONT, COMPONENT } from '../theme/theme';

export default function SearchBar({ value, onChangeText, onMenuPress, placeholder }) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }, colors.shadowMd]}>
      <TouchableOpacity onPress={onMenuPress} style={styles.iconWrap} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Ionicons name="menu-outline" size={COMPONENT.iconSizeLg} color={colors.textPrimary} />
      </TouchableOpacity>

      <TextInput
        style={[styles.input, { color: colors.textPrimary }]}
        placeholder={placeholder || 'Search destination...'}
        placeholderTextColor={colors.textTertiary}
        value={value}
        onChangeText={onChangeText}
      />

      <View style={styles.rightIcons}>
        <Ionicons name="search-outline" size={COMPONENT.iconSize} color={colors.textSecondary} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: COMPONENT.inputHeight,
    borderRadius: RADIUS.xl,
    paddingHorizontal: SPACING.base,
  },
  iconWrap: {
    marginRight: SPACING.md,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: FONT.regular,
    padding: 0,
  },
  rightIcons: {
    marginLeft: SPACING.sm,
  },
});
