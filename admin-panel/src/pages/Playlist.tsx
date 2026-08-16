import React, { useState, useMemo } from 'react';
import { SearchBar } from '../components/ui/SearchBar';
import { FilterBar } from '../components/ui/FilterBar';
import { DataTable } from '../components/ui/DataTable';
import { LoadingState } from '../components/ui/LoadingState';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { usePlaylists } from '../features/playlist/hooks/usePlaylists';
import type { Playlist, PlaylistItem } from '../features/playlist/types/playlist.types';
import { Plus, ListMusic, Trash2, Edit3, Sparkles } from 'lucide-react';
import { usePermissions } from '../core/auth/PermissionContext';
import { ActionGate } from '../core/auth/ProtectedRoute';

export function Playlist() {
  const { playlists, loading, error, refetch, createPlaylist, updatePlaylist, deletePlaylist } = usePlaylists();
  const { context } = usePermissions();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState<Playlist | null>(null);
  const [managingTracksPlaylist, setManagingTracksPlaylist] = useState<Playlist | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'published' | 'draft'>('published');

  // Track management state
  const [newTrackTitle, setNewTrackTitle] = useState('');

  const filteredPlaylists = useMemo(() => {
    return playlists.filter((p) => {
      const matchesSearch =
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = !statusFilter || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [playlists, search, statusFilter]);

  const handleOpenCreateModal = () => {
    setEditingPlaylist(null);
    setTitle('');
    setDescription('');
    setStatus('published');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (playlist: Playlist) => {
    setEditingPlaylist(playlist);
    setTitle(playlist.title);
    setDescription(playlist.description);
    setStatus(playlist.status);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingPlaylist) {
      const success = await updatePlaylist(editingPlaylist.id, {
        title,
        description,
        status,
      });
      if (success) setIsModalOpen(false);
    } else {
      const created = await createPlaylist({
        title,
        description,
        status,
        items: [],
        createdBy: context?.role || 'developer_super_admin',
      });
      if (created) setIsModalOpen(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this playlist?')) {
      await deletePlaylist(id);
    }
  };

  const handleAddTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!managingTracksPlaylist || !newTrackTitle.trim()) return;

    const newItem: PlaylistItem = {
      id: `item-${Date.now()}`,
      audioId: `audio-${Date.now()}`,
      title: newTrackTitle.trim(),
      order: (managingTracksPlaylist.items || []).length + 1,
      addedAt: new Date().toISOString(),
    };

    const updatedItems = [...(managingTracksPlaylist.items || []), newItem];
    const success = await updatePlaylist(managingTracksPlaylist.id, { items: updatedItems });
    if (success) {
      setManagingTracksPlaylist({
        ...managingTracksPlaylist,
        items: updatedItems,
        itemCount: updatedItems.length,
      });
      setNewTrackTitle('');
    }
  };

  const handleRemoveTrack = async (trackId: string) => {
    if (!managingTracksPlaylist) return;
    const updatedItems = (managingTracksPlaylist.items || []).filter((item) => item.id !== trackId);
    const success = await updatePlaylist(managingTracksPlaylist.id, { items: updatedItems });
    if (success) {
      setManagingTracksPlaylist({
        ...managingTracksPlaylist,
        items: updatedItems,
        itemCount: updatedItems.length,
      });
    }
  };

  const columns = [
    {
      key: 'title',
      header: 'Playlist Name',
      render: (p: Playlist) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center text-primary font-semibold">
            <ListMusic className="w-5 h-5" />
          </div>
          <div>
            <div className="font-medium text-foreground">{p.title}</div>
            <div className="text-xs text-muted max-w-xs truncate">{p.description || 'No description'}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'itemCount',
      header: 'Tracks',
      render: (p: Playlist) => (
        <span className="badge badge-neutral">{p.itemCount || (p.items ? p.items.length : 0)} tracks</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (p: Playlist) => (
        <span className={`badge ${p.status === 'published' ? 'badge-success' : 'badge-warning'}`}>
          {p.status.toUpperCase()}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (p: Playlist) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setManagingTracksPlaylist(p)}
            className="btn btn-secondary btn-sm"
            title="Manage Tracks"
          >
            Tracks ({p.items?.length || 0})
          </button>
          <ActionGate permission="audio.manage">
            <button
              onClick={() => handleOpenEditModal(p)}
              className="btn btn-ghost btn-icon btn-sm"
              title="Edit Playlist"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDelete(p.id)}
              aria-label={`Delete playlist ${p.title}`}
              className="btn btn-ghost btn-icon btn-sm text-danger"
              title="Delete Playlist"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </ActionGate>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6 font-['Mukta'] bg-[#FAF8F5] min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
        <div>
          <h1 className="font-extrabold text-xl text-stone-900 leading-tight">
            भजन प्लेलिस्ट्स प्रबंधन (Playlists)
          </h1>
          <p className="text-xs text-stone-600 font-medium">
            विशेष अवसरों, संतों की अमरवाणी एवं दैनिक सत्संग प्लेलिस्ट का प्रबंधन
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="flex items-center gap-2 px-3.5 py-2 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl font-bold text-xs hover:bg-amber-100 transition-all"
            onClick={() => alert('स्मार्ट एआई प्लेलिस्ट जनरेटर यूआई तैयार है!')}
            title="Smart AI Playlist Generator"
          >
            <Sparkles className="w-4 h-4 text-orange-600" />
            <span>एआई ऑटो-प्लेलिस्ट</span>
          </button>
          <ActionGate permission="audio.manage">
            <button
              type="button"
              className="flex items-center gap-2 px-4 py-2 bg-[#EA580C] hover:bg-[#C45A0A] text-white rounded-xl font-bold text-xs shadow-sm transition-all"
              onClick={handleOpenCreateModal}
            >
              <Plus className="w-4 h-4" />
              <span>नई प्लेलिस्ट बनाएँ</span>
            </button>
          </ActionGate>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
        <SearchBar value={search} onSearch={setSearch} placeholder="प्लेलिस्ट का नाम खोजें..." />
        <FilterBar
          options={[
            { label: 'प्रकाशित (Published)', value: 'published' },
            { label: 'ड्राफ्ट (Draft)', value: 'draft' }
          ]}
          value={statusFilter}
          onChange={(val) => setStatusFilter(val.toString())}
          placeholder="सभी स्थितियाँ"
        />
      </div>

      {loading && <LoadingState variant="page" message="Loading playlists..." />}

      {error && !loading && (
        <ErrorState
          title="Failed to load playlists"
          message={error.message}
          onRetry={refetch}
        />
      )}

      {!loading && !error && (
        <>
          {filteredPlaylists.length === 0 ? (
            <EmptyState
              title="No Playlists Found"
              message={search ? 'No playlists match your search filter.' : 'Get started by creating your first playlist.'}
              action={
                search ? (
                  <button onClick={() => setSearch('')} className="btn btn-secondary">
                    Clear Search
                  </button>
                ) : (
                  <ActionGate permission="audio.manage">
                    <button onClick={handleOpenCreateModal} className="btn btn-primary">
                      Create Playlist
                    </button>
                  </ActionGate>
                )
              }
            />
          ) : (
            <DataTable
              data={filteredPlaylists}
              columns={columns}
              keyExtractor={(p) => p.id}
            />
          )}
        </>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="dialog-backdrop flex items-center justify-center p-4 z-50">
          <div className="dialog-content card max-w-lg w-full p-6">
            <h2 className="text-xl font-bold mb-4">
              {editingPlaylist ? 'Edit Playlist' : 'Create New Playlist'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="form-label">Playlist Title *</label>
                <input
                  type="text"
                  required
                  className="input w-full"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Daily Satsang Bhajans"
                />
              </div>
              <div>
                <label className="form-label">Description</label>
                <textarea
                  className="input w-full min-h-[80px]"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief overview of this playlist..."
                />
              </div>
              <div>
                <label className="form-label">Status</label>
                <select
                  className="input w-full"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'published' | 'draft')}
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingPlaylist ? 'Save Changes' : 'Create Playlist'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Track Management Modal */}
      {managingTracksPlaylist && (
        <div className="dialog-backdrop flex items-center justify-center p-4 z-50">
          <div className="dialog-content card max-w-xl w-full p-6">
            <div className="flex items-center justify-between mb-4 border-b pb-3">
              <div>
                <h2 className="text-xl font-bold">{managingTracksPlaylist.title}</h2>
                <p className="text-xs text-muted">Manage track items in this playlist</p>
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setManagingTracksPlaylist(null)}
              >
                Close
              </button>
            </div>

            <form onSubmit={handleAddTrack} className="flex gap-2 mb-6">
              <input
                type="text"
                required
                className="input flex-1"
                placeholder="Enter audio track title to add..."
                value={newTrackTitle}
                onChange={(e) => setNewTrackTitle(e.target.value)}
              />
              <button type="submit" className="btn btn-primary flex items-center space-x-1">
                <Plus className="w-4 h-4" />
                <span>Add Track</span>
              </button>
            </form>

            <div className="max-h-60 overflow-y-auto space-y-2">
              {(!managingTracksPlaylist.items || managingTracksPlaylist.items.length === 0) ? (
                <p className="text-sm text-muted text-center py-6">No tracks added to this playlist yet.</p>
              ) : (
                managingTracksPlaylist.items.map((item, idx) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-card border rounded">
                    <div className="flex items-center space-x-3">
                      <span className="text-xs font-bold text-muted w-6 text-center">{idx + 1}</span>
                      <span className="text-sm font-medium">{item.title}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveTrack(item.id)}
                      aria-label={`Remove track ${item.title}`}
                      className="btn btn-ghost btn-icon btn-sm text-danger"
                      title="Remove Track"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}