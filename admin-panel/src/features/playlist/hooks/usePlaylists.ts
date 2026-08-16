import { useState, useEffect, useCallback } from 'react';
import { playlistService } from '../services/playlistService';
import type { Playlist, CreatePlaylistDto, UpdatePlaylistDto } from '../types/playlist.types';
import { useToast } from '../../../hooks/useToast';

export function usePlaylists() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { showToast } = useToast();

  const fetchPlaylists = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await playlistService.getAll();
      setPlaylists(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error('Failed to load playlists');
      setError(e);
      showToast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchPlaylists();
  }, [fetchPlaylists]);

  const createPlaylist = async (dto: CreatePlaylistDto): Promise<Playlist | null> => {
    try {
      const timestamp = new Date().toISOString();
      const payload: Playlist = {
        id: `pl-${Date.now()}`,
        title: dto.title,
        description: dto.description || '',
        status: dto.status || 'published',
        items: dto.items || [],
        itemCount: (dto.items || []).length,
        createdBy: dto.createdBy || 'system',
        createdAt: timestamp,
        updatedAt: timestamp,
        coverImageUrl: dto.coverImageUrl,
        isAiGenerated: dto.isAiGenerated,
      };

      const newPlaylist = await playlistService.create(payload);
      setPlaylists((prev) => [newPlaylist, ...prev]);
      showToast('Playlist created successfully', 'success');
      return newPlaylist;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create playlist';
      showToast(msg, 'error');
      return null;
    }
  };

  const updatePlaylist = async (id: string, dto: UpdatePlaylistDto): Promise<boolean> => {
    try {
      await playlistService.update(id, {
        ...dto,
        ...(dto.items ? { itemCount: dto.items.length } : {}),
      });

      setPlaylists((prev) =>
        prev.map((p) => {
          if (p.id !== id) return p;
          return {
            ...p,
            ...dto,
            itemCount: dto.items ? dto.items.length : p.itemCount,
            updatedAt: new Date().toISOString(),
          };
        })
      );
      showToast('Playlist updated successfully', 'success');
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update playlist';
      showToast(msg, 'error');
      return false;
    }
  };

  const deletePlaylist = async (id: string): Promise<boolean> => {
    try {
      await playlistService.delete(id);
      setPlaylists((prev) => prev.filter((p) => p.id !== id));
      showToast('Playlist deleted successfully', 'success');
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to delete playlist';
      showToast(msg, 'error');
      return false;
    }
  };

  return {
    playlists,
    loading,
    error,
    refetch: fetchPlaylists,
    createPlaylist,
    updatePlaylist,
    deletePlaylist,
  };
}
