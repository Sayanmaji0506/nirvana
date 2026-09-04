import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { SPACING, RADIUS, FONT, TYPE, COMPONENT } from '../theme/theme';
import InteractiveMap from '../components/InteractiveMap';
import PrimaryButton from '../components/PrimaryButton';

export default function DriveModeScreen({
  activeRoute,
  alternateRoute,
  roadFeatures,
  reports,
  rerouteAlert,
  onAcceptAlternate,
  onDismissAlert,
  onStopDrive,
  onOpenReport,
}) {
  const { colors } = useTheme();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const turnByTurn = alternateRoute?.turnByTurn || activeRoute?.turnByTurn || [
    'Ascend NH-6 through Ri-Bhoi mountain corridor',
    'Follow Shangbangla bypass diversion route',
    'Arrive at destination: Shillong',
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Full-screen map */}
      <View style={styles.mapWrapper}>
        <InteractiveMap
          roadFeatures={roadFeatures}
          activeRoute={activeRoute}
          alternateRoute={alternateRoute}
          reports={reports}
          isDriveMode={true}
        />
      </View>

      {/* Top overlay */}
      <SafeAreaView style={styles.topOverlay}>
        <View style={styles.topRow}>
          <View style={[styles.liveBadge, { backgroundColor: colors.success }]}>
            <View style={styles.pulseDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>

          <TouchableOpacity
            style={[styles.reportBtn, { backgroundColor: colors.danger }]}
            onPress={onOpenReport}
          >
            <Ionicons name="alert-circle" size={16} color="#FFFFFF" />
            <Text style={styles.reportBtnText}>Report</Text>
          </TouchableOpacity>
        </View>

        {/* Turn instruction */}
        <View style={[styles.turnCard, { backgroundColor: colors.surface }, colors.shadow]}>
          <Ionicons name="navigate" size={22} color={colors.accent} style={{ marginRight: SPACING.md }} />
          <View style={styles.turnTextWrap}>
            <Text style={[styles.turnLabel, { color: colors.textTertiary }]}>NEXT STEP</Text>
            <Text style={[TYPE.body, { color: colors.textPrimary }]} numberOfLines={2}>
              {turnByTurn[currentStepIndex] || 'Continue on NH-6'}
            </Text>
          </View>
        </View>
      </SafeAreaView>

      {/* Bottom bar */}
      <SafeAreaView style={styles.bottomOverlay}>
        <View style={[styles.bottomBar, { backgroundColor: colors.surface }, colors.shadowMd]}>
          <TouchableOpacity style={styles.navAction}>
            <Ionicons name="locate" size={COMPONENT.iconSizeLg} color={colors.textSecondary} />
            <Text style={[styles.navLabel, { color: colors.textSecondary }]}>GPS</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navAction}
            onPress={() => {
              if (currentStepIndex < turnByTurn.length - 1) {
                setCurrentStepIndex(currentStepIndex + 1);
              }
            }}
          >
            <Ionicons name="arrow-forward-circle" size={COMPONENT.iconSizeLg} color={colors.textSecondary} />
            <Text style={[styles.navLabel, { color: colors.textSecondary }]}>Next</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.stopBtn, { backgroundColor: colors.danger }]}
            onPress={onStopDrive}
            activeOpacity={0.8}
          >
            <Ionicons name="stop" size={18} color="#FFFFFF" />
            <Text style={styles.stopText}>Stop Drive</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Emergency reroute modal */}
      {rerouteAlert && (
        <Modal visible={true} transparent={true} animationType="fade">
          <View style={styles.alertBackdrop}>
            <View style={[styles.alertCard, { backgroundColor: colors.surface, borderColor: colors.danger }]}>
              <View style={styles.alertHeader}>
                <Ionicons name="warning" size={24} color={colors.danger} />
                <Text style={[TYPE.h3, { color: colors.danger, marginLeft: SPACING.sm, flex: 1 }]}>
                  Hazard Detected
                </Text>
              </View>

              <Text style={[TYPE.body, { color: colors.textPrimary, marginBottom: SPACING.base }]}>
                {rerouteAlert.message}
              </Text>

              {rerouteAlert.alternateRoute ? (
                <View style={[styles.alternateBox, { backgroundColor: colors.accentLight, borderColor: colors.accent }]}>
                  <Text style={[TYPE.label, { color: colors.accent, marginBottom: SPACING.xs }]}>
                    Safe Alternate Route Found
                  </Text>
                  <Text style={[TYPE.bodySmall, { color: colors.textSecondary, marginBottom: SPACING.md }]}>
                    East Ri-Bhoi Bypass Diversion{'\n'}
                    Distance: {rerouteAlert.alternateRoute.distanceKm} km{'\n'}
                    Avoids: {rerouteAlert.blockedSegment?.name || 'Shangbangla Landslide'}
                  </Text>
                  <PrimaryButton
                    title="Accept Alternate Route"
                    onPress={onAcceptAlternate}
                  />
                </View>
              ) : (
                <View style={[styles.alternateBox, { backgroundColor: colors.dangerLight, borderColor: colors.danger }]}>
                  <Text style={[TYPE.label, { color: colors.danger, marginBottom: SPACING.xs }]}>
                    No Safe Alternate
                  </Text>
                  <Text style={[TYPE.bodySmall, { color: colors.textSecondary }]}>
                    Pull over at nearest safe spot:{'\n'}
                    Nongpoh Safe Haven (KM 52){'\n'}
                    Umling Rest Station (KM 38)
                  </Text>
                </View>
              )}

              <TouchableOpacity style={styles.dismissBtn} onPress={onDismissAlert}>
                <Text style={[TYPE.bodySmall, { color: colors.textTertiary }]}>Dismiss</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapWrapper: {
    ...StyleSheet.absoluteFillObject,
  },
  topOverlay: {
    position: 'absolute',
    top: 10,
    left: SPACING.base,
    right: SPACING.base,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.full,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
    marginRight: SPACING.xs,
  },
  liveText: {
    color: '#FFFFFF',
    fontWeight: FONT.medium,
    fontSize: 11,
    letterSpacing: 0.5,
  },
  reportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.full,
    gap: 4,
  },
  reportBtnText: {
    color: '#FFFFFF',
    fontWeight: FONT.medium,
    fontSize: 12,
  },
  turnCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.base,
    borderRadius: RADIUS.lg,
  },
  turnTextWrap: {
    flex: 1,
  },
  turnLabel: {
    fontSize: 10,
    fontWeight: FONT.medium,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  bottomOverlay: {
    position: 'absolute',
    bottom: SPACING.lg,
    left: SPACING.base,
    right: SPACING.base,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: RADIUS.xl,
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
  },
  navAction: {
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
  },
  navLabel: {
    fontSize: 10,
    fontWeight: FONT.regular,
    marginTop: 2,
  },
  stopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm + 2,
    borderRadius: RADIUS.lg,
    gap: 6,
  },
  stopText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: FONT.medium,
  },
  alertBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  alertCard: {
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    width: '100%',
    maxWidth: 380,
    borderWidth: 1,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  alternateBox: {
    borderRadius: RADIUS.lg,
    padding: SPACING.base,
    borderWidth: 1,
    marginBottom: SPACING.md,
  },
  dismissBtn: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
});
