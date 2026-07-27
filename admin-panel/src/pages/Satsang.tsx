import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { db } from '../firebase/config';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, doc, deleteDoc } from 'firebase/firestore';

export const Satsang = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [satsangs, setSatsangs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [speakerName, setSpeakerName] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [durationMinutes, setDurationMinutes] = useState<number | ''>('');
  const [language, setLanguage] = useState('Hindi');
  const [location, setLocation] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  
  const [isFeatured, setIsFeatured] = useState(false);
  const [isPopular, setIsPopular] = useState(false);
  const [isRecentlyAdded, setIsRecentlyAdded] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'satsangs'), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSatsangs(data);
    }, (error) => {
      console.error("Error fetching satsangs: ", error);
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const tags = tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag);

      const newSatsang = {
        title,
        subtitle,
        description,
        speakerId: speakerName.toLowerCase().replace(/\s+/g, '-'),
        speakerName,
        speakerPhotoUrl: "",
        speakerBio: "",
        categoryId: categoryName.toLowerCase().replace(/\s+/g, '-'),
        categoryName,
        durationMinutes: Number(durationMinutes) || 0,
        language,
        date: serverTimestamp(),
        location,
        thumbnailUrl,
        coverImageUrl,
        videoUrl,
        audioUrl,
        tags,
        isFeatured,
        isPopular,
        isRecentlyAdded
      };

      await addDoc(collection(db, 'satsangs'), newSatsang);
      
      // Reset form
      setTitle('');
      setSubtitle('');
      setDescription('');
      setSpeakerName('');
      setCategoryName('');
      setDurationMinutes('');
      setLanguage('Hindi');
      setLocation('');
      setThumbnailUrl('');
      setCoverImageUrl('');
      setVideoUrl('');
      setAudioUrl('');
      setTagsInput('');
      setIsFeatured(false);
      setIsPopular(false);
      setIsRecentlyAdded(true);
      
      setIsFormOpen(false);
    } catch (error) {
      console.error("Error adding satsang: ", error);
      alert("Error adding satsang. Check console.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this satsang?")) {
      try {
        await deleteDoc(doc(db, 'satsangs', id));
      } catch (error) {
        console.error("Error deleting satsang: ", error);
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Manage Satsang Videos</h2>
        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          <Plus className="w-4 h-4 mr-2" />
          {isFormOpen ? "Cancel" : "Add Satsang"}
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
          <h3 className="text-lg font-semibold mb-4">Add New Satsang</h3>
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
                  placeholder="Enter satsang title"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Speaker Name</label>
                <input
                  required
                  type="text"
                  value={speakerName}
                  onChange={(e) => setSpeakerName(e.target.value)}
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
                  placeholder="Satsang description..."
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
                  placeholder="E.g., Sunday Satsang"
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
                  placeholder="e.g. 60"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="E.g., Haridwar Ashram"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Video URL (optional)</label>
                <input
                  type="text"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Audio URL (optional)</label>
                <input
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image URL</label>
                <input
                  type="text"
                  value={coverImageUrl}
                  onChange={(e) => setCoverImageUrl(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="https://..."
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="peace, truth, satsang"
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
                    checked={isPopular}
                    onChange={(e) => setIsPopular(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                  <span className="text-sm font-medium text-gray-700">Is Popular</span>
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
              </div>
            </div>
            
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Satsang'}
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
              <th className="px-6 py-3 text-sm font-medium text-gray-500">Location</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {satsangs.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                  No satsangs found.
                </td>
              </tr>
            ) : (
              satsangs.map((s) => (
                <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                    {s.title}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{s.speakerName}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{s.location}</td>
                  <td className="px-6 py-4 text-sm text-right">
                    <button onClick={() => handleDelete(s.id)} className="text-red-600 hover:text-red-800">
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
