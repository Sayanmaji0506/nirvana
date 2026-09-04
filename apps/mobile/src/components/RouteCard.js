import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { SPACING, RADIUS, FONT, TYPE } from '../theme/theme';

export default function RouteCard({
  routeName,
  routeLabel,
  isActive,
  durationMin,
  distanceKm,
  safetyScore,
  warningMessage,
  onStartDrive,
  isDriverRole,
  onViewReports,
  reportCount,
}) {
  const { colors } = useTheme();
  const [expanded, setExpanded] = useState(true);

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
      {/* Drag handle */}
      <TouchableOpacity style={styles.handleWrap} onPress={() => setExpanded(!expanded)} activeOpacity={0.8}>
        <View style={[styles.handle, { backgroundColor: colors.textTertiary }]} />
      </TouchableOpacity>

      {/* Header row */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Text style={[styles.routeLabel, { color: colors.accent }]}>
            {routeLabel || 'ROUTEGUARD ACTIVE RUN'}
          </Text>
          <Text style={[TYPE.h3, { color: colors.textPrimary }]} numberOfLines={1}>
            {routeName || 'Guwahati — Shillong (NH-6)'}
          </Text>
        </View>
        {isActive !== undefined && (
          <View style={[styles.statusPill, { backgroundColor: isActive ? 'rgba(34,197,94,0.1)' : colors.accentLight }]}>
            <View style={[styles.statusDot, { backgroundColor: isActive ? colors.success : colors.textTertiary }]} />
            <Text style={[styles.statusLabel, { color: isActive ? colors.success : colors.textSecondary }]}>
              {isActive ? 'Active' : 'Inactive'}
            </Text>
          </View>
        )}
      </View>

      {expanded && (
        <>
          {/* Metrics row */}
          <View style={[styles.metricsRow, { backgroundColor: colors.background }]}>
            <View style={styles.metric}>
              <Text style={[styles.metricValue, { color: colors.textPrimary }]}>
                {durationMin || '185'}
              </Text>
              <Text style={[styles.metricUnit, { color: colors.textSecondary }]}>min</Text>
              <Text style={[styles.metricLabel, { color: colors.textTertiary }]}>EST. DURATION</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.metric}>
              <Text style={[styles.metricValue, { color: colors.textPrimary }]}>
                {distanceKm || '104.2'}
              </Text>
              <Text style={[styles.metricUnit, { color: colors.textSecondary }]}>km</Text>
              <Text style={[styles.metricLabel, { color: colors.textTertiary }]}>DISTANCE</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.metric}>
              <Text style={[styles.metricValue, { color: safetyScore >= 80 ? colors.success : colors.warning }]}>
                {safetyScore || '92'}
              </Text>
              <Text style={[styles.metricUnit, { color: colors.textSecondary }]}>%</Text>
              <Text style={[styles.metricLabel, { color: colors.textTertiary }]}>SAFETY SCORE</Text>
            </View>
          </View>

          {/* Warning message */}
          {warningMessage && (
            <View style={[styles.warningRow, { backgroundColor: colors.dangerLight }]}>
              <Ionicons name="information-circle-outline" size={16} color={colors.danger} />
              <Text style={[styles.warningText, { color: colors.danger }]} numberOfLines={2}>
                {warningMessage}
              </Text>
            </View>
          )}

          {/* Action row */}
          <View style={styles.actionRow}>
            {onViewReports && (
              <TouchableOpacity style={[styles.secondaryBtn, { borderColor: colors.border }]} onPress={onViewReports}>
                <Text style={[styles.secondaryBtnText, { color: colors.textSecondary }]}>
                  Reports ({reportCount || 0})
                </Text>
              </TouchableOpacity>
            )}
            {onStartDrive && (
              <TouchableOpacity
                style={[styles.primaryBtn, { backgroundColor: isDriverRole ? colors.accent : colors.textTertiary }]}
                onPress={onStartDrive}
                activeOpacity={0.8}
              >
                <Ionicons name="navigate" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.primaryBtnText}>
                  {isDriverRole ? 'Start Drive' : 'View Only'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.base,
  },
  handleWrap: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  headerLeft: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  routeLabel: {
    fontSize: 11,
    fontWeight: FONT.medium,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: SPACING.xs,
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: FONT.medium,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.base,
    marginBottom: SPACING.md,
  },
  metric: {
    flex: 1,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 22,
    fontWeight: FONT.medium,
  },
  metricUnit: {
    fontSize: 13,
    fontWeight: FONT.regular,
    marginTop: -2,
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: FONT.medium,
    letterSpacing: 0.5,
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: 32,
  },
  warningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
  },
  warningText: {
    fontSize: 12,
    fontWeight: FONT.regular,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  actionRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  secondaryBtn: {
    flex: 1,
    height: 40,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    fontSize: 13,
    fontWeight: FONT.medium,
  },
  primaryBtn: {
    flex: 2,
    height: 40,
    borderRadius: RADIUS.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: FONT.medium,
  },
});
