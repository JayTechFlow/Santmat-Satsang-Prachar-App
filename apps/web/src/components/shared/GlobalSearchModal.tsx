/**
 * ============================================================================
 * Santmat Satsang Prachar — Global Search Modal
 * ============================================================================
 * Cmd+K / Ctrl+K triggered search. Client-side search across all content.
 * Focus trap, ESC close, result navigation, loading/empty/error states.
 */
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Search, X, Music, BookOpen, Heart, FileText, Folder, Users, ListMusic, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { bhajanService } from '../../features/audio/services/bhajanService';
import { bookService } from '../../features/books/services/bookService';
import { stutiService } from '../../features/stuti/services/stutiService';
import { categoryService } from '../../features/categories/services/categoryService';

export interface SearchResultItem {
  id: string;
  title: string;
  subtitle?: string;
  type: 'Audio' | 'Book' | 'StutiVinati' | 'Category' | 'User' | 'Playlist';
  link: string;
}

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('all');
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const handleSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const q = searchQuery.toLowerCase();
      const [bhajans, books, stutis, categories] = await Promise.all([
        bhajanService.getBhajans().catch(() => []),
        bookService.getBooks().catch(() => []),
        stutiService.getStutis().catch(() => []),
        categoryService.getCategories().catch(() => []),
      ]);

      const items: SearchResultItem[] = [];

      const bhajanList = Array.isArray(bhajans) ? bhajans : (bhajans.success && bhajans.data ? bhajans.data : []);
      const bookList = Array.isArray(books) ? books : [];
      const stutiList = Array.isArray(stutis) ? stutis : (stutis.success && stutis.data ? stutis.data : []);
      const categoryList = Array.isArray(categories) ? categories : [];

      bhajanList.forEach((b: any) => {
        const titleStr = (b.title || '').toLowerCase();
        const descStr = (b.description || '').toLowerCase();
        if (titleStr.includes(q) || descStr.includes(q)) {
          items.push({ id: String(b.id), title: b.title || 'अनाम भजन', subtitle: b.description || 'ऑडियो भजन / प्रवचन', type: 'Audio', link: '/admin/bhajan-list' });
        }
      });

      bookList.forEach((b: any) => {
        const titleStr = (b.title || '').toLowerCase();
        const authorStr = (b.author || '').toLowerCase();
        if (titleStr.includes(q) || authorStr.includes(q)) {
          items.push({ id: String(b.id), title: b.title || 'अनाम ग्रंथ', subtitle: b.author || 'ग्रंथ / पुस्तक PDF', type: 'Book', link: '/admin/books' });
        }
      });

      stutiList.forEach((s: any) => {
        const titleStr = (s.title || '').toLowerCase();
        const contentStr = (s.lyrics || s.content || '').toLowerCase();
        if (titleStr.includes(q) || contentStr.includes(q)) {
          items.push({ id: String(s.id), title: s.title || 'अनाम पाठ', subtitle: s.type || 'स्तुति एवं विनती', type: 'StutiVinati', link: '/admin/stuti-vinati' });
        }
      });

      categoryList.forEach((c: any) => {
        const nameStr = (c.name || '').toLowerCase();
        if (nameStr.includes(q)) {
          items.push({ id: String(c.id), title: c.name || c.id, subtitle: c.description || 'श्रेणी', type: 'Category', link: '/admin/categories' });
        }
      });

      setResults(items);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, handleSearch]);

  const filteredResults = useMemo(() => {
    if (selectedType === 'all') return results;
    return results.filter((item) => item.type.toLowerCase() === selectedType.toLowerCase());
  }, [results, selectedType]);

  const getIcon = (type: SearchResultItem['type']) => {
    switch (type) {
      case 'Audio': return <Music className="w-4 h-4 text-amber-600" />;
      case 'Book': return <BookOpen className="w-4 h-4 text-blue-600" />;
      case 'StutiVinati': return <Heart className="w-4 h-4 text-rose-600" />;
      case 'Category': return <Folder className="w-4 h-4 text-emerald-600" />;
      case 'User': return <Users className="w-4 h-4 text-stone-700" />;
      default: return <ListMusic className="w-4 h-4 text-amber-600" />;
    }
  };

  const handleSelect = (item: SearchResultItem) => {
    navigate(item.link);
    onClose();
  };

  // Focus trap
  const handlePanelKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
      return;
    }
    if (e.key !== 'Tab' || !panelRef.current) return;
    const focusable = panelRef.current.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }, [onClose]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => inputRef.current?.focus());
    } else {
      setQuery('');
      setResults([]);
      setSelectedType('all');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs flex items-start justify-center pt-20 p-4 z-[60] animate-in fade-in duration-150 font-['Mukta']"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="वैश्विक खोज"
    >
      <div
        ref={panelRef}
        className="bg-white rounded-xl border border-stone-200 shadow-2xl max-w-2xl w-full p-0 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handlePanelKeyDown}
      >
        {/* Search Header Input */}
        <div className="flex items-center px-5 py-4 border-b border-stone-100">
          <Search className="w-5 h-5 text-stone-400 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            className="w-full bg-transparent text-sm text-stone-900 font-medium outline-none placeholder-stone-400"
            placeholder="ऑडियो, ग्रंथ, स्तुति एवं श्रेणियाँ खोजें..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="खोज"
          />
          {query && (
            <button type="button" onClick={() => setQuery('')} className="p-1 text-stone-400 hover:text-stone-700 mr-2">
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="px-2 py-1 bg-stone-100 text-stone-500 rounded-lg text-[0.7rem] font-bold hover:bg-stone-200 transition-colors"
          >
            ESC
          </button>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 px-5 py-2.5 bg-stone-50 border-b border-stone-100 overflow-x-auto text-xs" role="tablist">
          {['all', 'audio', 'book', 'stutivinati', 'category'].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setSelectedType(type)}
              role="tab"
              aria-selected={selectedType === type}
              className={`px-3 py-1 rounded-xl font-bold transition-all whitespace-nowrap ${
                selectedType === type ? 'bg-amber-600 text-white shadow-xs' : 'text-stone-600 hover:bg-stone-200/60'
              }`}
            >
              {type === 'all' ? 'सभी' : type === 'stutivinati' ? 'स्तुति-विनती' : type === 'audio' ? 'ऑडियो' : type === 'book' ? 'ग्रंथ' : 'श्रेणी'}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-3" role="listbox" aria-label="खोज परिणाम">
          {loading && (
            <div className="p-6 text-center">
              <div className="w-5 h-5 border-2 border-amber-300 border-t-amber-600 rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs font-bold text-stone-500">सभी संग्रहों में खोज जारी है…</p>
            </div>
          )}

          {!loading && query && filteredResults.length === 0 && (
            <div className="p-8 text-center text-xs font-bold text-stone-500">"{query}" के लिए कोई परिणाम नहीं मिला।</div>
          )}

          {!loading && !query && (
            <div className="p-6 text-center text-xs text-stone-400 font-medium">
              संतमत सत्संग प्रचार की सभी सामग्री खोजने के लिए ऊपर टाइप करें।
            </div>
          )}

          {!loading &&
            filteredResults.map((item) => (
              <div
                key={`${item.type}-${item.id}`}
                onClick={() => handleSelect(item)}
                role="option"
                className="flex items-center justify-between p-3 rounded-2xl hover:bg-amber-50/60 active:bg-amber-100/40 cursor-pointer transition-colors group mb-1"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-xl bg-stone-100 group-hover:bg-amber-100 transition-colors shrink-0">
                    {getIcon(item.type)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-stone-900 truncate">{item.title}</div>
                    <div className="text-[0.7rem] text-stone-500 truncate">{item.subtitle}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-2 py-0.5 bg-stone-100 text-stone-600 rounded-lg text-[0.65rem] font-bold">
                    {item.type}
                  </span>
                  <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-amber-700 transition-colors" />
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
