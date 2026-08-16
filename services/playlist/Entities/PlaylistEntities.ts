// Sprint M7.4 — Playlist Platform: Entity Definitions
// Updated for Sprint E1 - Permission-based access (no viewer/editor/owner roles)

export type PlaylistType =
  | 'ai_generated'
  | 'user_created'
  | 'auto'
  | 'favorites'
  | 'shared'
  | 'offline'
  | 'continue_listening'
  | 'smart_mix'
  | 'mood_based'
  | 'category_based'
  | 'speaker_based'
  | 'event_based';

export type PlaylistVisibility = 'private' | 'public' | 'unlisted' | 'collaborative';

export type PlaylistSortOrder =
  | 'manual'
  | 'recent_first'
  | 'recent_last'
  | 'popularity'
  | 'duration_asc'
  | 'duration_desc'
  | 'title_az'
  | 'title_za'
  | 'smart_shuffle'
  | 'continue_order'
  | 'mood_flow';

export interface PlaylistItem {
  itemId: string;
  mediaId: string;
  position: number;
  addedAt: string;
  addedBy?: string;
  metadata?: {
    startOffsetSeconds?: number;
    endOffsetSeconds?: number;
    note?: string;
    customTitle?: string;
  };
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  type: PlaylistType;
  visibility: PlaylistVisibility;
  ownerId: string;
  coverImageUrl?: string;
  coverImagePath?: string;
  items: PlaylistItem[];
  itemCount: number;
  totalDurationSeconds: number;
  tags: string[];
  category?: string;
  language?: string;
  mood?: string;
  sortOrder: PlaylistSortOrder;
  isCollaborative: boolean;
  collaborators: string[]; // user IDs
  followersCount: number;
  playCount: number;
  likeCount: number;
  shareCount: number;
  createdAt: string;
  updatedAt: string;
  lastPlayedAt?: string;
  metadata?: {
    aiPrompt?: string;
    generationParams?: Record<string, any>;
    sourcePlaylistId?: string;
    autoRefresh?: boolean;
    refreshSchedule?: string;
    smartRules?: SmartRule[];
  };
}

export interface SmartRule {
  id: string;
  type: 'category' | 'speaker' | 'language' | 'tag' | 'duration' | 'recency' | 'popularity' | 'mood' | 'exclude';
  operator: 'equals' | 'contains' | 'not_contains' | 'in' | 'not_in' | 'greater_than' | 'less_than' | 'between';
  value: any;
  weight?: number;
}

export interface PlaylistGenerationParams {
  name?: string;
  description?: string;
  type: PlaylistType;
  seedMediaIds?: string[];
  seedCategory?: string;
  seedSpeaker?: string;
  seedLanguage?: string;
  seedTags?: string[];
  seedEvent?: string;
  mood?: 'peaceful' | 'energetic' | 'devotional' | 'meditative' | 'joyful' | 'contemplative';
  durationTargetSeconds?: number;
  itemCount?: number;
  smartRules?: SmartRule[];
  excludeMediaIds?: string[];
  diversityFactor?: number; // 0-1, higher = more diverse
  freshnessFactor?: number; // 0-1, higher = prefer newer content
  popularityFactor?: number; // 0-1, higher = prefer popular content
}

export interface ContinuePlaylistParams {
  userId: string;
  currentMediaId: string;
  currentPositionSeconds: number;
  totalDurationSeconds: number;
  maxItems?: number;
  includeHistory?: boolean;
  maxHistoryItems?: number;
}

export interface PlaylistAnalytics {
  playlistId: string;
  period: 'day' | 'week' | 'month' | 'all';
  totalPlays: number;
  uniqueListeners: number;
  avgPlayDurationSeconds: number;
  completionRate: number;
  skipRate: number;
  replayRate: number;
  topItems: {
    mediaId: string;
    playCount: number;
    avgCompletion: number;
    skipCount: number;
  }[];
  listenerRetention: {
    day: number;
    retained: number;
  }[];
  trafficSources: {
    source: string;
    plays: number;
  }[];
  deviceBreakdown: {
    device: string;
    plays: number;
  }[];
  geographicBreakdown: {
    country: string;
    plays: number;
  }[];
}

export interface SharedPlaylistInvite {
  id: string;
  playlistId: string;
  invitedBy: string;
  invitedUserId?: string;
  invitedEmail?: string;
  // Role removed - permissions determined by permission engine
  // 'viewer' | 'editor' | 'owner' removed - use permissions: playlists.view, playlists.manage
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  createdAt: string;
  expiresAt: string;
  acceptedAt?: string;
}

export interface OfflinePlaylist {
  playlistId: string;
  userId: string;
  status: 'pending' | 'downloading' | 'completed' | 'failed' | 'expired';
  progress: number; // 0-100
  totalItems: number;
  downloadedItems: number;
  totalSizeBytes: number;
  downloadedSizeBytes: number;
  startedAt: string;
  completedAt?: string;
  expiresAt?: string;
  error?: string;
  items: {
    mediaId: string;
    status: 'pending' | 'downloading' | 'completed' | 'failed';
    localPath?: string;
    sizeBytes?: number;
    error?: string;
  }[];
}

export interface PlaylistRecommendation {
  playlistId: string;
  score: number;
  reason: string;
  strategy: 'collaborative' | 'content' | 'trending' | 'similar_taste' | 'mood_match' | 'continue';
  metadata?: {
    commonItems?: number;
    matchingTags?: string[];
    matchingCategories?: string[];
  };
}

export interface PlaylistExport {
  playlist: Playlist;
  mediaItems: {
    mediaId: string;
    title: string;
    artist?: string;
    durationSeconds: number;
    mediaUrl?: string;
    thumbnailUrl?: string;
  }[];
  exportedAt: string;
  format: 'json' | 'm3u' | 'pls' | 'csv';
}

export const PLAYLIST_TYPE_LABELS: Record<PlaylistType, string> = {
  ai_generated: 'AI Generated',
  user_created: 'My Playlist',
  auto: 'Auto Playlist',
  favorites: 'Favorites',
  shared: 'Shared Playlist',
  offline: 'Offline Playlist',
  continue_listening: 'Continue Listening',
  smart_mix: 'Smart Mix',
  mood_based: 'Mood Playlist',
  category_based: 'Category Playlist',
  speaker_based: 'Speaker Playlist',
  event_based: 'Event Playlist',
};

export const PLAYLIST_VISIBILITY_LABELS: Record<PlaylistVisibility, string> = {
  private: 'Private',
  public: 'Public',
  unlisted: 'Unlisted',
  collaborative: 'Collaborative',
};

export const PLAYLIST_SORT_ORDER_LABELS: Record<PlaylistSortOrder, string> = {
  manual: 'Custom Order',
  recent_first: 'Newest First',
  recent_last: 'Oldest First',
  popularity: 'Most Popular',
  duration_asc: 'Shortest First',
  duration_desc: 'Longest First',
  title_az: 'Title A-Z',
  title_za: 'Title Z-A',
  smart_shuffle: 'Smart Shuffle',
  continue_order: 'Continue Order',
  mood_flow: 'Mood Flow',
};

export function generatePlaylistId(): string {
  return `pl_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export function generatePlaylistItemId(): string {
  return `pli_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}