import React from 'react';
import { View, Image, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Play, FileText } from 'lucide-react-native';
import { Text } from './ScaledText';
import { getNoteMediaKind, resolveNoteMediaUri } from '../utils/noteMedia';

interface NoteMediaThumbProps {
  uri: string;
  style?: StyleProp<ViewStyle>;
}

// Square preview tile for a note attachment (image, video or PDF)
export const NoteMediaThumb: React.FC<NoteMediaThumbProps> = ({ uri, style }) => {
  const kind = getNoteMediaKind(uri);

  if (kind === 'image') {
    return (
      <View style={[styles.tile, style]}>
        <Image source={{ uri: resolveNoteMediaUri(uri) }} style={styles.image} resizeMode="cover" />
      </View>
    );
  }

  const isVideo = kind === 'video';
  return (
    <View style={[styles.tile, styles.iconTile, { backgroundColor: isVideo ? '#1F2937' : '#7F1D1D' }, style]}>
      {isVideo ? (
        <View style={styles.playCircle}>
          <Play size={14} color="#FFFFFF" fill="#FFFFFF" />
        </View>
      ) : (
        <FileText size={22} color="#FFFFFF" />
      )}
      <Text style={styles.kindLabel}>{isVideo ? 'VIDEO' : 'PDF'}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  tile: {
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  iconTile: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  playCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 2,
  },
  kindLabel: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
});
