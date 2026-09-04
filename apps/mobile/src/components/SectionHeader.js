import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { SPACING, FONT } from '../theme/theme';

export default function SectionHeader({ title }) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.textTertiary }]}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  title: {
    fontSize: 11,
    fontWeight: FONT.medium,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
});
