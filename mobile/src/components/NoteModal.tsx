import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import { CenterModal } from './CenterModal';
import { Text, TextInput } from './ScaledText';
import {
  StickyNote,
  Pin,
  Trash2,
  X,
  Check,
  Image as ImageIcon,
  Camera,
  Lock,
  Unlock,
} from 'lucide-react-native';
import { ThemeColors } from '../theme/colors';
import { INote, NoteColorId } from '../types';
import { NOTE_COLORS, NOTE_COLOR_KEYS } from '../theme/noteColors';
import { PressableScale } from './PressableScale';

// Safe dynamic loader to avoid crashing if native module is not linked in running binary
async function getImagePickerModule() {
  try {
    const ImagePicker = await import('expo-image-picker');
    if (ImagePicker && typeof ImagePicker.launchImageLibraryAsync === 'function') {
      return ImagePicker;
    }
    return null;
  } catch {
    return null;
  }
}

interface NoteModalProps {
  theme: ThemeColors;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<INote>) => void;
  onDelete?: (id: string) => void;
  note?: INote | null;
}

export const NoteModal: React.FC<NoteModalProps> = ({
  theme,
  isOpen,
  onClose,
  onSubmit,
  onDelete,
  note,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [color, setColor] = useState<NoteColorId>('default');
  const [isPinned, setIsPinned] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [media, setMedia] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      if (note) {
        setTitle(note.title || '');
        setContent(note.content || '');
        setColor(note.color || 'default');
        setIsPinned(Boolean(note.isPinned));
        setIsLocked(Boolean(note.isLocked));
        setMedia(Array.isArray(note.media) ? [...note.media] : []);
      } else {
        setTitle('');
        setContent('');
        setColor('default');
        setIsPinned(false);
        setIsLocked(false);
        setMedia([]);
      }
    }
  }, [isOpen, note]);

  const canSave = title.trim().length > 0 || content.trim().length > 0 || media.length > 0;

  const handlePickImages = async () => {
    try {
      const ImagePicker = await getImagePickerModule();
      if (!ImagePicker) {
        Alert.alert(
          'Media Picker Unavailable',
          'Photo library module is not yet compiled into the current build. Please rebuild the app with "npx expo run:ios" to enable photo attachment.'
        );
        return;
      }

      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Photo Permission Needed',
          'Please allow access to your photos to attach images to your notes.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        selectionLimit: 5,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uris = result.assets.map((a) => a.uri);
        setMedia((prev) => [...prev, ...uris]);
      }
    } catch (e) {
      console.warn('Error picking images:', e);
    }
  };

  const handleTakePhoto = async () => {
    try {
      const ImagePicker = await getImagePickerModule();
      if (!ImagePicker) {
        Alert.alert(
          'Camera Unavailable',
          'Camera module is not yet compiled into the current build. Please rebuild the app with "npx expo run:ios" to enable camera capture.'
        );
        return;
      }

      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Camera Permission Needed',
          'Please allow camera access to take photos for your notes.'
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setMedia((prev) => [...prev, result.assets[0].uri]);
      }
    } catch (e) {
      console.warn('Error taking photo:', e);
    }
  };

  const handleRemoveMedia = (index: number) => {
    setMedia((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!canSave) return;
    onSubmit({
      title: title.trim(),
      content: content.trim(),
      color,
      isPinned,
      isLocked,
      media,
    });
    onClose();
  };

  const selectedTheme = NOTE_COLORS[color] || NOTE_COLORS.default;
  const previewBg = theme.isDark ? selectedTheme.bgDark : selectedTheme.bgLight;
  const previewBorder = theme.isDark ? selectedTheme.borderDark : selectedTheme.borderLight;

  return (
    <CenterModal
      theme={theme}
      isOpen={isOpen}
      onClose={onClose}
      maxWidth={440}
      maxHeight="88%"
      avoidKeyboard={true}
    >
      {/* Header */}
      <View style={[styles.dialogHeader, { borderBottomColor: theme.border }]}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconWrap, { backgroundColor: theme.accentSubtle }]}>
            <StickyNote size={18} color={theme.accent} />
          </View>
          <View>
            <Text style={[styles.dialogTitle, { color: theme.textMain }]}>
              {note ? 'Edit Note' : 'Quick Note'}
            </Text>
            <Text style={[styles.dialogSubtitle, { color: theme.textSecondary }]}>
              {note ? 'Update your note & attachments' : 'Jot down thoughts, ideas & media'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={onClose}
          style={[styles.closeButton, { borderColor: theme.border }]}
          activeOpacity={0.7}
          accessibilityLabel="Close"
        >
          <X size={20} color={theme.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Body with keyboard & scroll handling */}
      <ScrollView
        style={styles.dialogBody}
        contentContainerStyle={styles.dialogBodyContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled={true}
        bounces={true}
      >
        {/* Title input */}
        <View style={styles.formGroup}>
          <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Title (optional)</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Brainstorm idea, Receipt, Passcodes..."
            placeholderTextColor={theme.textMuted}
            style={[
              styles.input,
              {
                color: theme.textMain,
                backgroundColor: theme.bgApp,
                borderColor: theme.border,
              },
            ]}
          />
        </View>

        {/* Content input */}
        <View style={styles.formGroup}>
          <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Note Content</Text>
          <TextInput
            value={content}
            onChangeText={setContent}
            placeholder="Write your quick note here..."
            placeholderTextColor={theme.textMuted}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            style={[
              styles.input,
              styles.textArea,
              {
                color: theme.textMain,
                backgroundColor: previewBg,
                borderColor: previewBorder,
              },
            ]}
          />
        </View>

        {/* Media Attachments Section */}
        <View style={styles.formGroup}>
          <View style={styles.mediaHeaderRow}>
            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
              Media ({media.length})
            </Text>
            <View style={styles.mediaButtonRow}>
              <TouchableOpacity
                onPress={handlePickImages}
                style={[styles.attachBtn, { backgroundColor: theme.bgApp, borderColor: theme.border }]}
                activeOpacity={0.7}
              >
                <ImageIcon size={14} color={theme.accent} />
                <Text style={[styles.attachBtnText, { color: theme.textMain }]}>Gallery</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleTakePhoto}
                style={[styles.attachBtn, { backgroundColor: theme.bgApp, borderColor: theme.border }]}
                activeOpacity={0.7}
              >
                <Camera size={14} color={theme.accent} />
                <Text style={[styles.attachBtnText, { color: theme.textMain }]}>Camera</Text>
              </TouchableOpacity>
            </View>
          </View>

          {media.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.mediaScroller}>
              {media.map((uri, idx) => (
                <View key={`${uri}_${idx}`} style={styles.mediaThumbWrap}>
                  <Image source={{ uri }} style={styles.mediaThumb} resizeMode="cover" />
                  <TouchableOpacity
                    onPress={() => handleRemoveMedia(idx)}
                    style={styles.mediaRemoveBtn}
                    activeOpacity={0.8}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  >
                    <X size={12} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Note Tint Color Palette */}
        <View style={styles.formGroup}>
          <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Note Color</Text>
          <View style={styles.paletteRow}>
            {NOTE_COLOR_KEYS.map((key) => {
              const pal = NOTE_COLORS[key];
              const isSelected = color === key;
              const swatchBg = theme.isDark ? pal.chipDark : pal.chipLight;
              const swatchBorder = theme.isDark ? pal.borderDark : pal.borderLight;

              return (
                <PressableScale
                  key={key}
                  onPress={() => setColor(key)}
                  activeScale={0.88}
                  style={[
                    styles.swatch,
                    {
                      backgroundColor: swatchBg,
                      borderColor: isSelected ? theme.accent : swatchBorder,
                      borderWidth: isSelected ? 2 : 1,
                    },
                  ]}
                  accessibilityLabel={`${pal.label} color`}
                >
                  <View style={[styles.swatchDot, { backgroundColor: pal.accent }]} />
                  {isSelected && (
                    <Check
                      size={14}
                      color={theme.accent}
                      strokeWidth={3}
                      style={styles.checkIcon}
                    />
                  )}
                </PressableScale>
              );
            })}
          </View>
        </View>

        {/* Lock Note Switch */}
        <TouchableOpacity
          onPress={() => setIsLocked(!isLocked)}
          style={[
            styles.toggleRow,
            {
              backgroundColor: isLocked ? theme.accentSubtle : theme.bgApp,
              borderColor: isLocked ? theme.accent : theme.border,
            },
          ]}
          activeOpacity={0.7}
        >
          <View style={styles.toggleRowLeft}>
            {isLocked ? (
              <Lock size={16} color={theme.accent} />
            ) : (
              <Unlock size={16} color={theme.textSecondary} />
            )}
            <View style={{ flex: 1 }}>
              <Text style={[styles.toggleLabel, { color: theme.textMain }]}>
                Lock Note
              </Text>
              <Text style={[styles.toggleSublabel, { color: theme.textMuted }]}>
                Require phone passkey or password to open
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.checkboxIndicator,
              {
                backgroundColor: isLocked ? theme.accent : 'transparent',
                borderColor: isLocked ? theme.accent : theme.border,
              },
            ]}
          >
            {isLocked && <Check size={12} color={theme.textOnAccent} strokeWidth={3} />}
          </View>
        </TouchableOpacity>

        {/* Pin to Top Switch */}
        <TouchableOpacity
          onPress={() => setIsPinned(!isPinned)}
          style={[
            styles.toggleRow,
            {
              backgroundColor: isPinned ? theme.accentSubtle : theme.bgApp,
              borderColor: isPinned ? theme.accent : theme.border,
            },
          ]}
          activeOpacity={0.7}
        >
          <View style={styles.toggleRowLeft}>
            <Pin
              size={16}
              color={isPinned ? theme.accent : theme.textSecondary}
              style={isPinned ? { transform: [{ rotate: '45deg' }] } : undefined}
            />
            <View style={{ flex: 1 }}>
              <Text style={[styles.toggleLabel, { color: theme.textMain }]}>
                Pin note to top
              </Text>
              <Text style={[styles.toggleSublabel, { color: theme.textMuted }]}>
                Keep this note easily accessible at the top
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.checkboxIndicator,
              {
                backgroundColor: isPinned ? theme.accent : 'transparent',
                borderColor: isPinned ? theme.accent : theme.border,
              },
            ]}
          >
            {isPinned && <Check size={12} color={theme.textOnAccent} strokeWidth={3} />}
          </View>
        </TouchableOpacity>
      </ScrollView>

      {/* Footer */}
      <View style={[styles.dialogFooter, { borderTopColor: theme.border }]}>
        {note && onDelete && (
          <TouchableOpacity
            onPress={() => {
              onDelete(note._id);
              onClose();
            }}
            style={[styles.deleteButton, { borderColor: theme.urgentRed }]}
            activeOpacity={0.7}
            accessibilityLabel="Delete note"
          >
            <Trash2 size={16} color={theme.urgentRed} />
          </TouchableOpacity>
        )}

        <View style={styles.footerRight}>
          <TouchableOpacity
            onPress={onClose}
            style={[styles.cancelBtn, { borderColor: theme.border }]}
            activeOpacity={0.7}
          >
            <Text style={[styles.cancelBtnText, { color: theme.textSecondary }]}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSave}
            disabled={!canSave}
            style={[
              styles.submitBtn,
              {
                backgroundColor: canSave ? theme.accent : theme.columnBg,
                opacity: canSave ? 1 : 0.5,
              },
            ]}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.submitBtnText,
                { color: canSave ? theme.textOnAccent : theme.textMuted },
              ]}
            >
              {note ? 'Save Changes' : 'Create Note'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </CenterModal>
  );
};

const styles = StyleSheet.create({
  dialogHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialogTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  dialogSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialogBody: {
    paddingHorizontal: 20,
    flexShrink: 1,
  },
  dialogBodyContent: {
    paddingVertical: 14,
    gap: 14,
  },
  formGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
  },
  textArea: {
    minHeight: 110,
    paddingTop: 10,
  },
  mediaHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mediaButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  attachBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  attachBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  mediaScroller: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 6,
  },
  mediaThumbWrap: {
    position: 'relative',
    width: 72,
    height: 72,
    borderRadius: 10,
    overflow: 'hidden',
  },
  mediaThumb: {
    width: '100%',
    height: '100%',
  },
  mediaRemoveBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paletteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  swatch: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  swatchDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  checkIcon: {
    position: 'absolute',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  toggleRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  toggleLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  toggleSublabel: {
    fontSize: 11,
    marginTop: 2,
  },
  checkboxIndicator: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialogFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  footerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    justifyContent: 'flex-end',
  },
  deleteButton: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  cancelBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  submitBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  submitBtnText: {
    fontSize: 12,
    fontWeight: '800',
  },
});
