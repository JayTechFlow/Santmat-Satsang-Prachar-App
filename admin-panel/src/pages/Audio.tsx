import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { db } from '../firebase/config';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, doc, deleteDoc } from 'firebase/firestore';

export const Audio = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [audios, setAudios] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [speaker, setSpeaker] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [durationMinutes, setDurationMinutes] = useState<number | ''>('');
  const [language, setLanguage] = useState('Hindi');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [artworkUrl, setArtworkUrl] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  
  const [isFeatured, setIsFeatured] = useState(false);
  const [isRecentlyAdded, setIsRecentlyAdded] = useState(true);
  const [isPopular, setIsPopular] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'audio'), orderBy('releaseDate', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAudios(data);
    }, (error) => {
      console.error("Error fetching audios: ", error);
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const newAudio = {
        title,
        subtitle,
        description,
        speaker,
        categoryId: categoryName.toLowerCase().replace(/\s+/g, '-'),
        categoryName,
        durationMinutes: Number(durationMinutes) || 0,
        language,
        thumbnailUrl,
        artworkUrl,
        audioUrl,
        releaseDate: serverTimestamp(),
        playCount: 0,
        favoriteCount: 0,
        isFeatured,
        isRecentlyAdded,
        isPopular
      };

      await addDoc(collection(db, 'audio'), newAudio);
      
      // Reset form
      setTitle('');
      setSubtitle('');
      setDescription('');
      setSpeaker('');
      setCategoryName('');
      setDurationMinutes('');
      setLanguage('Hindi');
      setThumbnailUrl('');
      setArtworkUrl('');
      setAudioUrl('');
      setIsFeatured(false);
      setIsRecentlyAdded(true);
      setIsPopular(false);
      
      setIsFormOpen(false);
    } catch (error) {
      console.error("Error adding audio: ", error);
      alert("Error adding audio. Check console.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this audio?")) {
      try {
        await deleteDoc(doc(db, 'audio', id));
      } catch (error) {
        console.error("Error deleting audio: ", error);
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Latest Audio</h2>
        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          <Plus className="w-4 h-4 mr-2" />
          {isFormOpen ? "Cancel" : "Add Audio"}
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
          <h3 className="text-lg font-semibold mb-4">Add New Audio</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  required
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Enter audio title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Optional subtitle"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Speaker</label>
                <input
                  required
                  type="text"
                  value={speaker}
                  onChange={(e) => setSpeaker(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Speaker name"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Audio description..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                <input
                  required
                  type="text"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="E.g., Morning Satsang"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                <input
                  required
                  type="number"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="e.g. 45"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                <select 
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="Hindi">Hindi</option>
                  <option value="English">English</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Audio URL (.mp3)</label>
                <input
                  required
                  type="text"
                  value={audioUrl}
                  onChange={(e) => setAudioUrl(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail URL</label>
                <input
                  type="text"
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Artwork URL (optional)</label>
                <input
                  type="text"
                  value={artworkUrl}
                  onChange={(e) => setArtworkUrl(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="https://..."
                />
              </div>

              <div className="flex items-center space-x-6 col-span-2 pt-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                  <span className="text-sm font-medium text-gray-700">Is Featured</span>
                </label>
                
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isRecentlyAdded}
                    onChange={(e) => setIsRecentlyAdded(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                  <span className="text-sm font-medium text-gray-700">Is Recently Added</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPopular}
                    onChange={(e) => setIsPopular(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                  <span className="text-sm font-medium text-gray-700">Is Popular</span>
                </label>
              </div>
            </div>
            
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Audio'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-3 text-sm font-medium text-gray-500">Title</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-500">Speaker</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-500">Category</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-500">Duration</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {audios.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  No audio tracks found.
                </td>
              </tr>
            ) : (
              audios.map((a) => (
                <tr key={a.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                    {a.title}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{a.speaker}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{a.categoryName}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{a.durationMinutes} min</td>
                  <td className="px-6 py-4 text-sm text-right">
                    <button onClick={() => handleDelete(a.id)} className="text-red-600 hover:text-red-800">
                      <Trash2 className="w-4 h-4 inline" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
