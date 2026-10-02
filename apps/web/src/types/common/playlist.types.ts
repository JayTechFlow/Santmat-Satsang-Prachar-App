export interface PlaylistItem {
  id: string;
  audioId: string;
  title: string;
  artist?: string;
  durationSeconds?: number;
  order: number;
  addedAt: string;
}

export interface Playlist {
  id: string;
  title: string;
  description: string;
  coverImageUrl?: string;
  status: 'published' | 'draft';
  items: PlaylistItem[];
  itemCount: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  isAiGenerated?: boolean;
}

export type CreatePlaylistDto = Omit<Playlist, 'id' | 'createdAt' | 'updatedAt' | 'itemCount'>;
export type UpdatePlaylistDto = Partial<CreatePlaylistDto>;
