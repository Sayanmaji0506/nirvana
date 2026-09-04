import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { SPACING, RADIUS, FONT, TYPE, COMPONENT } from '../theme/theme';
import PrimaryButton from '../components/PrimaryButton';
import apiClient from '../services/apiClient';

const CATEGORIES = [
  { id: 'landslide', label: 'Landslide', icon: 'earth' },
  { id: 'blockage', label: 'Blockage', icon: 'construct' },
  { id: 'flood', label: 'Flooding', icon: 'water' },
  { id: 'other', label: 'Other', icon: 'warning' },
];

export default function ReportModal({ visible, onClose, currentUser, onReportCreated }) {
  const { colors } = useTheme();
  const [category, setCategory] = useState('landslide');
  const [description, setDescription] = useState('');
  const [hasImage, setHasImage] = useState(false);
  const [hasAudio, setHasAudio] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!description && !hasImage && !hasAudio) {
      Alert.alert('Required', 'Please provide a description, image, or audio note');
      return;
    }

    setLoading(true);
    try {
      const reportPayload = {
        category,
        type: category,
        description: description || `Severe ${category} obstruction reported by local operator`,
        lat: 25.8730,
        lng: 91.8860,
        user_id: currentUser?.id,
        hasAudioAttachment: hasAudio,
        hasImageAttachment: hasImage,
      };

      const result = await apiClient.submitReport(reportPayload);
      Alert.alert(
        'Report Logged',
        result.synced
          ? 'Hazard report broadcast to NIRVANA network.'
          : 'Offline: Report stored locally. Will sync when online.'
      );

      setDescription('');
      setHasImage(false);
      setHasAudio(false);
      onClose();
      if (onReportCreated) onReportCreated(result);
    } catch (err) {
      Alert.alert('Error', 'Could not record report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.content, { backgroundColor: colors.surface }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[TYPE.h3, { color: colors.textPrimary }]}>Submit Report</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Categories */}
          <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>CATEGORY</Text>
          <View style={styles.categoryRow}>
            {CATEGORIES.map(c => (
              <TouchableOpacity
                key={c.id}
                style={[
                  styles.categoryChip,
                  { backgroundColor: colors.background, borderColor: colors.border },
                  category === c.id && { backgroundColor: colors.accentLight, borderColor: colors.accent },
                ]}
                onPress={() => setCategory(c.id)}
              >
                <Ionicons
                  name={c.icon}
                  size={16}
                  color={category === c.id ? colors.accent : colors.textSecondary}
                />
                <Text style={[
                  styles.chipLabel,
                  { color: category === c.id ? colors.accent : colors.textSecondary },
                ]}>
                  {c.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Description */}
          <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>DESCRIPTION</Text>
          <TextInput
            style={[styles.textInput, { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.border }]}
            multiline={true}
            numberOfLines={4}
            placeholder="Describe the obstruction..."
            placeholderTextColor={colors.textTertiary}
            value={description}
            onChangeText={setDescription}
          />

          {/* Media toggles */}
          <View style={styles.mediaRow}>
            <TouchableOpacity
              style={[styles.mediaBtn, { borderColor: hasAudio ? colors.success : colors.border }]}
              onPress={() => setHasAudio(!hasAudio)}
            >
              <Ionicons name={hasAudio ? 'checkmark-circle' : 'mic-outline'} size={16} color={hasAudio ? colors.success : colors.textSecondary} />
              <Text style={[styles.mediaBtnText, { color: hasAudio ? colors.success : colors.textSecondary }]}>
                {hasAudio ? 'Audio attached' : 'Voice note'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.mediaBtn, { borderColor: hasImage ? colors.success : colors.border }]}
              onPress={() => setHasImage(!hasImage)}
            >
              <Ionicons name={hasImage ? 'checkmark-circle' : 'camera-outline'} size={16} color={hasImage ? colors.success : colors.textSecondary} />
              <Text style={[styles.mediaBtnText, { color: hasImage ? colors.success : colors.textSecondary }]}>
                {hasImage ? 'Photo attached' : 'Add photo'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Offline notice */}
          <View style={[styles.offlineNotice, { backgroundColor: colors.accentLight }]}>
            <Ionicons name="cloud-offline-outline" size={14} color={colors.accent} />
            <Text style={[styles.offlineText, { color: colors.accent }]}>
              Offline-ready: auto-saves locally and syncs when online
            </Text>
          </View>

          {/* Submit */}
          <PrimaryButton
            title="Submit Report"
            onPress={handleSubmit}
            loading={loading}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  content: {
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: FONT.medium,
    letterSpacing: 0.5,
    marginBottom: SPACING.sm,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.base,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    gap: SPACING.xs,
  },
  chipLabel: {
    fontSize: 12,
    fontWeight: FONT.medium,
  },
  textInput: {
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    fontSize: 14,
    fontWeight: FONT.regular,
    borderWidth: 1,
    textAlignVertical: 'top',
    height: 80,
    marginBottom: SPACING.base,
  },
  mediaRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  mediaBtn: {
    flex: 1,
    height: 40,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
  },
  mediaBtnText: {
    fontSize: 12,
    fontWeight: FONT.medium,
  },
  offlineNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.base,
    gap: SPACING.xs,
  },
  offlineText: {
    fontSize: 11,
    fontWeight: FONT.regular,
  },
});
