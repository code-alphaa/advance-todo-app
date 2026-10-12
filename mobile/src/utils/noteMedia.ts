import { Directory, File, Paths } from 'expo-file-system';

export type NoteMediaKind = 'image' | 'video' | 'pdf';

// Media copied into the app is stored as `note-media/<file>` (relative), because
// the iOS app container path changes between installs and updates.
const MEDIA_DIR_NAME = 'note-media';
const RELATIVE_PREFIX = `${MEDIA_DIR_NAME}/`;

const VIDEO_EXTENSIONS = ['mp4', 'mov', 'm4v', 'webm', '3gp', 'mkv', 'avi'];

function getExtension(uri: string): string {
  const path = uri.split('?')[0].split('#')[0];
  const dot = path.lastIndexOf('.');
  return dot >= 0 ? path.slice(dot + 1).toLowerCase() : '';
}

export function getNoteMediaKind(uri: string): NoteMediaKind {
  const ext = getExtension(uri);
  if (ext === 'pdf') return 'pdf';
  if (VIDEO_EXTENSIONS.includes(ext)) return 'video';
  return 'image';
}

export function getNoteMediaName(uri: string): string {
  const name = decodeURIComponent(uri.split('?')[0].split('/').pop() || '');
  // Strip the unique prefix added when the file was copied in
  return name.replace(/^\d+_[a-z0-9]+_/, '') || 'Attachment';
}

// Turns a stored media reference into a URI that can be displayed
export function resolveNoteMediaUri(stored: string): string {
  if (stored.startsWith(RELATIVE_PREFIX)) {
    return new File(Paths.document, stored).uri;
  }
  return stored;
}

// Copies a picked file (which lives in a temporary cache) into permanent app storage
export function persistNoteMedia(sourceUri: string, preferredName?: string): string {
  try {
    const dir = new Directory(Paths.document, MEDIA_DIR_NAME);
    if (!dir.exists) dir.create({ intermediates: true });

    const baseName = (preferredName || sourceUri.split('/').pop() || 'file')
      .split('?')[0]
      .replace(/[^\w.\-]/g, '_');
    const fileName = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}_${baseName}`;

    new File(sourceUri).copy(new File(dir, fileName));
    return `${RELATIVE_PREFIX}${fileName}`;
  } catch (e) {
    console.warn('Failed to persist note media, keeping original URI:', e);
    return sourceUri;
  }
}

// Removes app-owned copies of media that are no longer referenced by a note
export function deleteNoteMedia(storedUris: string[]) {
  for (const stored of storedUris) {
    if (!stored.startsWith(RELATIVE_PREFIX)) continue;
    try {
      const file = new File(Paths.document, stored);
      if (file.exists) file.delete();
    } catch (e) {
      console.warn('Failed to delete note media:', e);
    }
  }
}
