/**
 * ============================================================================
 * Santmat Satsang Prachar - Storage Media Library & Reconciliation (Admin)
 * ============================================================================
 * Enables administrators to manage, verify, and reconcile physical storage assets
 * with Firestore domain content. Features filtering, inline preview, secure linking
 * to domain documents, cross-system data integrity checks, and folder-by-folder
 * bucket exploration.
 */
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  HardDrive,
  Search,
  RefreshCw,
  Play,
  Pause,
  Copy,
  Link as LinkIcon,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Image as ImageIcon,
  Music,
  HelpCircle,
  FileCheck,
  X,
  UserCheck,
  ShieldCheck,
  Layers,
  Folder,
  ChevronRight,
  ArrowLeft,
  List,
} from 'lucide-react';
import {
  reconciliationService,
  StorageFile,
  ReconciliationData,
} from '../../services/shared/reconciliationService';
import { KNOWN_STORAGE_FOLDERS } from '../../services/storage/storageService';
import { bhajanService } from '../../features/audio/services/bhajanService';
import { bookService } from '../../features/books/services/bookService';
import { stutiService } from '../../features/stuti/services/stutiService';
import { bannerService } from '../../features/banners/services/bannerService';
import { useApp } from '../../app/providers/AppContext';
import { useToast } from '../../lib/hooks/useToast';
import {
  getCreatableCategories,
  sortCategoriesWithSystemFirst,
} from '../../features/categories/config/systemCategories';

export type MediaModuleState =
  | 'INITIAL'
  | 'LOADING'
  | 'SUCCESS_WITH_DATA'
  | 'SUCCESS_EMPTY'
  | 'ERROR'
  | 'REFRESHING';

export const AdminMediaLibrary: React.FC = () => {
  const { categories } = useApp();
  const toast = useToast();

  // Explicit module state machine
  const [moduleState, setModuleState] = useState<MediaModuleState>('INITIAL');
  const [data, setData] = useState<ReconciliationData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Tab & View Mode state
  const [activeTab, setActiveTab] = useState<'media' | 'content' | 'users'>('media');
  const [viewMode, setViewMode] = useState<'folders' | 'files'>('folders');
  const [currentFolderPath, setCurrentFolderPath] = useState<string>('');

  // Filtering state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<
    'all' | 'audio' | 'images' | 'banners' | 'books' | 'unmapped' | 'mapped'
  >('all');

  // Preview state
  const [previewingPath, setPreviewingPath] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Linking modal state
  const [linkingFile, setLinkingFile] = useState<StorageFile | null>(null);
  const [linkTargetCollection, setLinkTargetCollection] = useState<
    'audio' | 'books' | 'stuti_vinati' | 'banners'
  >('audio');
  const [linkMode, setLinkMode] = useState<'existing' | 'new'>('existing');
  const [existingItems, setExistingItems] = useState<any[]>([]);
  const [selectedItemId, setSelectedItemId] = useState('');
  const [isLinking, setIsLinking] = useState(false);

  // New record form state (for linking modal)
  const [newTitle, setNewTitle] = useState('');
  const [newArtistOrAuthor, setNewArtistOrAuthor] = useState('');
  const [newCategory, setNewCategory] = useState('');

  // Initial load
  useEffect(() => {
    fetchReconciliationData(false);
    return () => {
      stopAudio();
    };
  }, []);

  const fetchReconciliationData = async (isRefresh: boolean = false) => {
    stopAudio();
    if (isRefresh) {
      setModuleState('REFRESHING');
    } else {
      setModuleState('LOADING');
      setError(null);
    }

    try {
      const res = await reconciliationService.runReconciliation();
      if (res.success && res.data) {
        setData(res.data);
        const hasContent =
          res.data.storageFiles.length > 0 ||
          res.data.metrics.totalContentRecordsScanned > 0;
        setModuleState(hasContent ? 'SUCCESS_WITH_DATA' : 'SUCCESS_EMPTY');
        if (isRefresh) {
          toast.success('रीकॉन्सिलिएशन ऑडिट सफलतापूर्वक रीफ़्रेश किया गया।');
        }
      } else {
        const errorMsg = res.error || 'रीकॉन्सिलिएशन डेटा लोड करने में विफल।';
        if (isRefresh) {
          toast.error(errorMsg);
          setModuleState(data ? 'SUCCESS_WITH_DATA' : 'ERROR');
        } else {
          setError(errorMsg);
          setModuleState('ERROR');
        }
      }
    } catch (err: any) {
      const errMsg = err?.message || 'अज्ञात त्रुटि उत्पन्न हुई।';
      if (isRefresh) {
        toast.error(errMsg);
        setModuleState(data ? 'SUCCESS_WITH_DATA' : 'ERROR');
      } else {
        setError(errMsg);
        setModuleState('ERROR');
      }
    }
  };

  const handleCopyPath = async (path: string) => {
    try {
      await navigator.clipboard.writeText(path);
      toast.success(`स्टोरेज पाथ कॉपी किया गया: ${path}`);
    } catch {
      toast.error('पाथ कॉपी करने में विफल।');
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
    setPreviewingPath(null);
  };

  const handleToggleAudioPreview = (file: StorageFile) => {
    if (previewingPath === file.path && isPlaying) {
      stopAudio();
      return;
    }

    stopAudio();

    const bucketName = 'santmat-satsang-prachar.firebasestorage.app';
    const downloadUrl = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(
      file.path
    )}?alt=media`;

    const audio = new Audio(downloadUrl);
    audioRef.current = audio;
    setPreviewingPath(file.path);
    setIsPlaying(true);

    audio.onended = () => {
      setIsPlaying(false);
      setPreviewingPath(null);
    };

    audio.onerror = () => {
      toast.error('ऑडियो लोड करने में विफल। कृपया पाथ की जाँच करें।');
      stopAudio();
    };

    audio.play().catch((err) => {
      console.warn('Audio play failed:', err);
      toast.error('ऑडियो लोड करने में विफल। कृपया पाथ की जाँच करें।');
      stopAudio();
    });
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Folder Navigation Computations
  const folderTree = useMemo(() => {
    if (!data) return { folders: [], files: [] };

    const cleanCurrent = currentFolderPath.replace(/^\/+|\/+$/g, '');

    // Collect all subfolder names directly under cleanCurrent
    const subfolderSet = new Set<string>();
    const directFiles: StorageFile[] = [];

    // Also include canonical folders at root if at root
    if (!cleanCurrent) {
      for (const kf of KNOWN_STORAGE_FOLDERS) {
        subfolderSet.add(kf);
      }
    }

    for (const f of data.storageFiles) {
      const p = f.path;
      if (!cleanCurrent) {
        // At root level
        const slashIdx = p.indexOf('/');
        if (slashIdx === -1) {
          directFiles.push(f);
        } else {
          const topFolder = p.substring(0, slashIdx);
          subfolderSet.add(topFolder);
        }
      } else {
        // Inside a folder (e.g. "audio" or "audio/bhajans")
        if (p.startsWith(cleanCurrent + '/')) {
          const rest = p.substring(cleanCurrent.length + 1);
          const slashIdx = rest.indexOf('/');
          if (slashIdx === -1) {
            directFiles.push(f);
          } else {
            const nextSub = cleanCurrent + '/' + rest.substring(0, slashIdx);
            subfolderSet.add(nextSub);
          }
        }
      }
    }

    // Convert subfolderSet to array with file counts
    const folders = Array.from(subfolderSet).map((fullPath) => {
      const folderName = fullPath.split('/').pop() || fullPath;
      const count = data.storageFiles.filter(
        (f) => f.path === fullPath || f.path.startsWith(fullPath + '/')
      ).length;
      const totalSize = data.storageFiles
        .filter((f) => f.path === fullPath || f.path.startsWith(fullPath + '/'))
        .reduce((sum, f) => sum + (f.sizeBytes || 0), 0);
      return {
        name: folderName,
        fullPath,
        fileCount: count,
        totalBytes: totalSize,
      };
    });

    // Sort folders alphabetically
    folders.sort((a, b) => a.name.localeCompare(b.name));

    return { folders, files: directFiles };
  }, [data, currentFolderPath]);

  // Breadcrumb segments
  const breadcrumbSegments = useMemo(() => {
    if (!currentFolderPath) return [];
    const parts = currentFolderPath.split('/');
    let accum = '';
    return parts.map((part) => {
      accum = accum ? `${accum}/${part}` : part;
      return { name: part, path: accum };
    });
  }, [currentFolderPath]);

  // Filter storage files for flat table view
  const filteredFiles = useMemo((): StorageFile[] => {
    if (!data) return [];
    let files = data.storageFiles;

    // Search query filter
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      files = files.filter(
        (f) => f.path.toLowerCase().includes(q) || f.name.toLowerCase().includes(q)
      );
    }

    // Type filter
    if (filterType === 'audio') {
      files = files.filter(
        (f) => f.contentType.startsWith('audio/') || f.name.endsWith('.mp3')
      );
    } else if (filterType === 'images') {
      files = files.filter(
        (f) => f.contentType.startsWith('image/') && !f.path.startsWith('banners/')
      );
    } else if (filterType === 'banners') {
      files = files.filter(
        (f) => f.path.startsWith('banners/') || f.contentType.startsWith('image/')
      );
    } else if (filterType === 'books') {
      files = files.filter(
        (f) =>
          f.path.startsWith('books/') ||
          f.contentType === 'application/pdf' ||
          f.name.endsWith('.pdf')
      );
    } else if (filterType === 'unmapped') {
      files = files.filter((f) => {
        const refs = data.mediaPathReferences[f.path];
        return !refs || refs.length === 0;
      });
    } else if (filterType === 'mapped') {
      files = files.filter((f) => {
        const refs = data.mediaPathReferences[f.path];
        return refs && refs.length > 0;
      });
    }

    return files;
  }, [data, searchQuery, filterType]);

  // Load existing items for dropdown when linking
  useEffect(() => {
    if (linkingFile && linkMode === 'existing') {
      loadExistingItemsForLinking();
    }
  }, [linkingFile, linkTargetCollection, linkMode]);

  const loadExistingItemsForLinking = async () => {
    setSelectedItemId('');
    try {
      if (linkTargetCollection === 'audio') {
        const res = await bhajanService.getBhajans();
        if (res.success && res.data) setExistingItems(res.data);
      } else if (linkTargetCollection === 'books') {
        const booksList = await bookService.getBooks();
        setExistingItems(booksList);
      } else if (linkTargetCollection === 'stuti_vinati') {
        const res = await stutiService.getStutis();
        if (res.success && res.data) setExistingItems(res.data);
      } else if (linkTargetCollection === 'banners') {
        const res = await bannerService.getBanners();
        if (res.success && res.data) setExistingItems(res.data);
      }
    } catch {
      toast.error('मौजूदा दस्तावेज़ लोड करने में विफल।');
    }
  };

  const handleLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkingFile) return;

    setIsLinking(true);
    const bucketName = 'santmat-satsang-prachar.firebasestorage.app';
    const downloadUrl = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(
      linkingFile.path
    )}?alt=media`;

    try {
      if (linkMode === 'existing') {
        if (!selectedItemId) {
          toast.error('कृपया एक आइटम चुनें');
          setIsLinking(false);
          return;
        }

        // Check for duplicate linking
        const isAlreadyLinked = data?.storageFiles.some((f) => {
          const refs = data.mediaPathReferences[f.path];
          return (
            refs &&
            refs.some(
              (r) => r.col === linkTargetCollection && r.id === selectedItemId
            )
          );
        });

        if (isAlreadyLinked) {
          const confirmLink = window.confirm(
            'सावधानी: यह रिकॉर्ड पहले से ही किसी अन्य मीडिया फाइल से जुड़ा है। क्या आप इसे अपडेट करना चाहते हैं?'
          );
          if (!confirmLink) {
            setIsLinking(false);
            return;
          }
        }

        // Perform linking based on collection type
        if (linkTargetCollection === 'audio') {
          await bhajanService.updateBhajan(selectedItemId, {
            storagePath: linkingFile.path,
            audioUrl: downloadUrl,
          });
        } else if (linkTargetCollection === 'books') {
          await bookService.updateBook(selectedItemId, {
            storagePath: linkingFile.path,
            pdfUrl: downloadUrl,
          });
        } else if (linkTargetCollection === 'stuti_vinati') {
          await stutiService.updateStuti(selectedItemId, {
            storagePath: linkingFile.path,
            audioUrl: downloadUrl,
          });
        } else if (linkTargetCollection === 'banners') {
          await bannerService.addBanner({
            title:
              existingItems.find((i) => i.id === selectedItemId)?.title ||
              'अपडेटेड बैनर',
            imageUrl: downloadUrl,
            active: true,
            order: 0,
          });
        }

        toast.success('मीडिया सफलतापूर्वक लिंक किया गया!');
      } else {
        // Create new record
        if (!newTitle.trim()) {
          toast.error('कृपया शीर्षक दर्ज करें');
          setIsLinking(false);
          return;
        }

        if (linkTargetCollection === 'audio') {
          await bhajanService.addBhajan({
            title: newTitle.trim(),
            artist: newArtistOrAuthor.trim() || 'अज्ञात',
            category: newCategory || 'भजन',
            duration: '00:00',
            durationSeconds: 0,
            imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c',
            plays: 0,
            addedDate: new Date().toLocaleDateString('hi-IN'),
            status: 'ड्राफ्ट',
            storagePath: linkingFile.path,
            audioUrl: downloadUrl,
          });
        } else if (linkTargetCollection === 'books') {
          await bookService.addBook({
            title: newTitle.trim(),
            author: newArtistOrAuthor.trim() || 'अज्ञात',
            category: newCategory || 'सामान्य',
            storagePath: linkingFile.path,
            pdfUrl: downloadUrl,
            status: 'draft',
            coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c',
          });
        } else if (linkTargetCollection === 'banners') {
          await bannerService.addBanner({
            title: newTitle.trim(),
            imageUrl: downloadUrl,
            active: true,
            order: 0,
          });
        }

        toast.success('नया रिकॉर्ड बनाकर मीडिया लिंक कर दिया गया है!');
      }

      setLinkingFile(null);
      fetchReconciliationData(true);
    } catch (err: any) {
      toast.error(`त्रुटि: ${err.message || 'लिंकिंग विफल रहा'}`);
    } finally {
      setIsLinking(false);
    }
  };

  const getMissingMediaMismatches = () => {
    if (!data) return [];
    return data.content.filter((c) => c.type === 'MISSING_MEDIA');
  };

  const isInitialLoading = moduleState === 'LOADING' || moduleState === 'INITIAL';
  const isRefreshing = moduleState === 'REFRESHING';

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 font-['Mukta']">
      {/* Header Banner */}
      <div className="bg-white border border-stone-200 shadow-sm rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-amber-500 text-white rounded-xl shadow-xs shrink-0">
            <HardDrive className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-stone-900 leading-tight">
              स्टोरेज और मीडिया नियंत्रण केंद्र
            </h1>
            <p className="text-xs text-stone-500 font-semibold mt-0.5">
              रीयल-टाइम स्टोरेज खोज • फ़ोल्डर नेविगेशन • डोमेन रिकॉर्ड लिंकिंग • वैश्विक रीकॉन्सिलिएशन ऑडिट
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchReconciliationData(true)}
            disabled={isInitialLoading || isRefreshing}
            className="px-4 py-2 bg-stone-900 text-white hover:bg-stone-800 disabled:opacity-50 text-xs font-bold rounded-[0.625rem] transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            aria-label="ऑडिट रीफ़्रेश करें"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isRefreshing || isInitialLoading ? 'animate-spin' : ''}`}
            />
            <span>{isRefreshing ? 'रीफ़्रेश हो रहा है…' : 'ऑडिट रीफ़्रेश करें'}</span>
          </button>
        </div>
      </div>

      {/* Metrics Row (Skeletons when loading initially, Real data when loaded) */}
      {isInitialLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white border border-stone-200 p-4 rounded-xl shadow-xs flex items-center gap-3"
            >
              <div className="w-9 h-9 bg-stone-100 rounded-lg"></div>
              <div className="space-y-1.5 flex-1">
                <div className="h-3 bg-stone-100 rounded w-24"></div>
                <div className="h-5 bg-stone-200 rounded w-12"></div>
              </div>
            </div>
          ))}
        </div>
      ) : data ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-stone-200 p-4 rounded-xl shadow-xs flex items-center gap-3">
            <div className="p-2 bg-stone-100 text-stone-700 rounded-lg">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-stone-500 font-bold">कुल डोमेन रिकॉर्ड्स</div>
              <div className="text-lg font-extrabold text-stone-950">
                {data.metrics.totalContentRecordsScanned}
              </div>
            </div>
          </div>
          <div className="bg-white border border-stone-200 p-4 rounded-xl shadow-xs flex items-center gap-3">
            <div className="p-2 bg-amber-100 text-amber-700 rounded-lg">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-stone-500 font-bold">स्टोरेज फाइलें</div>
              <div className="text-lg font-extrabold text-stone-950">
                {data.metrics.totalStorageObjectsScanned}
              </div>
            </div>
          </div>
          <div className="bg-white border border-stone-200 p-4 rounded-xl shadow-xs flex items-center gap-3">
            <div className="p-2 bg-red-100 text-red-700 rounded-lg">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-stone-500 font-bold">त्रुटिपूर्ण लिंक्स (Broken)</div>
              <div className="text-lg font-extrabold text-stone-950">
                {data.content.filter((c) => c.type === 'MISSING_MEDIA').length}
              </div>
            </div>
          </div>
          <div className="bg-white border border-stone-200 p-4 rounded-xl shadow-xs flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-stone-500 font-bold">यूजर सुरक्षा विसंगतियां</div>
              <div className="text-lg font-extrabold text-stone-950">{data.users.length}</div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Main Tabs */}
      <div className="flex border-b border-stone-200 text-sm font-bold" role="tablist">
        <button
          role="tab"
          aria-selected={activeTab === 'media'}
          onClick={() => setActiveTab('media')}
          className={`px-5 py-3 border-b-2 transition-all cursor-pointer ${
            activeTab === 'media'
              ? 'border-[#EA580C] text-[#EA580C]'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          फ़ायरबेस स्टोरेज लाइब्रेरी ({data?.storageFiles.length || 0})
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'content'}
          onClick={() => setActiveTab('content')}
          className={`px-5 py-3 border-b-2 transition-all cursor-pointer ${
            activeTab === 'content'
              ? 'border-[#EA580C] text-[#EA580C]'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          कंटेंट विसंगतियाँ ({data?.content.length || 0})
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'users'}
          onClick={() => setActiveTab('users')}
          className={`px-5 py-3 border-b-2 transition-all cursor-pointer ${
            activeTab === 'users'
              ? 'border-[#EA580C] text-[#EA580C]'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          यूजर सुरक्षा ऑडिट ({data?.users.length || 0})
        </button>
      </div>

      {/* Error state */}
      {moduleState === 'ERROR' ? (
        <div className="p-8 text-center space-y-3 bg-red-50 border border-red-200 rounded-xl">
          <AlertTriangle className="w-8 h-8 text-red-600 mx-auto" />
          <h2 className="text-base font-extrabold text-red-900">ऑडिट लोड करने में विफलता</h2>
          <p className="text-sm font-semibold text-red-800">{error}</p>
          <button
            onClick={() => fetchReconciliationData(false)}
            className="px-5 py-2 bg-red-600 text-white rounded-[0.625rem] text-xs font-bold hover:bg-red-700 cursor-pointer shadow-xs transition-colors"
          >
            पुनः प्रयास करें
          </button>
        </div>
      ) : isInitialLoading ? (
        /* Loading skeleton */
        <div className="py-20 text-center space-y-3 bg-white border border-stone-200 rounded-xl shadow-xs">
          <RefreshCw className="w-8 h-8 text-amber-600 animate-spin mx-auto" />
          <p className="text-xs font-bold text-stone-600">
            संपूर्ण स्टोरेज एवं फायरबेस सिस्टम ऑडिट किया जा रहा है…
          </p>
        </div>
      ) : moduleState === 'SUCCESS_EMPTY' ? (
        /* Empty State */
        <div className="py-16 text-center space-y-3 bg-white border border-stone-200 rounded-xl shadow-xs">
          <HardDrive className="w-12 h-12 text-stone-400 mx-auto" />
          <h2 className="text-base font-extrabold text-stone-800">स्टोरेज संचिकाएं रिक्त हैं</h2>
          <p className="text-xs text-stone-500 font-semibold max-w-md mx-auto">
            फ़ायरबेस स्टोरेज या डोमेन डेटाबेस में कोई संचिका नहीं मिली। संचिकाएं अपलोड होने के उपरांत यह केंद्र स्वतः अद्यतित होगा।
          </p>
          <button
            onClick={() => fetchReconciliationData(true)}
            className="px-4 py-2 bg-stone-900 text-white rounded-[0.625rem] text-xs font-bold hover:bg-stone-800 cursor-pointer"
          >
            पुनः जाँच करें
          </button>
        </div>
      ) : (
        <>
          {/* TAB 1: MEDIA LIBRARY & BUCKET BROWSER */}
          {activeTab === 'media' && (
            <div className="space-y-4">
              {/* Controls bar: Search, View Mode Toggle, Type Filter */}
              <div className="bg-white border border-stone-200 p-4 rounded-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xs">
                {/* Search Box */}
                <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 px-3.5 py-2 rounded-[0.625rem] w-full lg:max-w-xs">
                  <Search className="w-4 h-4 text-stone-400 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="फ़ाइल या पाथ खोजें..."
                    className="w-full bg-transparent text-xs font-semibold text-stone-800 focus:outline-none"
                    aria-label="फ़ाइल नाम खोजें"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="text-stone-400 hover:text-stone-600 text-xs cursor-pointer"
                      title="खोज साफ़ करें"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* View Mode Toggle (Folder View vs Flat Files) */}
                <div className="flex items-center gap-2">
                  <div className="inline-flex bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs font-bold">
                    <button
                      onClick={() => setViewMode('folders')}
                      className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                        viewMode === 'folders'
                          ? 'bg-white text-stone-900 shadow-xs'
                          : 'text-stone-500 hover:text-stone-800'
                      }`}
                    >
                      <Folder className="w-3.5 h-3.5 text-amber-600" />
                      <span>फ़ोल्डर व्यू</span>
                    </button>
                    <button
                      onClick={() => setViewMode('files')}
                      className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                        viewMode === 'files'
                          ? 'bg-white text-stone-900 shadow-xs'
                          : 'text-stone-500 hover:text-stone-800'
                      }`}
                    >
                      <List className="w-3.5 h-3.5 text-stone-600" />
                      <span>समग्र सूची ({filteredFiles.length})</span>
                    </button>
                  </div>
                </div>

                {/* Filter categories (active in Flat Files mode or across bucket) */}
                {viewMode === 'files' && (
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { id: 'all', label: 'सभी' },
                      { id: 'audio', label: 'ऑडियो' },
                      { id: 'images', label: 'इमेज' },
                      { id: 'banners', label: 'बैनर' },
                      { id: 'books', label: 'पुस्तकें/PDF' },
                      { id: 'mapped', label: 'मैप्ड (Linked)' },
                      { id: 'unmapped', label: 'अनमैप्ड' },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setFilterType(tab.id as any)}
                        className={`px-2.5 py-1.5 rounded-[0.625rem] text-xs font-bold border transition-all cursor-pointer ${
                          filterType === tab.id
                            ? 'bg-amber-500 border-amber-500 text-white shadow-xs'
                            : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* VIEW 1: FOLDER-BY-FOLDER BUCKET EXPLORER */}
              {viewMode === 'folders' && (
                <div className="space-y-4">
                  {/* Breadcrumb Navigation Bar */}
                  <div className="bg-white border border-stone-200 px-4 py-3 rounded-xl flex items-center justify-between text-xs font-bold shadow-xs">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        onClick={() => setCurrentFolderPath('')}
                        className={`hover:text-amber-700 transition-colors flex items-center gap-1 cursor-pointer ${
                          !currentFolderPath ? 'text-amber-700 font-extrabold' : 'text-stone-600'
                        }`}
                      >
                        <HardDrive className="w-3.5 h-3.5" />
                        <span>रूट (Storage Root)</span>
                      </button>
                      {breadcrumbSegments.map((seg, idx) => (
                        <React.Fragment key={seg.path}>
                          <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
                          <button
                            onClick={() => setCurrentFolderPath(seg.path)}
                            className={`hover:text-amber-700 transition-colors cursor-pointer ${
                              idx === breadcrumbSegments.length - 1
                                ? 'text-amber-700 font-extrabold'
                                : 'text-stone-600'
                            }`}
                          >
                            {seg.name}
                          </button>
                        </React.Fragment>
                      ))}
                    </div>

                    {currentFolderPath && (
                      <button
                        onClick={() => {
                          const parts = currentFolderPath.split('/');
                          parts.pop();
                          setCurrentFolderPath(parts.join('/'));
                        }}
                        className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>ऊपर जाएँ</span>
                      </button>
                    )}
                  </div>

                  {/* Subfolders Grid */}
                  {folderTree.folders.length > 0 && (
                    <div className="bg-white border border-stone-200 p-5 rounded-xl shadow-xs space-y-3">
                      <h2 className="text-xs font-extrabold text-stone-500 uppercase tracking-wider">
                        फ़ोल्डर ({folderTree.folders.length})
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {folderTree.folders.map((fld) => (
                          <button
                            key={fld.fullPath}
                            onClick={() => setCurrentFolderPath(fld.fullPath)}
                            className="p-3.5 rounded-xl border border-stone-200 hover:border-amber-400 hover:bg-amber-50/40 text-left transition-all group flex items-start gap-3 cursor-pointer"
                          >
                            <div className="p-2 rounded-lg bg-amber-100 text-amber-700 group-hover:bg-amber-500 group-hover:text-white transition-colors shrink-0">
                              <Folder className="w-4 h-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-extrabold text-stone-900 group-hover:text-amber-900 truncate">
                                {fld.name}
                              </div>
                              <div className="text-[0.68rem] text-stone-400 font-semibold mt-0.5">
                                {fld.fileCount} फ़ाइलें • {formatBytes(fld.totalBytes)}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Files inside current folder */}
                  <div className="bg-white border border-stone-200 rounded-xl shadow-xs overflow-hidden">
                    <div className="px-5 py-3.5 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
                      <div className="text-xs font-extrabold text-stone-700 uppercase tracking-wider">
                        संचिकाएं ({folderTree.files.length})
                      </div>
                      <div className="text-[0.68rem] text-stone-400 font-semibold">
                        पाथ: {currentFolderPath || '/ (रूट)'}
                      </div>
                    </div>

                    {folderTree.files.length === 0 ? (
                      <div className="p-8 text-center text-stone-400 text-xs font-semibold">
                        इस स्तर पर कोई संचिका नहीं है।
                      </div>
                    ) : (
                      <div className="divide-y divide-stone-100">
                        {folderTree.files.map((file) => {
                          const refs = data?.mediaPathReferences[file.path] || [];
                          const isMapped = refs.length > 0;
                          const isAudio =
                            file.contentType.startsWith('audio/') || file.name.endsWith('.mp3');
                          const isPdf =
                            file.contentType === 'application/pdf' || file.name.endsWith('.pdf');
                          const isImage = file.contentType.startsWith('image/');
                          const isDuplicate = data?.media.some(
                            (m) => m.path === file.path && m.type === 'DUPLICATE_MEDIA'
                          );

                          return (
                            <div
                              key={file.path}
                              className="p-4 hover:bg-stone-50/60 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                            >
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                <div
                                  className={`p-2 rounded-xl shrink-0 ${
                                    isAudio
                                      ? 'bg-amber-100 text-amber-700'
                                      : isPdf
                                      ? 'bg-red-100 text-red-700'
                                      : isImage
                                      ? 'bg-blue-100 text-blue-700'
                                      : 'bg-stone-100 text-stone-700'
                                  }`}
                                >
                                  {isAudio ? (
                                    <Music className="w-4 h-4" />
                                  ) : isPdf ? (
                                    <FileText className="w-4 h-4" />
                                  ) : isImage ? (
                                    <ImageIcon className="w-4 h-4" />
                                  ) : (
                                    <HelpCircle className="w-4 h-4" />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <div className="font-extrabold text-stone-900 truncate" title={file.name}>
                                    {file.name}
                                  </div>
                                  <div className="flex items-center gap-2 mt-0.5 text-[0.68rem] text-stone-400 font-semibold">
                                    <span>{file.contentType}</span>
                                    <span>•</span>
                                    <span>{formatBytes(file.sizeBytes)}</span>
                                    <span>•</span>
                                    <span>{new Date(file.updatedAt).toLocaleDateString('hi-IN')}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Badges & Actions */}
                              <div className="flex items-center gap-2 flex-wrap justify-end">
                                {isMapped ? (
                                  refs.map((ref, idx) => (
                                    <span
                                      key={idx}
                                      className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[0.68rem] font-bold inline-flex items-center gap-1"
                                    >
                                      <FileCheck className="w-3 h-3" />
                                      <span>
                                        {ref.title} (
                                        {ref.col === 'stuti_vinati'
                                          ? 'स्तुति'
                                          : ref.col === 'audio'
                                          ? 'भजन'
                                          : ref.col}
                                        )
                                      </span>
                                    </span>
                                  ))
                                ) : (
                                  <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 text-[0.68rem] font-bold">
                                    UNMAPPED (अलिंक्ड)
                                  </span>
                                )}

                                {isDuplicate && (
                                  <span className="px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 text-[0.68rem] font-bold inline-flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3" />
                                    <span>डुप्लिकेट संचिका</span>
                                  </span>
                                )}

                                {isAudio && (
                                  <button
                                    onClick={() => handleToggleAudioPreview(file)}
                                    className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                      previewingPath === file.path
                                        ? 'bg-amber-600 text-white border-amber-600'
                                        : 'bg-white hover:bg-stone-100 text-stone-600 border-stone-200'
                                    }`}
                                    title="ऑडियो प्रीव्यू बजाएं/रोकें"
                                  >
                                    {previewingPath === file.path && isPlaying ? (
                                      <Pause className="w-3.5 h-3.5 fill-white stroke-none" />
                                    ) : (
                                      <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                                    )}
                                  </button>
                                )}

                                {isImage && (
                                  <a
                                    href={`https://firebasestorage.googleapis.com/v0/b/santmat-satsang-prachar.firebasestorage.app/o/${encodeURIComponent(
                                      file.path
                                    )}?alt=media`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-1.5 rounded-lg border bg-white hover:bg-stone-100 text-stone-600 border-stone-200 inline-block"
                                    title="चित्र देखें"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </a>
                                )}

                                <button
                                  onClick={() => handleCopyPath(file.path)}
                                  className="p-1.5 rounded-lg border bg-white hover:bg-stone-100 text-stone-600 border-stone-200 cursor-pointer"
                                  title="स्टोरेज पाथ कॉपी करें"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  onClick={() => {
                                    setLinkingFile(file);
                                    if (file.path.startsWith('audio/')) {
                                      setLinkTargetCollection('audio');
                                    } else if (file.path.startsWith('books/')) {
                                      setLinkTargetCollection('books');
                                    } else if (file.path.startsWith('banners/')) {
                                      setLinkTargetCollection('banners');
                                    }
                                    setNewTitle(
                                      file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' ')
                                    );
                                    setNewArtistOrAuthor('');
                                    setNewCategory('');
                                  }}
                                  className="px-2.5 py-1.5 rounded-lg text-[0.7rem] font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-xs flex items-center gap-1 cursor-pointer"
                                >
                                  <LinkIcon className="w-3 h-3" />
                                  <span>लिंक करें</span>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* VIEW 2: ALL FILES FLAT TABLE */}
              {viewMode === 'files' && (
                <div className="bg-white border border-stone-200 shadow-sm rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-stone-50 border-b border-stone-200 text-stone-700 text-xs font-bold">
                          <th className="px-6 py-4">फ़ाइल</th>
                          <th className="px-6 py-4">टाइप / आकार</th>
                          <th className="px-6 py-4">अंतिम अपडेट</th>
                          <th className="px-6 py-4">स्थिति (Status)</th>
                          <th className="px-6 py-4 text-right">क्रियाएं (Actions)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100 text-stone-800 text-xs font-semibold">
                        {filteredFiles.map((file) => {
                          const refs = data?.mediaPathReferences[file.path] || [];
                          const isMapped = refs.length > 0;
                          const isAudio =
                            file.contentType.startsWith('audio/') || file.name.endsWith('.mp3');
                          const isPdf =
                            file.contentType === 'application/pdf' || file.name.endsWith('.pdf');
                          const isImage = file.contentType.startsWith('image/');
                          const isDuplicate = data?.media.some(
                            (m) => m.path === file.path && m.type === 'DUPLICATE_MEDIA'
                          );

                          return (
                            <tr key={file.path} className="hover:bg-stone-50/50 transition-colors">
                              <td className="px-6 py-4 max-w-sm">
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`p-2 rounded-xl shrink-0 ${
                                      isAudio
                                        ? 'bg-amber-100 text-amber-700'
                                        : isPdf
                                        ? 'bg-red-100 text-red-700'
                                        : isImage
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'bg-stone-100 text-stone-700'
                                    }`}
                                  >
                                    {isAudio ? (
                                      <Music className="w-4 h-4" />
                                    ) : isPdf ? (
                                      <FileText className="w-4 h-4" />
                                    ) : isImage ? (
                                      <ImageIcon className="w-4 h-4" />
                                    ) : (
                                      <HelpCircle className="w-4 h-4" />
                                    )}
                                  </div>
                                  <div className="min-w-0">
                                    <div
                                      className="font-extrabold text-stone-900 truncate"
                                      title={file.name}
                                    >
                                      {file.name}
                                    </div>
                                    <div
                                      className="font-mono text-[0.68rem] text-stone-400 truncate mt-0.5"
                                      title={file.path}
                                    >
                                      {file.path}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div>{file.contentType}</div>
                                <div className="text-[0.7rem] text-stone-400 mt-0.5">
                                  {formatBytes(file.sizeBytes)}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-stone-500">
                                {new Date(file.updatedAt).toLocaleString('hi-IN')}
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex flex-col gap-1">
                                  {isMapped ? (
                                    refs.map((ref, idx) => (
                                      <span
                                        key={idx}
                                        className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[0.68rem] font-bold inline-flex items-center gap-1 w-fit"
                                      >
                                        <FileCheck className="w-3 h-3" />
                                        <span>
                                          {ref.title} (
                                          {ref.col === 'stuti_vinati'
                                            ? 'स्तुति'
                                            : ref.col === 'audio'
                                            ? 'भजन'
                                            : ref.col}
                                          )
                                        </span>
                                      </span>
                                    ))
                                  ) : (
                                    <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 text-[0.68rem] font-bold inline-block w-fit">
                                      UNMAPPED (अलिंक्ड)
                                    </span>
                                  )}
                                  {isDuplicate && (
                                    <span className="px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 text-[0.68rem] font-bold inline-flex items-center gap-1 w-fit mt-1 animate-pulse">
                                      <AlertTriangle className="w-3 h-3" />
                                      <span>डुप्लिकेट संचिका</span>
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  {isAudio && (
                                    <button
                                      onClick={() => handleToggleAudioPreview(file)}
                                      className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                        previewingPath === file.path
                                          ? 'bg-amber-600 text-white border-amber-600'
                                          : 'bg-white hover:bg-stone-100 text-stone-600 border-stone-200'
                                      }`}
                                      title="ऑडियो प्रीव्यू बजाएं/रोकें"
                                    >
                                      {previewingPath === file.path && isPlaying ? (
                                        <Pause className="w-3.5 h-3.5 fill-white stroke-none" />
                                      ) : (
                                        <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                                      )}
                                    </button>
                                  )}
                                  {isImage && (
                                    <a
                                      href={`https://firebasestorage.googleapis.com/v0/b/santmat-satsang-prachar.firebasestorage.app/o/${encodeURIComponent(
                                        file.path
                                      )}?alt=media`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="p-1.5 rounded-lg border bg-white hover:bg-stone-100 text-stone-600 border-stone-200 inline-block"
                                      title="चित्र देखें"
                                    >
                                      <ExternalLink className="w-3.5 h-3.5" />
                                    </a>
                                  )}
                                  <button
                                    onClick={() => handleCopyPath(file.path)}
                                    className="p-1.5 rounded-lg border bg-white hover:bg-stone-100 text-stone-600 border-stone-200 cursor-pointer"
                                    title="स्टोरेज पाथ कॉपी करें"
                                  >
                                    <Copy className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setLinkingFile(file);
                                      if (file.path.startsWith('audio/')) {
                                        setLinkTargetCollection('audio');
                                      } else if (file.path.startsWith('books/')) {
                                        setLinkTargetCollection('books');
                                      } else if (file.path.startsWith('banners/')) {
                                        setLinkTargetCollection('banners');
                                      }
                                      setNewTitle(
                                        file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' ')
                                      );
                                      setNewArtistOrAuthor('');
                                      setNewCategory('');
                                    }}
                                    className="px-2.5 py-1.5 rounded-lg text-[0.7rem] font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-xs flex items-center gap-1 cursor-pointer"
                                  >
                                    <LinkIcon className="w-3 h-3" />
                                    <span>लिंक करें</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                        {filteredFiles.length === 0 && (
                          <tr>
                            <td colSpan={5} className="px-6 py-12 text-center text-stone-400">
                              कोई संचिका नहीं मिली
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CONTENT INTEGRITY */}
          {activeTab === 'content' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Broken references - Missing Media */}
              <div className="bg-white border border-stone-200 shadow-sm rounded-xl p-5 space-y-4">
                <div>
                  <h2 className="text-base font-extrabold text-red-700 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    <span>त्रुटिपूर्ण मीडिया संदर्भ (Missing Storage Objects)</span>
                  </h2>
                  <p className="text-[0.68rem] text-stone-500 mt-0.5">
                    फायरस्टोर दस्तावेज़ों में मौजूद संचिकाएं जो स्टोरेज से मिट चुकी हैं। मोबाइल पर प्रदर्शित नहीं होंगी।
                  </p>
                </div>

                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                  {getMissingMediaMismatches().map((m, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-red-50/50 hover:bg-red-50 border border-red-200/60 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="font-extrabold text-stone-900">{m.title}</div>
                        <div className="font-semibold text-stone-500 text-[0.68rem] mt-0.5">
                          संग्रह: <span className="uppercase text-stone-700 font-bold">{m.collection}</span> • ID: {m.id}
                        </div>
                        <div className="font-mono text-[0.68rem] text-red-600 bg-white border border-red-200 rounded px-1.5 py-0.5 mt-1 w-fit truncate max-w-md">
                          {m.details.brokenPath}
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 border border-red-200 text-[0.65rem] font-bold h-fit shrink-0 self-start sm:self-center">
                        BROKEN REFERENCE
                      </span>
                    </div>
                  ))}
                  {getMissingMediaMismatches().length === 0 && (
                    <div className="text-center py-12 text-stone-400 font-semibold space-y-1">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                      <p>🎉 कोई भी मीडिया संदर्भ टूटा हुआ नहीं है! पूर्ण सत्यता।</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Broken Content - Metadata issues & Duplicate content linking */}
              <div className="bg-white border border-stone-200 shadow-sm rounded-xl p-5 space-y-4">
                <div>
                  <h2 className="text-base font-extrabold text-amber-700 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 animate-pulse" />
                    <span>अधूरे डोमेन रिकॉर्ड (Broken Content Metadata)</span>
                  </h2>
                  <p className="text-[0.68rem] text-stone-500 mt-0.5">
                    आवश्यक मेटाडेटा (जैसे शीर्षक, श्रेणी, या पाथ) के बिना बने दस्तावेज़।
                  </p>
                </div>

                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                  {data?.content
                    .filter(
                      (c) => c.type === 'BROKEN_CONTENT' || c.type === 'DUPLICATE_CONTENT'
                    )
                    .map((m, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-amber-50/50 hover:bg-amber-50 border border-amber-200/60 rounded-lg text-xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="font-extrabold text-stone-900">{m.title}</div>
                          <span
                            className={`px-2 py-0.5 rounded text-[0.65rem] font-bold border h-fit shrink-0 ${
                              m.type === 'BROKEN_CONTENT'
                                ? 'bg-amber-100 text-amber-800 border-amber-200'
                                : 'bg-blue-100 text-blue-800 border-blue-200'
                            }`}
                          >
                            {m.type === 'BROKEN_CONTENT' ? 'मेटाडेटा अपूर्ण' : 'डुप्लिकेट लिंकिंग'}
                          </span>
                        </div>
                        <div className="font-semibold text-stone-500 text-[0.68rem]">
                          संग्रह: <span className="uppercase text-stone-700 font-bold">{m.collection}</span> • ID: {m.id}
                        </div>
                        {m.details.reasons && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {m.details.reasons.map((r: string, rIdx: number) => (
                              <span
                                key={rIdx}
                                className="px-1.5 py-0.5 bg-white border border-amber-200 rounded text-[0.65rem] text-amber-700 font-semibold"
                              >
                                {r}
                              </span>
                            ))}
                          </div>
                        )}
                        {m.details.sharedPath && (
                          <div className="text-[0.68rem] text-stone-600 bg-white border border-blue-100 rounded p-1 font-mono mt-1">
                            साझा संचिका: {m.details.sharedPath}
                          </div>
                        )}
                      </div>
                    ))}
                  {data?.content.filter(
                    (c) => c.type === 'BROKEN_CONTENT' || c.type === 'DUPLICATE_CONTENT'
                  ).length === 0 && (
                    <div className="text-center py-12 text-stone-400 font-semibold space-y-1">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                      <p>🎉 सभी दस्तावेज़ों का मेटाडेटा पूर्ण और सही है!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: IDENTITY MANAGEMENT */}
          {activeTab === 'users' && (
            <div className="bg-white border border-stone-200 shadow-sm rounded-xl p-5 space-y-4">
              <div>
                <h2 className="text-base font-extrabold text-blue-800 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5" />
                  <span>यूजर ऑथेंटिकेशन और प्रोफाइल मिलान (RBAC Consistency Audit)</span>
                </h2>
                <p className="text-[0.68rem] text-stone-500 mt-0.5">
                  फायरबेस ऑथेंटिकेशन टोकन क्लेम्स (Custom Claims) तथा फायरस्टोर यूजर दस्तावेज़ों के मध्य भूमिकाओं (Roles) का सत्यापन।
                </p>
              </div>

              <div className="space-y-2">
                {data?.users.map((user, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs font-semibold"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-stone-900 text-sm">
                          {user.displayName}
                        </span>
                        <span className="text-stone-400">({user.email})</span>
                      </div>
                      <div className="font-mono text-[0.65rem] text-stone-400">UID: {user.uid}</div>
                      <div className="text-[0.68rem] text-stone-600 bg-white border border-stone-200 rounded p-2 mt-2 w-fit">
                        {user.type === 'ROLE_DRIFT' && (
                          <span>
                            भूमिका विसंगति: Auth Custom Claims में{' '}
                            <strong className="text-red-700 uppercase">
                              {(user.details as any).authRole}
                            </strong>{' '}
                            है, परंतु प्रोफाइल दस्तावेज़ में{' '}
                            <strong className="text-blue-700 uppercase">
                              {(user.details as any).firestoreRole}
                            </strong>{' '}
                            है।
                          </span>
                        )}
                        {user.type === 'MISSING_PROFILE' && (
                          <span>ऑथेंटिकेशन मौजूद है, परंतु फायरस्टोर प्रोफाइल गायब है।</span>
                        )}
                        {user.type === 'ORPHAN_PROFILE' && (
                          <span>
                            फायरस्टोर प्रोफाइल दस्तावेज़ मौजूद है, परंतु ऑथेंटिकेशन डेटाबेस में यह यूजर नहीं है।
                          </span>
                        )}
                      </div>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-[0.625rem] text-[0.7rem] font-bold border h-fit shrink-0 self-start md:self-center uppercase ${
                        user.type === 'ROLE_DRIFT'
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {user.type.replace('_', ' ')}
                    </span>
                  </div>
                ))}
                {data?.users.length === 0 && (
                  <div className="text-center py-16 text-stone-400 font-semibold space-y-2">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                    <p>सभी उपयोगकर्ताओं का ऑथेंटिकेशन और प्रोफाइल क्लेम्स सुसंगत हैं। शून्य सुरक्षा जोखिम।</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* LINKING MODAL */}
      {linkingFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-xl rounded-xl shadow-2xl border border-stone-200 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-amber-100 text-amber-700">
                  <LinkIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-stone-900 leading-tight">
                    मीडिया फ़ाइल लिंक करें
                  </h3>
                  <p className="text-xs text-stone-500 font-semibold">
                    चयनित संचिका को डोमेन सामग्री से जोड़ें
                  </p>
                </div>
              </div>
              <button
                onClick={() => setLinkingFile(null)}
                className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
                aria-label="बंद करें"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleLinkSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[75vh]">
              {/* File Info Summary */}
              <div className="p-3 bg-stone-50 border border-stone-200 rounded-lg space-y-1 text-xs">
                <div className="text-stone-500 font-bold">चयनित फ़ाइल:</div>
                <div className="font-extrabold text-stone-900 truncate">{linkingFile.name}</div>
                <div className="font-mono text-[0.68rem] text-stone-400 truncate">
                  {linkingFile.path}
                </div>
              </div>

              {/* Target Collection */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-700">
                  लक्ष्य सामग्री संग्रह (Collection)
                </label>
                <select
                  value={linkTargetCollection}
                  onChange={(e) => {
                    const next = e.target.value as any;
                    setLinkTargetCollection(next);
                    if (next === 'stuti_vinati') {
                      setLinkMode('existing');
                    }
                  }}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs font-bold focus:outline-none"
                >
                  <option value="audio">भजन / सत्संग संग्रह (audio)</option>
                  <option value="books">धार्मिक पुस्तकें (books)</option>
                  <option value="stuti_vinati">दैनिक स्तुति-विनती (stuti_vinati)</option>
                  <option value="banners">होम स्क्रीन बैनर (banners)</option>
                </select>
              </div>

              {linkTargetCollection === 'stuti_vinati' ? (
                /* Stuti-Vinati is a fixed two-slot product: only existing-slot linking is allowed. */
                <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 text-[0.7rem] font-bold text-amber-900">
                  स्तुति-विनती केवल दो निर्धारित स्लॉट (प्रातःकालीन स्तुति / संध्याकालीन स्तुति) से जोड़ी जा सकती है।
                  नए स्तुति रिकॉर्ड नहीं बनाए जा सकते।
                </div>
              ) : (
                /* Mode: Existing or New (for non-stuti target collections) */
                <div className="grid grid-cols-2 gap-2 bg-stone-100 p-1 rounded-xl text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setLinkMode('existing')}
                    className={`py-2 rounded-lg transition-all cursor-pointer ${
                      linkMode === 'existing'
                        ? 'bg-white text-stone-900 shadow-xs'
                        : 'text-stone-500 hover:text-stone-700'
                    }`}
                  >
                    मौजूदा दस्तावेज़ से जोड़ें
                  </button>
                  <button
                    type="button"
                    onClick={() => setLinkMode('new')}
                    className={`py-2 rounded-lg transition-all cursor-pointer ${
                      linkMode === 'new'
                        ? 'bg-white text-stone-900 shadow-xs'
                        : 'text-stone-500 hover:text-stone-700'
                    }`}
                  >
                    नया रिकॉर्ड बनाएँ
                  </button>
                </div>
              )}

              {linkMode === 'existing' ? (
                /* Mode A: Link to Existing */
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-stone-700">
                    दस्तावेज़ का चयन करें
                  </label>
                  {existingItems.length === 0 ? (
                    <div className="p-3 text-center border border-dashed border-stone-200 rounded-xl text-stone-400 text-xs font-semibold">
                      इस संग्रह में कोई मौजूदा दस्तावेज़ नहीं मिला।
                    </div>
                  ) : (
                    <select
                      value={selectedItemId}
                      onChange={(e) => setSelectedItemId(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs font-bold focus:outline-none"
                    >
                      <option value="">-- चुनें --</option>
                      {existingItems.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.title || item.quote || item.name || item.id}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              ) : (
                /* Mode B: Link to New */
                <div className="space-y-3 pt-2">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-stone-700">
                      शीर्षक (Title)
                    </label>
                    <input
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="शीर्षक प्रविष्ट करें…"
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none"
                    />
                  </div>

                  {(linkTargetCollection === 'audio' ||
                    linkTargetCollection === 'books') && (
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-stone-700">
                        {linkTargetCollection === 'audio'
                          ? 'गायक (Artist)'
                          : 'लेखक (Author)'}
                      </label>
                      <input
                        type="text"
                        value={newArtistOrAuthor}
                        onChange={(e) => setNewArtistOrAuthor(e.target.value)}
                        placeholder={
                          linkTargetCollection === 'audio'
                            ? 'गायक का नाम…'
                            : 'लेखक का नाम…'
                        }
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none"
                      />
                    </div>
                  )}

                  {(linkTargetCollection === 'audio' ||
                    linkTargetCollection === 'books') && (
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-stone-700">
                        श्रेणी (Category)
                      </label>
                      <select
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs font-bold focus:outline-none"
                      >
                        <option value="">-- श्रेणी चुनें --</option>
                        {getCreatableCategories(
                          sortCategoriesWithSystemFirst(categories)
                        ).map((cat) => (
                          <option key={cat.id} value={cat.name}>
                            {cat.name}
                          </option>
                        ))}
                        {categories.length === 0 && (
                          <>
                            <option value="भजन">भजन</option>
                            <option value="सत्संग">सत्संग</option>
                            <option value="प्रार्थना">प्रार्थना</option>
                            <option value="सामान्य">सामान्य</option>
                          </>
                        )}
                      </select>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-4 border-t border-stone-150 flex items-center justify-end gap-2 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setLinkingFile(null)}
                  className="px-4 py-2 bg-white text-stone-700 border border-stone-200 rounded-xl hover:bg-stone-50 cursor-pointer"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  disabled={isLinking}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-xs transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  {isLinking ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <FileCheck className="w-3.5 h-3.5" />
                  )}
                  <span>लिंक सुनिश्चित करें</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
