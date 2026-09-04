import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { SPACING, RADIUS, FONT, COMPONENT } from '../theme/theme';

const TABS = [
  { key: 'map', label: 'Map', icon: 'map-outline', iconActive: 'map' },
  { key: 'connect', label: 'Connect', icon: 'git-network-outline', iconActive: 'git-network' },
  { key: 'report', label: 'Report', icon: 'alert-circle-outline', iconActive: 'alert-circle' },
];

export default function BottomNavigation({ activeTab, onTabPress }) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.navBackground, borderTopColor: colors.navBorder }, colors.shadowMd]}>
      {TABS.map(tab => {
        const isActive = activeTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tab}
            onPress={() => onTabPress(tab.key)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isActive ? tab.iconActive : tab.icon}
              size={COMPONENT.iconSizeLg}
              color={isActive ? colors.navActiveColor : colors.navInactiveColor}
            />
            <Text style={[
              styles.label,
              { color: isActive ? colors.navActiveColor : colors.navInactiveColor },
              isActive && styles.labelActive,
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: COMPONENT.navBarHeight,
    borderTopWidth: 1,
    paddingBottom: 2,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: SPACING.xs,
  },
  label: {
    fontSize: 11,
    fontWeight: FONT.regular,
    marginTop: 2,
  },
  labelActive: {
    fontWeight: FONT.medium,
  },
});
