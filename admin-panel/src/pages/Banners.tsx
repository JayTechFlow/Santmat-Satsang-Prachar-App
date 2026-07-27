import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { db } from '../firebase/config';
import { collection, addDoc, onSnapshot, query, orderBy, doc, deleteDoc } from 'firebase/firestore';

export const Banners = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [order, setOrder] = useState<number | ''>('');
  const [active, setActive] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'banners'), orderBy('order', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBanners(data);
    }, (error) => {
      console.error("Error fetching banners: ", error);
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const newBanner = {
        title,
        imageUrl,
        order: Number(order) || 0,
        active
      };

      await addDoc(collection(db, 'banners'), newBanner);
      
      setTitle('');
      setImageUrl('');
      setOrder('');
      setActive(true);
      setIsFormOpen(false);
    } catch (error) {
      console.error("Error adding banner: ", error);
      alert("Error adding banner. Check console.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this banner?")) {
      try {
        await deleteDoc(doc(db, 'banners', id));
      } catch (error) {
        console.error("Error deleting banner: ", error);
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Manage Banners</h2>
        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          <Plus className="w-4 h-4 mr-2" />
          {isFormOpen ? "Cancel" : "Add Banner"}
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
          <h3 className="text-lg font-semibold mb-4">Add New Banner</h3>
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
                  placeholder="Enter banner title..."
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <input
                  required
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                <input
                  required
                  type="number"
                  value={order}
                  onChange={(e) => setOrder(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="0"
                />
              </div>

              <div className="flex items-center pt-6">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                  <span className="text-sm font-medium text-gray-700">Active</span>
                </label>
              </div>
            </div>
            
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Banner'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-3 text-sm font-medium text-gray-500 w-24">Image</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-500">Title</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-500">Order</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-500">Status</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {banners.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  No banners found.
                </td>
              </tr>
            ) : (
              banners.map((b) => (
                <tr key={b.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    {b.imageUrl ? (
                      <img src={b.imageUrl} alt={b.title} className="w-16 h-10 object-cover rounded" />
                    ) : (
                      <div className="w-16 h-10 bg-gray-200 rounded"></div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{b.title}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{b.order}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {b.active ? (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Active</span>
                    ) : (
                      <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">Inactive</span>
                    )}
                  </td>
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
