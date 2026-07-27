import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { db } from '../firebase/config';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, doc, deleteDoc } from 'firebase/firestore';

export const Quotes = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [quoteText, setQuoteText] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [language, setLanguage] = useState('Hindi');
  const [tagsInput, setTagsInput] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isDaily, setIsDaily] = useState(false);
  const [reference, setReference] = useState('');
  const [backgroundImageUrl, setBackgroundImageUrl] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'daily_quotes'), orderBy('createdDate', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setQuotes(data);
    }, (error) => {
      console.error("Error fetching quotes: ", error);
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const tags = tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag);
      
      const newQuote = {
        quoteText,
        author: {
          id: authorName.toLowerCase().replace(/\s+/g, '-'),
          name: authorName,
          bio: "",
          imageUrl: ""
        },
        category: {
          id: categoryName.toLowerCase().replace(/\s+/g, '-'),
          name: categoryName,
          description: ""
        },
        language,
        reference,
        tags,
        createdDate: serverTimestamp(),
        isFeatured,
        isDaily,
        backgroundImageUrl,
        gradientThemeId: ""
      };

      await addDoc(collection(db, 'daily_quotes'), newQuote);
      
      // Reset form
      setQuoteText('');
      setAuthorName('');
      setCategoryName('');
      setTagsInput('');
      setReference('');
      setBackgroundImageUrl('');
      setIsFeatured(false);
      setIsDaily(false);
      setIsFormOpen(false);
    } catch (error) {
      console.error("Error adding document: ", error);
      alert("Error adding quote. Check console.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this quote?")) {
      try {
        await deleteDoc(doc(db, 'daily_quotes', id));
      } catch (error) {
        console.error("Error deleting quote: ", error);
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Today's Suvichar (Quotes)</h2>
        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          <Plus className="w-4 h-4 mr-2" />
          {isFormOpen ? "Cancel" : "Add Quote"}
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
          <h3 className="text-lg font-semibold mb-4">Add New Quote</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Quote Text</label>
                <textarea
                  required
                  rows={3}
                  value={quoteText}
                  onChange={(e) => setQuoteText(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter the quote text..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Author Name</label>
                <input
                  required
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="E.g., Param Sant Kabir Sahib"
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
                  placeholder="E.g., Devotion"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="peace, truth, satsang"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reference (optional)</label>
                <input
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Source text"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Background Image URL (optional)</label>
                <input
                  type="text"
                  value={backgroundImageUrl}
                  onChange={(e) => setBackgroundImageUrl(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="https://..."
                />
              </div>

              <div className="flex items-center space-x-6 col-span-2">
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
                    checked={isDaily}
                    onChange={(e) => setIsDaily(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                  <span className="text-sm font-medium text-gray-700">Is Daily Quote</span>
                </label>
              </div>

            </div>
            
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Quote'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-3 text-sm font-medium text-gray-500">Quote</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-500">Author</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-500">Category</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-500">Status</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {quotes.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  No quotes found.
                </td>
              </tr>
            ) : (
              quotes.map((q) => (
                <tr key={q.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                    {q.quoteText}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{q.author?.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{q.category?.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {q.isDaily && <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mr-1">Daily</span>}
                    {q.isFeatured && <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">Featured</span>}
                  </td>
                  <td className="px-6 py-4 text-sm text-right">
                    <button onClick={() => handleDelete(q.id)} className="text-red-600 hover:text-red-800">
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
