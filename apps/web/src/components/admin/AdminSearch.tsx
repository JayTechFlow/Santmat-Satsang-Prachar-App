/**
 * ============================================================================
 * Santmat Satsang Prachar - Global Search (Admin)
 * ============================================================================
 * Searches the shared `search_index` via the `search-globalSearch` Cloud
 * Function. Results reflect the real index built from the `media` collection.
 * Empty and error states are honest — no fallback to fabricated results.
 */
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Loader2,
  Music,
  BookOpen,
  BookMarked,
  Inbox,
  AlertTriangle,
} from 'lucide-react';
import { searchService, SearchResultItem } from '../../services/shared/searchService';
import { AdminPageHeader } from './AdminPageHeader';

const TYPE_ROUTES: Record<SearchResultItem['type'], string> = {
  bhajan: '/admin/bhajan-list',
  stuti: '/admin/stuti-vinati',
  book: '/admin/books',
};

const TYPE_LABELS: Record<SearchResultItem['type'], { label: string; className: string; icon: React.ReactNode }> = {
  bhajan: { label: 'भजन', className: 'bg-orange-50 text-orange-800 border-orange-200', icon: <Music className="w-3 h-3" /> },
  stuti: { label: 'स्तुति', className: 'bg-purple-50 text-purple-800 border-purple-200', icon: <BookOpen className="w-3 h-3" /> },
  book: { label: 'पुस्तक', className: 'bg-emerald-50 text-emerald-800 border-emerald-200', icon: <BookMarked className="w-3 h-3" /> },
};

export const AdminSearch: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setTotal(0);
      setLoading(false);
      setError(null);
      setSearched(false);
      return;
    }

    setLoading(true);
    setError(null);

    debounceRef.current = setTimeout(async () => {
      const res = await searchService.globalSearch(trimmed);
      setLoading(false);
      setSearched(true);
      if (res.success) {
        setResults(res.data || []);
        setTotal(res.data?.length ?? 0);
      } else {
        setError(res.error || 'खोज सेवा अनुपलब्ध');
        setResults([]);
        setTotal(0);
      }
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto font-['Mukta'] select-none">
      {/* Canonical Admin Page Header */}
      <AdminPageHeader
        title="संतमत सामग्री खोजें"
        subtitle="वैश्विक खोज: audio, stuti_vinati, books संग्रहों से वास्तविक समय में खोजें"
        badgeText="वैश्विक खोज इंजन"
        badgeVariant="primary"
        icon={<Search className="w-4 h-4 text-orange-600" />}
      />

      <div className="admin-card p-5 space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="भजन, स्तुति या पुस्तक खोजें…"
            className="w-full pl-11 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-[0.625rem] text-sm focus:outline-none focus:border-[#EA580C] focus:ring-2 focus:ring-[#EA580C]/20"
          />
          {loading && <Loader2 className="w-4 h-4 text-[#EA580C] animate-spin absolute right-4 top-1/2 -translate-y-1/2" />}
        </div>

        {searched && !loading && !error && (
          <p className="text-xs text-stone-500 font-bold">
            {total > 0 ? `${total} परिणाम मिले` : 'कोई परिणाम नहीं मिला'}
          </p>
        )}
      </div>

      {/* Results */}
      {loading ? (
        <div className="bg-white rounded-xl p-10 border border-stone-200 shadow-xs text-center space-y-2">
          <Loader2 className="w-8 h-8 mx-auto text-orange-600 animate-spin" />
          <p className="text-xs font-bold text-stone-600">खोज हो रही है…</p>
        </div>
      ) : error ? (
        <div className="bg-amber-50 rounded-xl p-10 border border-amber-200 shadow-xs text-center space-y-2">
          <AlertTriangle className="w-10 h-10 mx-auto text-amber-600" />
          <p className="text-sm font-bold text-amber-900">खोज सेवा अनुपलब्ध</p>
          <p className="text-xs text-amber-800">{error}</p>
        </div>
      ) : searched && results.length === 0 ? (
        <div className="bg-white rounded-xl p-10 border border-stone-200 shadow-xs text-center space-y-2">
          <Inbox className="w-10 h-10 mx-auto text-stone-300" />
          <p className="text-sm font-bold text-stone-600">"{query.trim()}" के लिए कोई परिणाम नहीं</p>
          <p className="text-xs text-stone-400">
            खोज सूचकांक अभी खाली है अथवा आपका कीवर्ड उपलब्ध नहीं है। कीवर्ड बदलकर पुनः प्रयास करें।
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {results.map((item) => {
            const typeInfo = TYPE_LABELS[item.type];
            const targetRoute = TYPE_ROUTES[item.type] || '/admin/bhajan-list';
            return (
              <div
                key={item.id}
                onClick={() => navigate(targetRoute)}
                className="bg-white rounded-xl p-4 border border-stone-200 shadow-xs flex items-center justify-between gap-4 cursor-pointer hover:border-amber-400 hover:shadow-xs transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-stone-50 border border-stone-200 flex items-center justify-center text-stone-500 shrink-0">
                    {typeInfo.icon}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-extrabold text-sm text-stone-900 truncate">{item.title}</h4>
                    {item.subtitle && <p className="text-[0.7rem] text-stone-500 truncate mt-0.5">{item.subtitle}</p>}
                    {item.category && <p className="text-[0.68rem] text-amber-800 font-semibold mt-0.5">{item.category}</p>}
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[0.65rem] font-bold border shrink-0 flex items-center gap-1 ${typeInfo.className}`}>
                  {typeInfo.icon}
                  {typeInfo.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
