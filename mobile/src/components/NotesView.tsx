import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Share,
} from 'react-native';
import { Text } from './ScaledText';
import {
  StickyNote,
  Plus,
  Pin,
  Edit3,
  Trash2,
  Share2,
  Archive,
  ArchiveRestore,
  ChevronDown,
  ChevronRight,
  Lock,
  Unlock,
  Image as ImageIcon,
} from 'lucide-react-native';
import { ThemeColors } from '../theme/colors';
import { INote } from '../types';
import { NOTE_COLORS } from '../theme/noteColors';
import { PressableScale } from './PressableScale';
import { FadeInView } from './FadeInView';
import { SwipeableNoteCard } from './SwipeableNoteCard';
import { UnlockNoteModal } from './UnlockNoteModal';
import { NoteMediaThumb } from './NoteMediaThumb';
import { MediaViewerModal } from './MediaViewerModal';

// Actions on a locked note that must wait for the user to unlock it first
type ProtectedAction = 'open' | 'share' | 'delete' | 'media';

interface NotesViewProps {
  theme: ThemeColors;
  notes: INote[];
  onOpenCreate: () => void;
  onOpenEdit: (note: INote) => void;
  onTogglePin: (id: string) => void;
  onDeleteNote: (id: string, title: string) => void;
  onArchiveNote: (id: string) => void;
  /** Bumped by the app whenever secure notes must lock again (screen change / app backgrounded) */
  lockSignal: number;
}

export const NotesView: React.FC<NotesViewProps> = ({
  theme,
  notes,
  onOpenCreate,
  onOpenEdit,
  onTogglePin,
  onDeleteNote,
  onArchiveNote,
  lockSignal,
}) => {
  const [showArchived, setShowArchived] = useState(false);
  const [unlockedNoteIds, setUnlockedNoteIds] = useState<Record<string, boolean>>({});
  const [pendingUnlock, setPendingUnlock] = useState<{
    note: INote;
    action: ProtectedAction;
    mediaIndex?: number;
  } | null>(null);
  const [mediaViewer, setMediaViewer] = useState<{ media: string[]; index: number } | null>(null);
  // Action unlocked by the user, run only after the unlock modal has fully closed:
  // iOS can't present the next modal (e.g. delete confirmation) while one is dismissing
  const actionAfterUnlock = useRef<(() => void) | null>(null);

  // Re-lock everything immediately when asked to
  useEffect(() => {
    if (lockSignal === 0) return;
    setUnlockedNoteIds({});
    setPendingUnlock(null);
    setMediaViewer(null);
    actionAfterUnlock.current = null;
  }, [lockSignal]);

  const isNoteLocked = (note: INote) => Boolean(note.isLocked) && !unlockedNoteIds[note._id];

  // Defensive array checks
  const safeNotes = useMemo(
    () => (Array.isArray(notes) ? notes.filter((n): n is INote => Boolean(n && n._id)) : []),
    [notes]
  );

  const activeNotes = useMemo(
    () => safeNotes.filter((n) => !n.isArchived),
    [safeNotes]
  );
  const archivedNotes = useMemo(
    () => safeNotes.filter((n) => Boolean(n.isArchived)),
    [safeNotes]
  );

  const pinnedNotes = useMemo(
    () => activeNotes.filter((n) => Boolean(n.isPinned)),
    [activeNotes]
  );
  const otherNotes = useMemo(
    () => activeNotes.filter((n) => !n.isPinned),
    [activeNotes]
  );

  const runAction = (note: INote, action: ProtectedAction, mediaIndex = 0) => {
    switch (action) {
      case 'open':
        onOpenEdit(note);
        break;
      case 'share':
        shareNote(note);
        break;
      case 'delete':
        onDeleteNote(note._id, (note.title || '').trim() || 'Untitled Note');
        break;
      case 'media':
        setMediaViewer({ media: note.media || [], index: mediaIndex });
        break;
    }
  };

  // Runs the action straight away, or asks to unlock first if the note is locked
  const withUnlock = (note: INote, action: ProtectedAction, mediaIndex?: number) => {
    if (isNoteLocked(note)) {
      // Ignore repeat taps/swipes while an unlock prompt is already showing
      if (pendingUnlock) return;
      setPendingUnlock({ note, action, mediaIndex });
    } else {
      runAction(note, action, mediaIndex);
    }
  };

  const handleCardPress = (note: INote) => withUnlock(note, 'open');

  const handleUnlockSuccess = () => {
    if (!pendingUnlock) return;
    const { note, action, mediaIndex } = pendingUnlock;
    setUnlockedNoteIds((prev) => ({ ...prev, [note._id]: true }));
    actionAfterUnlock.current = () => runAction(note, action, mediaIndex);
    setPendingUnlock(null);
  };

  const handleUnlockModalClosed = () => {
    const action = actionAfterUnlock.current;
    actionAfterUnlock.current = null;
    action?.();
  };

  const shareNote = async (note: INote) => {
    try {
      const title = (note.title || '').trim();
      const content = (note.content || '').trim();
      const message = title ? `${title}\n\n${content}` : content;
      await Share.share({
        title: title || 'Quick Note',
        message,
      });
    } catch (e) {
      console.error('Failed to share note:', e);
    }
  };

  const formatNoteTime = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return '';
      const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return `${dateStr}, ${timeStr}`;
    } catch {
      return '';
    }
  };

  const renderNoteCard = (note: INote) => {
    try {
      const pal = (note.color && NOTE_COLORS[note.color]) ? NOTE_COLORS[note.color] : NOTE_COLORS.default;
      const cardBg = theme.isDark ? pal.bgDark : pal.bgLight;
      const cardBorder = theme.isDark ? pal.borderDark : pal.borderLight;

      const title = typeof note.title === 'string' ? note.title : '';
      const content = typeof note.content === 'string' ? note.content : '';
      const displayTitle = title.trim();
      const displayContent = content.trim();
      const isLockedAndSecret = isNoteLocked(note);
      const hasMedia = Array.isArray(note.media) && note.media.length > 0;

      const firstLineContent = displayContent.split('\n')[0] || '';

      return (
        <FadeInView key={note._id}>
          <SwipeableNoteCard
            theme={theme}
            onDelete={() => withUnlock(note, 'delete')}
            onArchive={() => onArchiveNote(note._id)}
            isArchived={note.isArchived}
          >
            <PressableScale
              onPress={() => handleCardPress(note)}
              activeScale={0.98}
              style={[
                styles.card,
                {
                  backgroundColor: cardBg,
                  borderColor: cardBorder,
                  shadowColor: theme.cardShadow,
                },
              ]}
            >
              {/* Card Top: Title & Pin/Lock Action */}
              <View style={styles.cardHeader}>
                <View style={styles.cardTitleGroup}>
                  <View style={styles.titleIconRow}>
                    {note.isLocked && (
                      <View style={[styles.lockBadge, { backgroundColor: theme.accentSubtle }]}>
                        {isLockedAndSecret ? (
                          <Lock size={12} color={theme.accent} />
                        ) : (
                          <Unlock size={12} color={theme.accent} />
                        )}
                      </View>
                    )}
                    {displayTitle ? (
                      <Text style={[styles.cardTitle, { color: theme.textMain }]} numberOfLines={2}>
                        {displayTitle}
                      </Text>
                    ) : (
                      <Text style={[styles.cardTitlePlaceholder, { color: theme.textSecondary }]} numberOfLines={1}>
                        {isLockedAndSecret ? 'Locked Note' : (firstLineContent || 'Untitled Note')}
                      </Text>
                    )}
                  </View>
                </View>

                {!note.isArchived && (
                  <PressableScale
                    onPress={() => onTogglePin(note._id)}
                    activeScale={0.85}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    style={[
                      styles.pinButton,
                      {
                        backgroundColor: note.isPinned ? theme.accentSubtle : 'transparent',
                      },
                    ]}
                    accessibilityLabel={note.isPinned ? 'Unpin note' : 'Pin note'}
                  >
                    <Pin
                      size={15}
                      color={note.isPinned ? theme.accent : theme.textMuted}
                      style={note.isPinned ? { transform: [{ rotate: '45deg' }] } : undefined}
                    />
                  </PressableScale>
                )}
              </View>

              {/* Card Body: Content snippet or Locked state */}
              {isLockedAndSecret ? (
                <View style={[styles.lockedPlaceholderBox, { backgroundColor: theme.isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.4)' }]}>
                  <Lock size={15} color={theme.accent} />
                  <Text style={[styles.lockedPlaceholderText, { color: theme.textSecondary }]}>
                    Content protected • Tap to unlock with passkey or password
                  </Text>
                </View>
              ) : (
                <>
                  {displayContent ? (
                    <Text
                      style={[
                        styles.cardBody,
                        { color: displayTitle ? theme.textSecondary : theme.textMuted },
                      ]}
                      numberOfLines={5}
                    >
                      {displayContent}
                    </Text>
                  ) : null}

                  {/* Media Thumbnails Preview */}
                  {hasMedia && (
                    <View style={styles.mediaRowPreview}>
                      {note.media!.slice(0, 3).map((uri, idx) => {
                        const isLastExtra = idx === 2 && note.media!.length > 3;
                        return (
                          <PressableScale
                            key={`${uri}_${idx}`}
                            onPress={() => withUnlock(note, 'media', idx)}
                            activeScale={0.94}
                            style={styles.cardMediaThumbWrap}
                            accessibilityLabel="Open attachment"
                          >
                            <NoteMediaThumb uri={uri} style={styles.cardMediaThumb} />
                            {isLastExtra && (
                              <View style={styles.mediaExtraOverlay}>
                                <Text style={styles.mediaExtraText}>+{note.media!.length - 2}</Text>
                              </View>
                            )}
                          </PressableScale>
                        );
                      })}
                    </View>
                  )}
                </>
              )}

              {/* Card Footer: Timestamp and Quick Actions */}
              <View style={[styles.cardFooter, { borderTopColor: cardBorder }]}>
                <View style={styles.footerLeft}>
                  <Text style={[styles.timestampText, { color: theme.textMuted }]}>
                    {formatNoteTime(note.updatedAt || note.createdAt)}
                  </Text>
                  {hasMedia && !isLockedAndSecret && (
                    <View style={styles.mediaBadge}>
                      <ImageIcon size={11} color={theme.textMuted} />
                      <Text style={[styles.mediaBadgeText, { color: theme.textMuted }]}>
                        {note.media!.length}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.actionButtonsRow}>
                  {/* Share action */}
                  <TouchableOpacity
                    onPress={() => withUnlock(note, 'share')}
                    style={styles.actionBtn}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    accessibilityLabel="Share note"
                  >
                    <Share2 size={13} color={theme.textMuted} />
                  </TouchableOpacity>

                  {/* Archive / Restore action */}
                  <TouchableOpacity
                    onPress={() => onArchiveNote(note._id)}
                    style={styles.actionBtn}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    accessibilityLabel={note.isArchived ? 'Restore note' : 'Archive note'}
                  >
                    {note.isArchived ? (
                      <ArchiveRestore size={13} color="#4F46E5" />
                    ) : (
                      <Archive size={13} color={theme.textMuted} />
                    )}
                  </TouchableOpacity>

                  {/* Edit action */}
                  <TouchableOpacity
                    onPress={() => handleCardPress(note)}
                    style={styles.actionBtn}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    accessibilityLabel="Edit note"
                  >
                    <Edit3 size={13} color={theme.textMuted} />
                  </TouchableOpacity>

                  {/* Delete action */}
                  <TouchableOpacity
                    onPress={() => withUnlock(note, 'delete')}
                    style={styles.actionBtn}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    accessibilityLabel="Delete note"
                  >
                    <Trash2 size={13} color={theme.urgentRed} />
                  </TouchableOpacity>
                </View>
              </View>
            </PressableScale>
          </SwipeableNoteCard>
        </FadeInView>
      );
    } catch (e) {
      console.warn('Error rendering note card:', e);
      return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bgApp }]}>
      {/* Top Bar (Rounded-Full Pill Floating Capsule) */}
      <View style={styles.topBarWrapper}>
        <View
          style={[
            styles.topBar,
            {
              backgroundColor: theme.bgCard,
              borderColor: theme.border,
              shadowColor: theme.cardShadow,
            },
          ]}
        >
          <View style={styles.titleLeft}>
            <View style={[styles.iconWrap, { backgroundColor: theme.accentSubtle }]}>
              <StickyNote size={18} color={theme.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.mainHeading, { color: theme.textMain }]}>
                Quick Notes
              </Text>
              <Text style={[styles.subHeading, { color: theme.textMuted }]}>
                {`${activeNotes.length} note${activeNotes.length === 1 ? '' : 's'}${
                  archivedNotes.length > 0 ? ` • ${archivedNotes.length} archived` : ''
                } • Scratchpad`}
              </Text>
            </View>
          </View>
        </View>

        {/* Gesture Hint Badge */}
        {activeNotes.length > 0 && (
          <View style={[styles.hintRow, { backgroundColor: theme.accentSubtle }]}>
            <Text style={[styles.hintText, { color: theme.accent }]}>
              👉 Swipe right to delete • 👈 Swipe left to archive
            </Text>
          </View>
        )}
      </View>

      {/* Main Content Area */}
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled={true}
        bounces={true}
      >
        {/* If no notes at all */}
        {safeNotes.length === 0 ? (
          <View style={[styles.emptyContainer, { borderColor: theme.border, backgroundColor: theme.bgCard }]}>
            <View style={[styles.emptyIconWrap, { backgroundColor: theme.accentSubtle }]}>
              <StickyNote size={32} color={theme.accent} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.textMain }]}>
              No Quick Notes Yet
            </Text>
            <Text style={[styles.emptySubtitle, { color: theme.textMuted }]}>
              Jot down thoughts, passcodes, checklists, ideas and attach media that are not linked to any specific calendar day.
            </Text>
            <PressableScale
              onPress={onOpenCreate}
              activeScale={0.92}
              style={[styles.emptyActionBtn, { backgroundColor: theme.accent }]}
            >
              <Plus size={16} color={theme.textOnAccent} strokeWidth={2.4} />
              <Text style={[styles.emptyActionText, { color: theme.textOnAccent }]}>
                Add Your First Note
              </Text>
            </PressableScale>
          </View>
        ) : (
          /* Render Pinned & Other Notes */
          <View style={styles.notesList}>
            {pinnedNotes.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeaderRow}>
                  <Pin size={12} color={theme.accent} style={{ transform: [{ rotate: '45deg' }] }} />
                  <Text style={[styles.sectionHeading, { color: theme.accent }]}>
                    PINNED ({pinnedNotes.length})
                  </Text>
                </View>
                <View style={styles.cardsColumn}>
                  {pinnedNotes.map((n) => renderNoteCard(n))}
                </View>
              </View>
            )}

            {otherNotes.length > 0 && (
              <View style={styles.section}>
                {pinnedNotes.length > 0 && (
                  <View style={styles.sectionHeaderRow}>
                    <Text style={[styles.sectionHeading, { color: theme.textSecondary }]}>
                      ALL NOTES ({otherNotes.length})
                    </Text>
                  </View>
                )}
                <View style={styles.cardsColumn}>
                  {otherNotes.map((n) => renderNoteCard(n))}
                </View>
              </View>
            )}

            {/* Archived Notes Collapsible Section */}
            {archivedNotes.length > 0 && (
              <View style={[styles.section, styles.archivedSection]}>
                <TouchableOpacity
                  onPress={() => setShowArchived(!showArchived)}
                  style={[
                    styles.archivedToggleBtn,
                    {
                      backgroundColor: theme.bgCard,
                      borderColor: theme.border,
                    },
                  ]}
                  activeOpacity={0.7}
                >
                  <View style={styles.archivedToggleLeft}>
                    <Archive size={14} color="#4F46E5" />
                    <Text style={[styles.archivedToggleText, { color: theme.textMain }]}>
                      Archived Notes ({archivedNotes.length})
                    </Text>
                  </View>
                  {showArchived ? (
                    <ChevronDown size={16} color={theme.textMuted} />
                  ) : (
                    <ChevronRight size={16} color={theme.textMuted} />
                  )}
                </TouchableOpacity>

                {showArchived && (
                  <View style={styles.cardsColumn}>
                    {archivedNotes.map((n) => renderNoteCard(n))}
                  </View>
                )}
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Unlock Locked Note Modal */}
      <UnlockNoteModal
        theme={theme}
        isOpen={Boolean(pendingUnlock)}
        onClose={() => setPendingUnlock(null)}
        onSuccess={handleUnlockSuccess}
        onClosed={handleUnlockModalClosed}
        noteTitle={pendingUnlock?.note.title}
      />

      {/* Full-screen attachment viewer */}
      <MediaViewerModal
        isOpen={Boolean(mediaViewer)}
        media={mediaViewer?.media ?? []}
        initialIndex={mediaViewer?.index ?? 0}
        onClose={() => setMediaViewer(null)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBarWrapper: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 6,
    gap: 8,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  titleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainHeading: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  subHeading: {
    fontSize: 11,
    marginTop: 1,
  },
  hintRow: {
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
  },
  hintText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 130, // Clears floating bottom nav and FAB
  },
  emptyContainer: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 14,
  },
  emptyIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  emptySubtitle: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
  },
  emptyActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
    marginTop: 6,
  },
  emptyActionText: {
    fontSize: 12,
    fontWeight: '800',
  },
  notesList: {
    gap: 16,
  },
  section: {
    gap: 8,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingLeft: 2,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  cardsColumn: {
    gap: 10,
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 8,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  cardTitleGroup: {
    flex: 1,
  },
  titleIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  lockBadge: {
    width: 22,
    height: 22,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 18,
  },
  cardTitlePlaceholder: {
    fontSize: 13,
    fontWeight: '700',
    fontStyle: 'italic',
  },
  pinButton: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockedPlaceholderBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 8,
  },
  lockedPlaceholderText: {
    fontSize: 11.5,
    fontWeight: '600',
    flex: 1,
    lineHeight: 16,
  },
  cardBody: {
    fontSize: 12.5,
    lineHeight: 18,
  },
  mediaRowPreview: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  cardMediaThumbWrap: {
    position: 'relative',
    width: 60,
    height: 60,
    borderRadius: 8,
    overflow: 'hidden',
  },
  cardMediaThumb: {
    width: 60,
    height: 60,
  },
  mediaExtraOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediaExtraText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: 2,
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timestampText: {
    fontSize: 10,
    fontVariant: ['tabular-nums'],
  },
  mediaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  mediaBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  actionBtn: {
    padding: 3,
  },
  archivedSection: {
    marginTop: 10,
  },
  archivedToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  archivedToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  archivedToggleText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
