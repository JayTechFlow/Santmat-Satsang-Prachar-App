import { BaseRepository } from '../../../core/repositories/BaseRepository';
import { db } from '../../../firebase/config';
import type { Playlist } from '../types/playlist.types';

export class PlaylistRepository extends BaseRepository<Playlist> {
  constructor() {
    super(db, 'playlists');
  }
}

export const playlistRepository = new PlaylistRepository();
