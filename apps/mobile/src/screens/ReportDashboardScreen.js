import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { SPACING, RADIUS, FONT, TYPE, COMPONENT } from '../theme/theme';
import StatusBadge from '../components/StatusBadge';
import apiClient from '../services/apiClient';

const REPORT_ICONS = {
  landslide: 'earth',
  blockage: 'construct',
  flood: 'water',
  other: 'warning',
};

export default function ReportDashboardScreen({ onBack, currentUser }) {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState('pending');
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadReports = async () => {
    setLoading(true);
    try {
      const data = await apiClient.fetchReports(activeTab);
      setReports(data || []);
    } catch (e) {
      console.error('Failed to load reports:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [activeTab]);

  const handleVote = async (reportId, direction) => {
    try {
      await apiClient.voteReport(reportId, direction, currentUser?.id);
      loadReports();
    } catch (e) {
      console.error('Vote failed:', e);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={onBack} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[TYPE.h3, { color: colors.textPrimary }]}>Reports</Text>
        <TouchableOpacity onPress={loadReports} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="refresh" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={[styles.tabContainer, { backgroundColor: colors.surfaceElevated }]}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'pending' && { backgroundColor: colors.surface }]}
          onPress={() => setActiveTab('pending')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'pending' ? colors.textPrimary : colors.textTertiary }]}>
            Pending
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'verified' && { backgroundColor: colors.surface }]}
          onPress={() => setActiveTab('verified')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'verified' ? colors.textPrimary : colors.textTertiary }]}>
            Verified
          </Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      {loading ? (
        <View style={styles.centerWrap}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : reports.length === 0 ? (
        <View style={styles.centerWrap}>
          <Ionicons name="shield-checkmark-outline" size={48} color={colors.textTertiary} />
          <Text style={[TYPE.h3, { color: colors.textPrimary, marginTop: SPACING.md }]}>
            No {activeTab} reports
          </Text>
          <Text style={[TYPE.bodySmall, { color: colors.textSecondary, textAlign: 'center', marginTop: SPACING.xs }]}>
            The corridor is currently reporting clear conditions.
          </Text>
        </View>
      ) : (
        <FlatList
          data={reports}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={[styles.reportCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.cardTopRow}>
                <View style={styles.typeBadge}>
                  <Ionicons
                    name={REPORT_ICONS[item.type] || 'warning'}
                    size={16}
                    color={colors.textSecondary}
                    style={{ marginRight: SPACING.xs }}
                  />
                  <Text style={[TYPE.label, { color: colors.textPrimary }]}>
                    {(item.type || 'HAZARD').toUpperCase()}
                  </Text>
                </View>
                <StatusBadge status={item.status} size="small" />
              </View>

              <Text style={[TYPE.body, { color: colors.textPrimary, marginBottom: SPACING.sm }]}>
                {item.description}
              </Text>

              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={14} color={colors.textTertiary} />
                <Text style={[TYPE.caption, { color: colors.textSecondary, marginLeft: SPACING.xs }]}>
                  {item.road_segment_name || `${item.lat}, ${item.lng}`}
                </Text>
              </View>

              <View style={[styles.cardFooter, { borderTopColor: colors.borderLight }]}>
                <Text style={[TYPE.caption, { color: colors.textTertiary }]}>
                  {item.reporter_name || 'Community'}
                </Text>
                <View style={styles.voteControls}>
                  <TouchableOpacity
                    style={[styles.voteBtn, { backgroundColor: colors.background }]}
                    onPress={() => handleVote(item.id, 'up')}
                  >
                    <Ionicons name="arrow-up" size={14} color={colors.success} />
                    <Text style={[styles.voteCount, { color: colors.textSecondary }]}>{item.upvotes || 0}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.voteBtn, { backgroundColor: colors.background }]}
                    onPress={() => handleVote(item.id, 'down')}
                  >
                    <Ionicons name="arrow-down" size={14} color={colors.danger} />
                    <Text style={[styles.voteCount, { color: colors.textSecondary }]}>{item.downvotes || 0}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: SPACING.base,
    marginVertical: SPACING.md,
    borderRadius: RADIUS.md,
    padding: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderRadius: RADIUS.sm,
  },
  tabText: {
    fontSize: 13,
    fontWeight: FONT.medium,
  },
  centerWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xxl,
  },
  listContent: {
    paddingHorizontal: SPACING.base,
    paddingBottom: SPACING.xl,
  },
  reportCard: {
    borderRadius: RADIUS.lg,
    padding: SPACING.base,
    marginBottom: SPACING.md,
    borderWidth: 1,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: SPACING.sm,
  },
  voteControls: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  voteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
    gap: 4,
  },
  voteCount: {
    fontSize: 12,
    fontWeight: FONT.medium,
  },
});
