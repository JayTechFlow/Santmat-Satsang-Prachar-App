import { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, X, Music, BookOpen, Heart, FileText, Folder, Users, ListMusic, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { bhajanService } from '../../features/bhajans/services/bhajanService';
import { bookService } from '../../features/books/services/bookService';
import { stutiVinatiService } from '../../features/stuti-vinati/services/stutiVinatiService';
import { suvicharService } from '../../features/suvichar/services/suvicharService';
import { categoryService } from '../../features/categories/services/categoryService';

export interface SearchResultItem {
  id: string;
  title: string;
  subtitle?: string;
  type: 'Audio' | 'Book' | 'StutiVinati' | 'Suvichar' | 'Category' | 'User' | 'Playlist';
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

  const handleSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const q = searchQuery.toLowerCase();
      const [bhajans, books, stutis, suvichars, categories] = await Promise.all([
        bhajanService.getAll().catch(() => []),
        bookService.getAll().catch(() => []),
        stutiVinatiService.getAll().catch(() => []),
        suvicharService.getAll().catch(() => []),
        categoryService.getAll().catch(() => []),
      ]);

      const items: SearchResultItem[] = [];

      bhajans.forEach((b) => {
        if (b.title?.toLowerCase().includes(q) || b.description?.toLowerCase().includes(q)) {
          items.push({ id: b.id, title: b.title, subtitle: b.description || 'Audio Track', type: 'Audio', link: '/audio' });
        }
      });

      books.forEach((b) => {
        if (b.title?.toLowerCase().includes(q) || b.author?.toLowerCase().includes(q)) {
          items.push({ id: b.id, title: b.title, subtitle: b.author || 'Book PDF', type: 'Book', link: '/books' });
        }
      });

      stutis.forEach((s) => {
        if (s.title?.toLowerCase().includes(q) || s.content?.toLowerCase().includes(q)) {
          items.push({ id: s.id, title: s.title, subtitle: s.type || 'Stuti & Vinati', type: 'StutiVinati', link: '/stuti-vinati' });
        }
      });

      suvichars.forEach((s) => {
        if (s.title?.toLowerCase().includes(q) || s.content?.toLowerCase().includes(q)) {
          items.push({ id: s.id, title: s.title, subtitle: s.content || 'Suvichar Quote', type: 'Suvichar', link: '/suvichar' });
        }
      });

      categories.forEach((c) => {
        if (c.name?.toLowerCase().includes(q)) {
          items.push({ id: c.id, title: c.name, subtitle: c.description || 'Category', type: 'Category', link: '/categories' });
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
      case 'Audio': return <Music className="w-4 h-4 text-primary" />;
      case 'Book': return <BookOpen className="w-4 h-4 text-info" />;
      case 'StutiVinati': return <Heart className="w-4 h-4 text-danger" />;
      case 'Suvichar': return <FileText className="w-4 h-4 text-warning" />;
      case 'Category': return <Folder className="w-4 h-4 text-success" />;
      case 'User': return <Users className="w-4 h-4 text-primary" />;
      default: return <ListMusic className="w-4 h-4 text-primary" />;
    }
  };

  const handleSelect = (item: SearchResultItem) => {
    navigate(item.link);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="dialog-backdrop flex items-start justify-center pt-20 p-4 z-50">
      <div className="dialog-content card max-w-2xl w-full p-0 overflow-hidden shadow-2xl">
        {/* Search Header Input */}
        <div className="flex items-center px-4 py-3 border-b">
          <Search className="w-5 h-5 text-muted mr-3" />
          <input
            type="text"
            autoFocus
            className="w-full bg-transparent text-base outline-none placeholder:text-muted"
            placeholder="Search audio, books, stutis, suvichar, categories..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button onClick={() => setQuery('')} className="btn-icon btn-sm text-muted mr-2">
              <X className="w-4 h-4" />
            </button>
          )}
          <button onClick={onClose} className="btn btn-ghost btn-sm text-xs">
            ESC
          </button>
        </div>

        {/* Category Filters */}
        <div className="flex items-center space-x-2 px-4 py-2 bg-muted/10 border-b overflow-x-auto text-xs">
          {['all', 'audio', 'book', 'stutivinati', 'suvichar', 'category'].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3 py-1 rounded-full capitalize font-medium transition ${
                selectedType === type ? 'bg-primary text-white' : 'hover:bg-muted/20 text-muted'
              }`}
            >
              {type === 'stutivinati' ? 'Stuti / Vinati' : type}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2">
          {loading && <div className="p-6 text-center text-sm text-muted">Searching across modules...</div>}

          {!loading && query && filteredResults.length === 0 && (
            <div className="p-8 text-center text-sm text-muted">No results found for "{query}".</div>
          )}

          {!loading && !query && (
            <div className="p-6 text-center text-xs text-muted">
              Type to search content across all Santmat Satsang Prachar modules.
            </div>
          )}

          {!loading &&
            filteredResults.map((item) => (
              <div
                key={`${item.type}-${item.id}`}
                onClick={() => handleSelect(item)}
                className="flex items-center justify-between p-3 rounded hover:bg-muted/10 cursor-pointer transition"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded bg-muted/10">{getIcon(item.type)}</div>
                  <div>
                    <div className="text-sm font-semibold text-foreground max-w-md truncate">{item.title}</div>
                    <div className="text-xs text-muted truncate max-w-md">{item.subtitle}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="badge badge-neutral text-xs">{item.type}</span>
                  <ArrowRight className="w-4 h-4 text-muted" />
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
