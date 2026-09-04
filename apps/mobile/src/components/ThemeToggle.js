import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { RADIUS } from '../theme/theme';

export default function ThemeToggle() {
  const { isDark, toggleTheme, colors } = useTheme();

  return (
    <TouchableOpacity onPress={toggleTheme} activeOpacity={0.7}>
      <View style={[styles.track, { backgroundColor: isDark ? colors.accent : colors.border }]}>
        <View style={[
          styles.thumb,
          { backgroundColor: '#FFFFFF' },
          isDark && styles.thumbActive,
        ]} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  track: {
    width: 44,
    height: 24,
    borderRadius: RADIUS.full,
    padding: 2,
    justifyContent: 'center',
  },
  thumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  thumbActive: {
    alignSelf: 'flex-end',
  },
});
