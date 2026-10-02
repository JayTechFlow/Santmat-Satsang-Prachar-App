/**
 * ============================================================================
 * Santmat Satsang Prachar - Playlist Management (Admin)
 * ============================================================================
 * Create new devotional playlists, review bhajans inside each playlist, add or
 * remove bhajans, and delete playlists. Real data from the `playlists` and
 * `audio` collections — empty state shown when none exist.
 */
import React, { useState } from 'react';
import { Plus, Trash2, X, Music, FolderOpen, ListMusic } from 'lucide-react';
import { useApp } from '../../../app/providers/AppContext';
import { playlistService } from '../services/playlistService';
import { Playlist } from '../../../types/common/index';
import { AdminPageHeader, AdminButton } from '../../../components/admin';

export const AdminPlaylists: React.FC = () => {
  const { playlists, bhajans, createPlaylist, toggleBhajanInPlaylist } = useApp();
  const [newName, setNewName] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), 3500);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    createPlaylist(newName.trim());
    setNewName('');
    showMessage('नई प्लेलिस्ट बनाई गई।');
  };

  const bhajanTitle = (id: string): string => {
    const b = bhajans.find((bh) => bh.id === id);
    return b ? b.title : 'हटाया गया भजन';
  };

  const handleDelete = async (pl: Playlist) => {
    if (!confirm(`क्या आप '${pl.name}' प्लेलिस्ट हटाना चाहते हैं?`)) return;
    const res = await playlistService.deletePlaylist(pl.id);
    if (res.success) {
      showMessage('प्लेलिस्ट हटा दी गई।');
    } else {
      alert(res.error || 'प्लेलिस्ट हटाने में त्रुटि');
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto font-['Mukta'] select-none">
      {/* Canonical Admin Page Header */}
      <AdminPageHeader
        title="सत्संग भजन प्लेलिस्ट्स (Playlists)"
        subtitle="एडमिन एवं भक्तों द्वारा बनाई गई प्लेलिस्ट्स यहाँ प्रदर्शित हैं। आप नई प्लेलिस्ट बना सकते हैं, भजन जोड़/निकाल सकते हैं अथवा हटा सकते हैं।"
        badgeText="भजन प्लेलिस्ट्स प्रबंधन"
        icon={<ListMusic className="w-4 h-4" />}
        actions={
          <form onSubmit={handleCreate} className="flex items-center gap-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="नई प्लेलिस्ट का नाम…"
              className="admin-input w-52"
              aria-label="नई प्लेलिस्ट का नाम"
            />
            <AdminButton type="submit" variant="primary" size="md" icon={<Plus className="w-4 h-4" />}>
              बनाएँ
            </AdminButton>
          </form>
        }
      />

      {message && (
        <div className="admin-toast admin-toast-success">
          {message}
        </div>
      )}

      {/* Playlists Grid */}
      {playlists.length === 0 ? (
        <div className="admin-card p-12 text-center space-y-3">
          <FolderOpen className="w-12 h-12 mx-auto text-stone-300" />
          <p className="text-sm font-bold text-stone-600">अभी कोई प्लेलिस्ट नहीं बनी है</p>
          <p className="text-xs text-stone-400">
            उपरोक्त फॉर्म से अपनी पहली सत्संग प्लेलिस्ट बनाएँ। जैसे ही भक्त प्लेलिस्ट बनाएँगे,
            वे यहाँ वास्तविक समय में प्रदर्शित होंगी।
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {playlists.map((pl) => {
            const isOpen = expanded === pl.id;
            const missing = bhajans.filter((b) => !pl.bhajanIds.includes(b.id));
            return (
              <div key={pl.id} className="admin-card p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-lg bg-[#EFF6FF] text-blue-700 border border-blue-100 flex items-center justify-center">
                    <ListMusic className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setExpanded(isOpen ? null : pl.id)}
                      className="p-1.5 text-stone-600 hover:bg-stone-100 rounded-lg transition-colors text-xs font-bold"
                    >
                      {isOpen ? 'संक्षिप्त करें' : 'भजन देखें'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(pl)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="प्लेलिस्ट हटाएं"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <h4 className="font-extrabold text-sm text-stone-900">{pl.name}</h4>
                  <p className="text-[0.68rem] text-stone-500">
                    {pl.bhajanIds.length} भजन • निर्मित: {pl.createdAt || 'हाल ही में'}
                  </p>
                </div>

                {isOpen && (
                  <div className="pt-2 border-t border-stone-100 space-y-2">
                    <div className="space-y-1.5">
                      {pl.bhajanIds.length === 0 ? (
                        <p className="text-xs text-stone-400 py-2 text-center">
                          इस प्लेलिस्ट में अभी कोई भजन नहीं है।
                        </p>
                      ) : (
                        pl.bhajanIds.map((id) => (
                          <div
                            key={id}
                            className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-stone-50 border border-stone-200/80"
                          >
                            <span className="text-xs font-bold text-stone-800 truncate flex items-center gap-1.5">
                              <Music className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                              {bhajanTitle(id)}
                            </span>
                            <button
                              type="button"
                              onClick={() => toggleBhajanInPlaylist(pl.id, id)}
                              className="p-1 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                              title="प्लेलिस्ट से निकालें"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>

                    {missing.length > 0 && (
                      <div className="flex items-center gap-2 pt-1">
                        <select
                          value=""
                          onChange={(e) => {
                            if (e.target.value) {
                              toggleBhajanInPlaylist(pl.id, e.target.value);
                            }
                          }}
                          className="admin-select flex-1"
                        >
                          <option value="">+ भजन जोड़ें…</option>
                          {missing.map((b) => (
                            <option key={b.id} value={b.id}>
                              {b.title} — {b.artist}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
