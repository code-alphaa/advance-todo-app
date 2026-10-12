import React, { useEffect, useRef, useState } from 'react';
import {
  Modal,
  View,
  FlatList,
  ScrollView,
  Image,
  StyleSheet,
  Platform,
  useWindowDimensions,
  ActivityIndicator,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useVideoPlayer, VideoView } from 'expo-video';
import { WebView } from 'react-native-webview';
import { X, FileText } from 'lucide-react-native';
import { Text } from './ScaledText';
import { PressableScale } from './PressableScale';
import { getNoteMediaKind, getNoteMediaName, resolveNoteMediaUri } from '../utils/noteMedia';

interface MediaViewerModalProps {
  isOpen: boolean;
  media: string[];
  initialIndex?: number;
  onClose: () => void;
}

// Full-screen viewer for note attachments: zoomable images, a video player and a PDF reader
export const MediaViewerModal: React.FC<MediaViewerModalProps> = ({
  isOpen,
  media,
  initialIndex = 0,
  onClose,
}) => {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const listRef = useRef<FlatList<string>>(null);

  useEffect(() => {
    if (isOpen) setActiveIndex(initialIndex);
  }, [isOpen, initialIndex]);

  const handleScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    if (index !== activeIndex) setActiveIndex(index);
  };

  const current = media[activeIndex];

  return (
    <Modal
      visible={isOpen}
      animationType="fade"
      presentationStyle="overFullScreen"
      transparent
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <StatusBar style="light" />

        <FlatList
          ref={listRef}
          data={media}
          keyExtractor={(uri, idx) => `${uri}_${idx}`}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={Math.min(initialIndex, Math.max(media.length - 1, 0))}
          getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
          onMomentumScrollEnd={handleScrollEnd}
          renderItem={({ item, index }) => (
            <View style={{ width, height }}>
              <MediaPage
                uri={item}
                isActive={index === activeIndex}
                topInset={insets.top + 56}
                bottomInset={insets.bottom}
              />
            </View>
          )}
        />

        {/* Top bar */}
        <View style={[styles.topBar, { paddingTop: insets.top + 8 }]} pointerEvents="box-none">
          <PressableScale
            onPress={onClose}
            activeScale={0.85}
            hitSlop={10}
            style={styles.closeButton}
            accessibilityLabel="Close viewer"
          >
            <X size={22} color="#FFFFFF" strokeWidth={2.4} />
          </PressableScale>

          <View style={styles.titleBlock}>
            {current ? (
              <Text style={styles.titleText} numberOfLines={1}>
                {getNoteMediaName(current)}
              </Text>
            ) : null}
            {media.length > 1 && (
              <Text style={styles.counterText}>
                {activeIndex + 1} of {media.length}
              </Text>
            )}
          </View>

          <View style={styles.closeButtonSpacer} />
        </View>
      </View>
    </Modal>
  );
};

interface MediaPageProps {
  uri: string;
  isActive: boolean;
  topInset: number;
  bottomInset: number;
}

const MediaPage: React.FC<MediaPageProps> = ({ uri, isActive, topInset, bottomInset }) => {
  const resolvedUri = resolveNoteMediaUri(uri);
  const kind = getNoteMediaKind(uri);

  if (kind === 'video') return <VideoPage uri={resolvedUri} isActive={isActive} />;
  if (kind === 'pdf') return <PdfPage uri={resolvedUri} topInset={topInset} bottomInset={bottomInset} />;
  return <ImagePage uri={resolvedUri} />;
};

// Pinch to zoom (native ScrollView zooming on iOS)
const ImagePage: React.FC<{ uri: string }> = ({ uri }) => {
  const { width, height } = useWindowDimensions();
  return (
    <ScrollView
      style={StyleSheet.absoluteFill}
      maximumZoomScale={4}
      minimumZoomScale={1}
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      centerContent
      bouncesZoom
    >
      <Image source={{ uri }} style={{ width, height }} resizeMode="contain" />
    </ScrollView>
  );
};

const VideoPage: React.FC<{ uri: string; isActive: boolean }> = ({ uri, isActive }) => {
  const player = useVideoPlayer(uri, (p) => {
    p.loop = false;
  });

  // Only the visible page plays; swiping away pauses it
  useEffect(() => {
    if (isActive) player.play();
    else player.pause();
  }, [isActive, player]);

  return (
    <View style={styles.centerFill}>
      <VideoView
        player={player}
        style={styles.video}
        contentFit="contain"
        nativeControls
        fullscreenOptions={{ enable: true }}
        allowsPictureInPicture={false}
      />
    </View>
  );
};

const PdfPage: React.FC<{ uri: string; topInset: number; bottomInset: number }> = ({
  uri,
  topInset,
  bottomInset,
}) => {
  // Android's WebView can't render PDFs natively
  if (Platform.OS !== 'ios') {
    return (
      <View style={styles.centerFill}>
        <FileText size={48} color="#FFFFFF" />
        <Text style={styles.unsupportedText}>PDF preview is only available on iOS</Text>
      </View>
    );
  }

  const folderUri = uri.slice(0, uri.lastIndexOf('/') + 1);

  return (
    <View style={[styles.pdfWrap, { paddingTop: topInset, paddingBottom: bottomInset }]}>
      <WebView
        source={{ uri }}
        originWhitelist={['*']}
        allowFileAccess
        allowingReadAccessToURL={folderUri}
        style={styles.pdf}
        startInLoadingState
        renderLoading={() => (
          <View style={[StyleSheet.absoluteFill, styles.centerFill]}>
            <ActivityIndicator color="#FFFFFF" />
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingBottom: 10,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonSpacer: {
    width: 38,
  },
  titleBlock: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  titleText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  counterText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },
  centerFill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  video: {
    width: '100%',
    height: '75%',
  },
  pdfWrap: {
    flex: 1,
    backgroundColor: '#1C1C1E',
  },
  pdf: {
    flex: 1,
    backgroundColor: '#1C1C1E',
  },
  unsupportedText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    fontWeight: '600',
  },
});
