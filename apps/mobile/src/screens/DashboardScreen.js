import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { SPACING, RADIUS, FONT } from '../theme/theme';
import InteractiveMap from '../components/InteractiveMap';
import SearchBar from '../components/SearchBar';
import RouteCard from '../components/RouteCard';
import BottomNavigation from '../components/BottomNavigation';

export default function DashboardScreen({
  currentUser,
  roadFeatures,
  reports,
  activeRoute,
  alternateRoute,
  onStartDrive,
  onOpenReport,
  onOpenReportDashboard,
  onOpenDrawer,
  onPlanRoute,
}) {
  const { colors } = useTheme();
  const isDriver = currentUser?.role === 'driver' || currentUser?.role === 'official';

  const handleStartDrivePress = () => {
    if (!isDriver) {
      Alert.alert(
        'Driver Access Only',
        'Reporter accounts are restricted to map observation and hazard reporting. Switch to a Driver profile for active navigation.'
      );
      return;
    }
    onStartDrive();
  };

  const handleTabPress = (tab) => {
    switch (tab) {
      case 'map':
        onPlanRoute();
        break;
      case 'connect':
        onPlanRoute();
        break;
      case 'report':
        onOpenReportDashboard();
        break;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Full-screen map */}
      <View style={styles.mapContainer}>
        <InteractiveMap
          roadFeatures={roadFeatures}
          activeRoute={activeRoute}
          alternateRoute={alternateRoute}
          reports={reports}
          isDriveMode={false}
        />
      </View>

      {/* Floating search bar */}
      <SafeAreaView style={styles.searchOverlay}>
        <View style={styles.searchWrap}>
          <SearchBar
            onMenuPress={onOpenDrawer}
            placeholder="Search destination..."
          />
        </View>
      </SafeAreaView>

      {/* Floating Report Hazard FAB */}
      <View style={styles.fabWrap}>
        <TouchableOpacity
          style={[styles.floatingReportFab, { backgroundColor: colors.surface, borderColor: colors.border }, colors.shadowMd]}
          onPress={onOpenReport}
          activeOpacity={0.8}
        >
          <Ionicons name="add-circle" size={20} color={colors.danger} />
          <Text style={[styles.fabText, { color: colors.textPrimary }]}>Report Hazard</Text>
        </TouchableOpacity>
      </View>

      {/* Route info card + bottom nav */}
      <View style={styles.bottomSection}>
        <RouteCard
          routeName={activeRoute?.routeName || 'Guwahati — Shillong (NH-6)'}
          routeLabel="ROUTEGUARD ACTIVE RUN"
          isActive={true}
          durationMin={activeRoute?.durationMin || '185'}
          distanceKm={activeRoute?.distanceKm || '104.2'}
          safetyScore={activeRoute?.isAlternate ? 72 : 92}
          warningMessage={activeRoute?.isAlternate ? 'Bypass active — avoids Shangbangla landslide zone' : null}
          onStartDrive={handleStartDrivePress}
          isDriverRole={isDriver}
          onViewReports={onOpenReportDashboard}
          reportCount={reports.length}
        />
        <BottomNavigation activeTab="map" onTabPress={handleTabPress} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  searchOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  searchWrap: {
    paddingHorizontal: SPACING.base,
    paddingTop: SPACING.sm,
  },
  bottomSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  fabWrap: {
    position: 'absolute',
    bottom: 300,
    right: SPACING.base,
    zIndex: 10,
  },
  floatingReportFab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    gap: 6,
  },
  fabText: {
    fontSize: 13,
    fontWeight: FONT.medium,
  },
});
