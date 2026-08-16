/**
 * ============================================================================
 * Santmat Satsang Prachar - Books Library Management (Admin)
 * ============================================================================
 * Manage the devotional books library backed by the real `books` collection.
 * Create, publish/unpublish and delete books with optional cover upload to
 * Firebase Storage. Empty state shown when no books exist.
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  BookMarked,
  Plus,
  Trash2,
  Upload,
  Loader2,
  FileText,
  Calendar,
  Tag,
  User,
  Eye,
} from 'lucide-react';
import { bookService } from '../../services/bookService';
import { storageService } from '../../services/storageService';
import { BookEntity } from '../../types';

interface BookForm {
  title: string;
  author: string;
  category: string;
  pagesCount: string;
  publishDate: string;
  coverUrl: string;
  pdfUrl: string;
  status: 'published' | 'draft';
}

const EMPTY_FORM: BookForm = {
  title: '',
  author: '',
  category: '',
  pagesCount: '',
  publishDate: '',
  coverUrl: '',
  pdfUrl: '',
  status: 'published',
};

export const AdminBooks: React.FC = () => {
  const [books, setBooks] = useState<BookEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState<BookForm>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return bookService.subscribeBooks(
      (data) => {
        setBooks(data);
        setLoading(false);
      },
      () => {
        setError('पुस्तकें लोड करने में त्रुटि');
        setLoading(false);
      }
    );
  }, []);

  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), 3500);
  };

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setIsFormOpen(true);
  };

  const openEdit = (book: BookEntity) => {
    setForm({
      title: book.title,
      author: book.author,
      category: book.category,
      pagesCount: book.pagesCount ? String(book.pagesCount) : '',
      publishDate: book.publishDate || '',
      coverUrl: book.coverUrl || '',
      pdfUrl: book.pdfUrl || '',
      status: book.status === 'draft' ? 'draft' : 'published',
    });
    setEditingId(book.id);
    setIsFormOpen(true);
  };

  const handleCoverUpload = async (file: File) => {
    setIsUploading(true);
    const res = await storageService.uploadFile(file, 'book_covers');
    setIsUploading(false);
    if (res.success && res.data) {
      setForm((f) => ({ ...f, coverUrl: res.data.downloadUrl }));
      showMessage('कवर इमेज अपलोड हो गई।');
    } else {
      alert(res.error || 'कवर अपलोड विफल रहा।');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.author.trim()) return;

    const payload: Omit<BookEntity, 'id'> = {
      title: form.title.trim(),
      author: form.author.trim(),
      category: form.category.trim() || 'सामान्य',
      coverUrl: form.coverUrl.trim() || undefined,
      pdfUrl: form.pdfUrl.trim() || undefined,
      pagesCount: form.pagesCount ? Number(form.pagesCount) : undefined,
      publishDate: form.publishDate.trim() || undefined,
      status: form.status,
    };

    if (editingId) {
      const res = await bookService.updateBook(editingId, payload);
      if (res.success) {
        showMessage('पुस्तक विवरण अपडेट हुआ।');
      } else {
        alert(res.error || 'अपडेट में त्रुटि');
        return;
      }
    } else {
      const res = await bookService.addBook(payload);
      if (res.success) {
        showMessage('नई पुस्तक जोड़ी गई।');
      } else {
        alert(res.error || 'पुस्तक सहेजने में त्रुटि');
        return;
      }
    }

    setIsFormOpen(false);
  };

  const toggleStatus = async (book: BookEntity) => {
    const next = book.status === 'draft' ? 'published' : 'draft';
    const res = await bookService.updateBook(book.id, { status: next });
    if (res.success) {
      showMessage(next === 'published' ? 'पुस्तक प्रकाशित हुई।' : 'पुस्तक ड्राफ्ट की गई।');
    } else {
      alert(res.error || 'स्टेटस अपडेट में त्रुटि');
    }
  };

  const handleDelete = async (book: BookEntity) => {
    if (!confirm(`क्या आप '${book.title}' हटाना चाहते हैं?`)) return;
    const res = await bookService.deleteBook(book.id);
    if (res.success) {
      showMessage('पुस्तक हटा दी गई।');
    } else {
      alert(res.error || 'पुस्तक हटाने में त्रुटि');
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto font-['Mukta'] select-none">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-emerald-950 via-teal-950 to-stone-900 p-6 rounded-3xl text-white shadow-md">
        <div>
          <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-1">
            <BookMarked className="w-4 h-4" />
            <span>पुस्तकालय प्रबंधन</span>
          </div>
          <h1 className="text-2xl font-extrabold">संत साहित्य पुस्तकालय (Books Library)</h1>
          <p className="text-stone-300 text-sm mt-1 max-w-2xl">
            आध्यात्मिक ग्रंथों, किताबों एवं संत साहित्य का प्रबंधन करें — नई पुस्तक जोड़ें,
            कवर अपलोड करें, प्रकाशित/ड्राफ्ट स्थिति नियंत्रित करें।
          </p>
        </div>

        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold rounded-xl text-sm transition-all shadow-md active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>नई पुस्तक</span>
        </button>
      </div>

      {message && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-emerald-500/30 text-xs font-bold">
          {message}
        </div>
      )}

      {/* Books Grid */}
      {loading ? (
        <div className="bg-white rounded-3xl p-12 border border-stone-200 shadow-xs text-center space-y-3">
          <Loader2 className="w-10 h-10 mx-auto text-emerald-600 animate-spin" />
          <p className="text-sm font-bold text-stone-600">पुस्तकें लोड हो रही हैं…</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 rounded-3xl p-12 border border-red-200 shadow-xs text-center space-y-2">
          <p className="text-sm font-bold text-red-700">{error}</p>
        </div>
      ) : books.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-stone-200 shadow-xs text-center space-y-3">
          <BookMarked className="w-12 h-12 mx-auto text-stone-300" />
          <p className="text-sm font-bold text-stone-600">पुस्तकालय अभी खाली है</p>
          <p className="text-xs text-stone-400">
            "नई पुस्तक" बटन से पहली पुस्तक जोड़ें। यहाँ प्रदर्शित सारा डेटा वास्तविक `books` संग्रह से आता है।
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {books.map((book) => (
            <div key={book.id} className="bg-white rounded-3xl overflow-hidden border border-stone-200 shadow-xs hover:shadow-md transition-all flex flex-col">
              <div className="relative h-44 bg-gradient-to-br from-emerald-900 to-stone-900 flex items-center justify-center">
                {book.coverUrl ? (
                  <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
                ) : (
                  <BookMarked className="w-12 h-12 text-emerald-500/60" />
                )}
                <span
                  className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[0.62rem] font-bold ${
                    book.status === 'draft'
                      ? 'bg-stone-800/80 text-stone-200'
                      : 'bg-emerald-500/90 text-stone-950'
                  }`}
                >
                  {book.status === 'draft' ? 'ड्राफ्ट' : 'प्रकाशित'}
                </span>
              </div>

              <div className="p-4 flex-1 flex flex-col gap-2">
                <div>
                  <h4 className="font-extrabold text-sm text-stone-900 leading-tight">{book.title}</h4>
                  <p className="text-[0.68rem] text-stone-500 mt-0.5 flex items-center gap-1">
                    <User className="w-3 h-3" /> {book.author}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-[0.65rem] font-bold text-stone-600">
                  <span className="flex items-center gap-1 bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                    <Tag className="w-3 h-3" /> {book.category}
                  </span>
                  {book.pagesCount ? (
                    <span className="flex items-center gap-1 bg-stone-50 text-stone-600 px-2 py-0.5 rounded-full border border-stone-200">
                      <FileText className="w-3 h-3" /> {book.pagesCount} पृष्ठ
                    </span>
                  ) : null}
                  {book.publishDate ? (
                    <span className="flex items-center gap-1 bg-stone-50 text-stone-600 px-2 py-0.5 rounded-full border border-stone-200">
                      <Calendar className="w-3 h-3" /> {book.publishDate}
                    </span>
                  ) : null}
                </div>

                <div className="pt-2 mt-auto border-t border-stone-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => toggleStatus(book)}
                    className="flex items-center gap-1 text-xs font-bold text-emerald-800 hover:underline"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    {book.status === 'draft' ? 'प्रकाशित करें' : 'ड्राफ्ट करें'}
                  </button>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEdit(book)}
                      className="text-xs font-bold text-amber-800 hover:underline"
                    >
                      संपादित करें
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(book)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="हटाएं"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Book Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-stone-200 shadow-2xl space-y-4 relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-lg">
                <BookMarked className="w-6 h-6 text-emerald-700" />
                <span>{editingId ? 'पुस्तक संपादित करें' : 'नई पुस्तक जोड़ें'}</span>
              </div>
              <button
                onClick={() => setIsFormOpen(false)}
                className="text-stone-400 hover:text-stone-700 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs font-bold">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 mb-1">पुस्तक का नाम *</label>
                  <input
                    required
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="उदा. सत्यनाम की महिमा"
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 mb-1">लेखक / ग्रन्थ *</label>
                  <input
                    required
                    type="text"
                    value={form.author}
                    onChange={(e) => setForm({ ...form, author: e.target.value })}
                    placeholder="उदा. पूज्य गुरुदेव"
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-stone-700 mb-1">श्रेणी</label>
                  <input
                    type="text"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    placeholder="उदा. सत्संग"
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 mb-1">पृष्ठ</label>
                  <input
                    type="number"
                    min={1}
                    value={form.pagesCount}
                    onChange={(e) => setForm({ ...form, pagesCount: e.target.value })}
                    placeholder="0"
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 mb-1">प्रकाशन तिथि</label>
                  <input
                    type="date"
                    value={form.publishDate}
                    onChange={(e) => setForm({ ...form, publishDate: e.target.value })}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Cover Upload */}
              <div>
                <label className="block text-stone-700 mb-1">कवर इमेज</label>
                <div className="flex items-center gap-2">
                  <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) handleCoverUpload(e.target.files[0]);
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => coverInputRef.current?.click()}
                    disabled={isUploading}
                    className="flex items-center gap-1.5 px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold disabled:opacity-60"
                  >
                    {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                    {isUploading ? 'अपलोड हो रहा…' : 'अपलोड करें'}
                  </button>
                  {form.coverUrl && (
                    <img src={form.coverUrl} alt="Cover" className="w-10 h-14 object-cover rounded-lg border border-stone-200" />
                  )}
                </div>
                <p className="text-[0.65rem] text-stone-400 mt-1">इमेज Firebase Storage में अपलोड होगी और असली download URL संग्रहित होगा।</p>
              </div>

              <div>
                <label className="block text-stone-700 mb-1">PDF / फ़ाइल URL</label>
                <input
                  type="url"
                  value={form.pdfUrl}
                  onChange={(e) => setForm({ ...form, pdfUrl: e.target.value })}
                  placeholder="https://…"
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-stone-700 mb-1">स्थिति</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as 'published' | 'draft' })}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:border-emerald-500"
                >
                  <option value="published">प्रकाशित</option>
                  <option value="draft">ड्राफ्ट</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md"
                >
                  {editingId ? 'अपडेट करें' : 'पुस्तक जोड़ें'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
