import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { db } from '../firebase/config';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, doc, deleteDoc } from 'firebase/firestore';

export const Books = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [language, setLanguage] = useState('Hindi');
  const [edition, setEdition] = useState('');
  const [pageCount, setPageCount] = useState<number | ''>('');
  const [readingTime, setReadingTime] = useState<number | ''>('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [pdfUrlPlaceholder, setPdfUrlPlaceholder] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  
  const [isFeatured, setIsFeatured] = useState(false);
  const [isPopular, setIsPopular] = useState(false);
  const [isRecentlyAdded, setIsRecentlyAdded] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'books'), orderBy('publicationDate', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBooks(data);
    }, (error) => {
      console.error("Error fetching books: ", error);
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const tags = tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag);

      const newBook = {
        title,
        subtitle,
        description,
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
        edition,
        publicationDate: serverTimestamp(),
        pageCount: Number(pageCount) || 0,
        estimatedReadingTimeMinutes: Number(readingTime) || 0,
        coverImageUrl,
        thumbnailUrl,
        tags,
        isFeatured,
        isPopular,
        isRecentlyAdded,
        chapters: [],
        pdfUrlPlaceholder
      };

      await addDoc(collection(db, 'books'), newBook);
      
      // Reset form
      setTitle('');
      setSubtitle('');
      setDescription('');
      setAuthorName('');
      setCategoryName('');
      setLanguage('Hindi');
      setEdition('');
      setPageCount('');
      setReadingTime('');
      setCoverImageUrl('');
      setThumbnailUrl('');
      setPdfUrlPlaceholder('');
      setTagsInput('');
      setIsFeatured(false);
      setIsPopular(false);
      setIsRecentlyAdded(true);
      
      setIsFormOpen(false);
    } catch (error) {
      console.error("Error adding book: ", error);
      alert("Error adding book. Check console.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this book?")) {
      try {
        await deleteDoc(doc(db, 'books', id));
      } catch (error) {
        console.error("Error deleting book: ", error);
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Manage Books</h2>
        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          <Plus className="w-4 h-4 mr-2" />
          {isFormOpen ? "Cancel" : "Add Book"}
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
          <h3 className="text-lg font-semibold mb-4">Add New Book</h3>
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
                  placeholder="Enter book title"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Author Name</label>
                <input
                  required
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Author name"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Book description..."
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
                  placeholder="E.g., Spiritual"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Edition</label>
                <input
                  type="text"
                  value={edition}
                  onChange={(e) => setEdition(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="E.g., First Edition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Page Count</label>
                <input
                  type="number"
                  value={pageCount}
                  onChange={(e) => setPageCount(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="e.g. 200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reading Time (minutes)</label>
                <input
                  type="number"
                  value={readingTime}
                  onChange={(e) => setReadingTime(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="e.g. 300"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">PDF URL</label>
                <input
                  type="text"
                  value={pdfUrlPlaceholder}
                  onChange={(e) => setPdfUrlPlaceholder(e.target.value)}
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
                  placeholder="peace, truth"
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
                {loading ? 'Saving...' : 'Save Book'}
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
              <th className="px-6 py-3 text-sm font-medium text-gray-500">Author</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-500">Language</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {books.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                  No books found.
                </td>
              </tr>
            ) : (
              books.map((b) => (
                <tr key={b.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                    {b.title}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{b.author?.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{b.language}</td>
                  <td className="px-6 py-4 text-sm text-right">
                    <button onClick={() => handleDelete(b.id)} className="text-red-600 hover:text-red-800">
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
