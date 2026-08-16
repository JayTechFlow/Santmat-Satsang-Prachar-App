import { BaseCrudService } from '../../../core/services/BaseCrudService';
import { playlistRepository, PlaylistRepository } from '../repositories/playlistRepository';
import type { Playlist } from '../types/playlist.types';

export class PlaylistService extends BaseCrudService<Playlist> {
  constructor(repo: PlaylistRepository) {
    super(repo);
  }
}

export const playlistService = new PlaylistService(playlistRepository);
