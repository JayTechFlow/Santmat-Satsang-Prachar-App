/**
 * ============================================================================
 * Santmat Satsang Prachar - Devotional Bhajan Management Table (Admin)
 * ============================================================================
 * Enables the administrator to browse, search, filter, paginate, and preview
 * devotional audio tracks. Integrates shared enterprise primitives.
 */
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Trash2,
  Edit2,
  Play,
  Pause,
  Music,
  Image as ImageIcon,
  Upload,
  Link as LinkIcon,
  X,
  Check,
  Volume2,
  FileText,
  Clock,
  HardDrive,
  Globe,
  Lock,
} from 'lucide-react';
import { useApp } from '../../../app/providers/AppContext';
import { storageService, StorageAudioItem } from '../../../services/storage/storageService';
import { StorageAudioPickerModal } from '../components/StorageAudioPickerModal';
import { Bhajan } from '../../../types/common/index';

import { AdminPageHeader, AdminButton } from '../../../components/admin';
import { DataTable, Column } from '../../../components/ui/DataTable';
import { SearchBar } from '../../../components/ui/SearchBar';
import { FilterBar, FilterOption } from '../../../components/ui/FilterBar';
import { Pagination } from '../../../components/ui/Pagination';
import { StatusBadge, getBhajanStatusConfig } from '../../../components/ui/StatusBadge';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { LoadingOverlay } from '../../../components/ui/LoadingOverlay';
import { EmptyState } from '../../../components/ui/EmptyState';
import { ErrorState } from '../../../components/ui/ErrorState';
import {
  matchesBhajanCategory,
  sortCategoriesWithSystemFirst,
  getCreatableCategories,
} from '../../categories/config/systemCategories';

export const AdminBhajanList: React.FC = () => {
  const navigate = useNavigate();
  const {
    bhajans,
    updateBhajan,
    deleteBhajan,
    categories,
    playTrack,
    currentTrack,
    isPlaying,
    togglePlay,
    dataLoading,
    dataError
  } = useApp();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | number>('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Responsive Hook / State
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 640;
  const isTablet = windowWidth >= 640 && windowWidth < 1024;

  // Modals & Drawer State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedBhajanForDrawer, setSelectedBhajanForDrawer] = useState<Bhajan | null>(null);
  
  // Deletion Confirmation
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [bhajanToDelete, setBhajanToDelete] = useState<Bhajan | null>(null);

  // Quick Thumbnail Modal State
  const [thumbnailModalBhajan, setThumbnailModalBhajan] = useState<Bhajan | null>(null);
  const [newThumbnailUrl, setNewThumbnailUrl] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [showUrlField, setShowUrlField] = useState(false);
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  const thumbnailFileInputRef = useRef<HTMLInputElement>(null);

  // Full Edit Modal State
  const [editingBhajan, setEditingBhajan] = useState<Bhajan | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editArtist, setEditArtist] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editSubCategory, setEditSubCategory] = useState('');
  const [editDuration, setEditDuration] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editAudioUrl, setEditAudioUrl] = useState('');
  const [editLyrics, setEditLyrics] = useState('');
  const [editStatus, setEditStatus] = useState<'प्रकाशित' | 'ड्राफ्ट' | 'शेड्यूल किया गया'>('प्रकाशित');
  const [editScheduledDate, setEditScheduledDate] = useState<string>('');
  const [editScheduledTime, setEditScheduledTime] = useState<string>('06:00');
  const [showEditStoragePickerModal, setShowEditStoragePickerModal] = useState(false);
  const editModalFileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Reset page when search or category filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, pageSize]);

  // Clean payload helper
  const extractStoragePath = (url: string): string => {
    if (!url || !url.includes('/o/')) return url;
    try {
      return decodeURIComponent(url.split('/o/')[1].split('?')[0]);
    } catch (_) {
      return url;
    }
  };

  // Filter Categories dropdown options
  const categoryFilterOptions = useMemo<FilterOption[]>(() => {
    const sorted = sortCategoriesWithSystemFirst(categories);
    return sorted.map((cat) => ({
      label: cat.name,
      value: cat.name,
    }));
  }, [categories]);

  // Categories valid for assignment to a track (excludes the "सभी भजन" sentinel)
  const creatableCategoryOptions = useMemo(() => {
    const list = getCreatableCategories(sortCategoriesWithSystemFirst(categories));
    if (editCategory && !list.some((c) => c.name === editCategory)) {
      return [...list, { id: editCategory, name: editCategory, subCategories: [] }];
    }
    return list;
  }, [categories, editCategory]);

  // Filter Bhajans based on Search Query and Category select
  const filteredBhajans = useMemo(() => {
    return bhajans.filter((b) => {
      const matchesSearch =
        (b.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.artist || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.category || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.subCategory && (b.subCategory || '').toLowerCase().includes(searchQuery.toLowerCase())) ||
        (b.storagePath && (b.storagePath || '').toLowerCase().includes(searchQuery.toLowerCase())) ||
        (b.audioUrl && (b.audioUrl || '').toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = matchesBhajanCategory(b.category, selectedCategory);

      return matchesSearch && matchesCategory;
    });
  }, [bhajans, searchQuery, selectedCategory]);

  // Client side sorting state mapping for DataTable
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const sortedBhajans = useMemo(() => {
    if (!sortKey) return filteredBhajans;
    return [...filteredBhajans].sort((a: any, b: any) => {
      const aVal = a[sortKey] || '';
      const bVal = b[sortKey] || '';
      const comparison = String(aVal).localeCompare(String(bVal), 'hi');
      return sortDir === 'asc' ? comparison : -comparison;
    });
  }, [filteredBhajans, sortKey, sortDir]);

  // Paginated Data
  const paginatedBhajans = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedBhajans.slice(start, start + pageSize);
  }, [sortedBhajans, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedBhajans.length / pageSize);

  // Sync drawer selection after updates
  useEffect(() => {
    if (selectedBhajanForDrawer) {
      const updated = bhajans.find((b) => b.id === selectedBhajanForDrawer.id);
      if (updated) {
        setSelectedBhajanForDrawer(updated);
      } else {
        setSelectedBhajanForDrawer(null);
      }
    }
  }, [bhajans, selectedBhajanForDrawer]);

  // Handle delete execution
  const handleDeleteConfirm = () => {
    if (bhajanToDelete) {
      deleteBhajan(bhajanToDelete.id);
      showToast(`"${bhajanToDelete.title}" सफलतापूर्वक हटा दिया गया!`);
      if (selectedBhajanForDrawer?.id === bhajanToDelete.id) {
        setSelectedBhajanForDrawer(null);
      }
      setBhajanToDelete(null);
    }
  };

  // Handle category / status / metadata quick actions from Drawer
  const handleTogglePublishStatus = (bhajan: Bhajan) => {
    const newStatus = bhajan.status === 'प्रकाशित' ? 'ड्राफ्ट' : 'प्रकाशित';
    updateBhajan(bhajan.id, { status: newStatus });
    showToast(`स्थिति बदलकर "${newStatus}" कर दी गई!`);
  };

  // Open Quick Thumbnail Editor
  const openThumbnailModal = (bhajan: Bhajan) => {
    setThumbnailModalBhajan(bhajan);
    setNewThumbnailUrl(bhajan.imageUrl);
    setUrlInput('');
    setShowUrlField(false);
  };

  // Open Full Detail Edit Modal
  const openEditModal = (bhajan: Bhajan) => {
    setEditingBhajan(bhajan);
    setEditTitle(bhajan.title);
    setEditArtist(bhajan.artist);
    const normalizedCategory =
      bhajan.category === 'शाही भजनावली' ? 'शाही भजनवाली' : bhajan.category;
    setEditCategory(normalizedCategory);
    setEditSubCategory(bhajan.subCategory || '');
    setEditDuration(bhajan.duration);
    setEditImageUrl(bhajan.imageUrl);
    setEditAudioUrl(bhajan.audioUrl || '');
    setEditLyrics(bhajan.lyrics || '');
    setEditStatus(bhajan.status || 'प्रकाशित');
    setEditScheduledDate(bhajan.scheduledDate || '');
    setEditScheduledTime(bhajan.scheduledTime || '06:00');
  };

  // Quick Thumbnail File Upload to Storage
  const handleQuickThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('कृपया केवल इमेज (JPG, PNG, WebP) फ़ाइल चुनें।');
        return;
      }
      setIsUploadingThumbnail(true);
      const res = await storageService.uploadFile(file, 'thumbnails');
      setIsUploadingThumbnail(false);
      if (res.success && res.data) {
        setNewThumbnailUrl(res.data.downloadUrl);
        showToast('इमेज फ़ायरबेस स्टोरेज में अपलोड हो गई!');
      } else {
        alert(res.error || 'इमेज अपलोड विफल रहा।');
      }
    }
  };

  // Save Quick Thumbnail
  const handleSaveThumbnail = () => {
    if (!thumbnailModalBhajan || !newThumbnailUrl) return;
    updateBhajan(thumbnailModalBhajan.id, { imageUrl: newThumbnailUrl });
    showToast(`"${thumbnailModalBhajan.title}" का थंबनेल बदला गया!`);
    setThumbnailModalBhajan(null);
  };

  // Handle Edit Modal Image Upload to Storage
  const handleEditModalImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('कृपया केवल इमेज (JPG, PNG, WebP) फ़ाइल चुनें।');
        return;
      }
      setIsUploadingThumbnail(true);
      const res = await storageService.uploadFile(file, 'thumbnails');
      setIsUploadingThumbnail(false);
      if (res.success && res.data) {
        setEditImageUrl(res.data.downloadUrl);
        showToast('इमेज फ़ायरबेस स्टोरेज में अपलोड हो गई!');
      } else {
        alert(res.error || 'इमेज अपलोड विफल रहा।');
      }
    }
  };

  // Save Full Edit Modal Changes
  const handleSaveFullEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBhajan || !editTitle.trim() || !editArtist.trim()) {
      alert('कृपया शीर्षक एवं गायक का नाम भरें।');
      return;
    }
    const finalAudioUrl = editAudioUrl.trim();
    const finalStoragePath = extractStoragePath(finalAudioUrl);

    updateBhajan(editingBhajan.id, {
      title: editTitle.trim(),
      artist: editArtist.trim(),
      category: editCategory,
      subCategory: editSubCategory,
      duration: editDuration,
      imageUrl: editImageUrl,
      audioUrl: finalAudioUrl || undefined,
      storagePath: finalStoragePath || undefined,
      lyrics: editLyrics,
      status: editStatus,
      scheduledDate: editStatus === 'शेड्यूल किया गया' ? editScheduledDate : undefined,
      scheduledTime: editStatus === 'शेड्यूल किया गया' ? editScheduledTime : undefined,
    });
    showToast('भजन की जानकारी सफलतापूर्वक अपडेट की गई!');
    setEditingBhajan(null);
  };

  // DataTable Column Definitions
  const columns = useMemo<Column<Bhajan>[]>(() => {
    const cols: Column<Bhajan>[] = [
      {
        key: 'title',
        header: 'थंबनेल एवं शीर्षक',
        sortable: true,
        render: (item) => (
          <div className="flex items-center gap-3 pr-2">
            {/* Large clickable thumbnail with canonical play overlay */}
            <div className="relative w-11 h-11 rounded-xl overflow-hidden border border-stone-200 shadow-2xs shrink-0 group/thumb">
              <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (currentTrack?.id === item.id) {
                    togglePlay();
                  } else {
                    playTrack(item);
                  }
                }}
                className="absolute inset-0 bg-black/40 hover:bg-black/60 transition-opacity flex items-center justify-center text-white"
              >
                {currentTrack?.id === item.id && isPlaying ? (
                  <Pause className="w-3.5 h-3.5 fill-white stroke-none" />
                ) : (
                  <Play className="w-3.5 h-3.5 fill-white stroke-none ml-0.5" />
                )}
              </button>
            </div>
            <div className="min-w-0">
              <h4 
                onClick={() => setSelectedBhajanForDrawer(item)}
                className="font-bold text-stone-900 text-xs truncate leading-tight hover:underline cursor-pointer"
              >
                {item.title}
              </h4>
              <p className="text-[0.68rem] text-stone-500 truncate mt-0.5 font-semibold">
                {item.artist}
              </p>
            </div>
          </div>
        )
      },
      {
        key: 'category',
        header: 'श्रेणी / उप-श्रेणी',
        sortable: true,
        render: (item) => (
          <div className="whitespace-nowrap">
            <span className="font-bold text-stone-800">{item.category}</span>
            {item.subCategory && (
              <span className="block text-[0.68rem] text-stone-500 font-semibold mt-0.5">
                {item.subCategory}
              </span>
            )}
          </div>
        )
      }
    ];

    if (!isTablet) {
      cols.push(
        {
          key: 'duration',
          header: 'अवधि',
          sortable: true,
          render: (item) => <span className="font-bold text-stone-600">{item.duration}</span>
        },
        {
          key: 'plays',
          header: 'प्ले संख्या',
          sortable: true,
          render: (item) => <span className="font-mono font-bold text-stone-800">{(item.plays ?? 0).toLocaleString('hi-IN')}</span>
        }
      );
    }

    cols.push(
      {
        key: 'status',
        header: 'स्थिति',
        sortable: true,
        render: (item) => {
          const config = getBhajanStatusConfig(item.status || 'प्रकाशित');
          return (
            <div className="space-y-0.5">
              <StatusBadge {...config} />
              {item.status === 'शेड्यूल किया गया' && item.scheduledDate && (
                <span className="block text-[0.65rem] text-stone-500 font-semibold font-mono">
                  {item.scheduledDate} {item.scheduledTime || ''}
                </span>
              )}
            </div>
          );
        }
      },
      {
        key: 'actions',
        header: 'क्रियाएँ',
        render: (item) => (
          <div className="flex items-center gap-1 text-right justify-end whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
            {/* View Details Drawer */}
            <button
              onClick={() => setSelectedBhajanForDrawer(item)}
              className="p-1.5 rounded-lg text-stone-500 hover:text-stone-850 hover:bg-stone-100 transition-colors"
              title="विवरण देखें"
            >
              <FileText className="w-4 h-4" />
            </button>
            {/* Quick Upload Thumbnail */}
            <button
              onClick={() => openThumbnailModal(item)}
              className="px-2 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-[0.7rem] border border-amber-200 inline-flex items-center gap-1 transition-colors"
              title="थंबनेल बदलें"
            >
              <ImageIcon className="w-3 h-3" />
              <span className="hidden md:inline">थंबनेल</span>
            </button>
            {/* Edit Details */}
            <button
              onClick={() => openEditModal(item)}
              className="p-1.5 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
              title="संपादित करें"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            {/* Delete Details */}
            <button
              onClick={() => {
                setBhajanToDelete(item);
                setIsDeleteDialogOpen(true);
              }}
              className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
              title="हटाएं"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )
      }
    );

    return cols;
  }, [isTablet, currentTrack, isPlaying, playTrack, togglePlay]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5 select-none relative font-['Mukta']">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-8 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl z-50 flex items-center gap-2 font-bold text-sm animate-in slide-in-from-top duration-200">
          <Check className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <AdminPageHeader
        title="भजन प्रबंधन एवं संगीत संग्रह (Devotional Audio)"
        subtitle={`कुल ${bhajans.length} भजन सक्रिय हैं • विस्तृत विवरण देखने के लिए शीर्षक पर क्लिक करें`}
        badgeText="AUDIO PIPELINE"
        badgeVariant="primary"
        breadcrumbs={[
          { label: 'डैशबोर्ड', href: '/admin' },
          { label: 'भजन प्रबंधन' },
        ]}
        actions={
          <AdminButton
            variant="primary"
            size="md"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => navigate('/admin/add-bhajan')}
          >
            नया भजन जोड़ें
          </AdminButton>
        }
      />

      {/* Search & Category Filter */}
      <div className="bg-white rounded-xl p-4 border border-stone-200 shadow-2xs flex flex-col md:flex-row items-center gap-3">
        <div className="w-full md:flex-1">
          <SearchBar
            value={searchQuery}
            onSearch={setSearchQuery}
            placeholder="भजन शीर्षक, गायक, पद, ऑडियो फाइल या पाथ खोजें..."
          />
        </div>
        <div className="w-full md:w-auto self-stretch md:self-auto flex items-center gap-2 shrink-0">
          <FilterBar
            options={categoryFilterOptions}
            value={selectedCategory}
            onChange={setSelectedCategory}
            placeholder="सभी श्रेणियाँ (All Categories)"
          />
        </div>
      </div>

      {/* Main Display Body */}
      {dataLoading ? (
        <div className="relative h-64 bg-white rounded-xl border border-stone-200">
          <LoadingOverlay message="भजन सूची लोड की जा रही है..." />
        </div>
      ) : dataError ? (
        <ErrorState
          title="डेटा लोड करने में असमर्थ"
          message={dataError}
          onRetry={() => window.location.reload()}
        />
      ) : filteredBhajans.length === 0 ? (
        <EmptyState
          title="कोई भजन नहीं मिला"
          message="खोजे गए मापदंडों के अनुसार कोई भजन उपलब्ध नहीं है। कृपया फ़िल्टर बदलें।"
          action={
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('');
              }}
              className="px-4 py-2 bg-stone-800 text-white rounded-[0.625rem] text-xs font-bold cursor-pointer"
            >
              फ़िल्टर साफ़ करें
            </button>
          }
        />
      ) : (
        <div className="space-y-4">
          {/* Card list view for Mobile screen size */}
          {isMobile ? (
            <div className="space-y-3">
              {paginatedBhajans.map((item) => {
                const isPlayingThis = currentTrack?.id === item.id && isPlaying;
                const statusConfig = getBhajanStatusConfig(item.status || 'प्रकाशित');
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedBhajanForDrawer(item)}
                    className="p-4 bg-white rounded-xl border border-stone-200 shadow-2xs hover:shadow-xs transition-shadow flex flex-col gap-3.5 cursor-pointer active:bg-stone-55"
                  >
                    <div className="flex items-center gap-3">
                      {/* Thumbnail with quick play control */}
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-stone-250 shrink-0">
                        <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (currentTrack?.id === item.id) {
                              togglePlay();
                            } else {
                              playTrack(item);
                            }
                          }}
                          className="absolute inset-0 bg-black/40 flex items-center justify-center text-white"
                        >
                          {isPlayingThis ? (
                            <Pause className="w-4 h-4 fill-white stroke-none" />
                          ) : (
                            <Play className="w-4 h-4 fill-white stroke-none ml-0.5" />
                          )}
                        </button>
                      </div>

                      <div className="min-w-0 flex-1">
                        <h4 className="font-extrabold text-stone-900 text-xs truncate leading-tight">
                          {item.title}
                        </h4>
                        <p className="text-[0.68rem] text-stone-500 font-semibold mt-0.5 truncate">
                          {item.artist}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-stone-100 pt-2.5 text-[0.68rem] font-bold text-stone-600">
                      <div>
                        <span>{item.category}</span>
                        {item.subCategory && <span className="text-stone-400 font-normal"> / {item.subCategory}</span>}
                      </div>
                      <div className="flex items-center gap-3">
                        <span>{item.duration}</span>
                        <StatusBadge {...statusConfig} size="sm" />
                      </div>
                    </div>

                    {/* Quick mobile actions */}
                    <div 
                      className="flex items-center justify-end gap-1 border-t border-stone-100 pt-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => openThumbnailModal(item)}
                        className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 inline-flex items-center gap-1 font-bold text-[0.65rem] transition-colors"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>थंबनेल</span>
                      </button>
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-1.5 rounded-lg text-stone-600 hover:bg-stone-100 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setBhajanToDelete(item);
                          setIsDeleteDialogOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* DataTable for Tablet & Desktop screen size */
            <DataTable
              data={paginatedBhajans}
              columns={columns}
              keyExtractor={(item) => item.id}
              onSort={(key, dir) => {
                setSortKey(key);
                setSortDir(dir);
              }}
            />
          )}

          {/* Pagination controls with page size selector */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3.5 px-2">
            <div className="flex items-center gap-4 text-xs font-semibold text-stone-500">
              <span>
                कुल {filteredBhajans.length} में से {(currentPage - 1) * pageSize + 1}-
                {Math.min(currentPage * pageSize, filteredBhajans.length)} भजन प्रदर्शित
              </span>
              
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-stone-400">प्रति पृष्ठ:</span>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="px-2 py-1 bg-stone-50 border border-stone-200 rounded-lg text-xs font-bold text-stone-700 focus:outline-none cursor-pointer"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      )}

      {/* 3. Detail Drawer (Inspect Record Details) */}
      {selectedBhajanForDrawer && (
        <>
          {/* Backdrop overlay */}
          <div 
            className="fixed inset-0 z-40 bg-stone-905 bg-opacity-40 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
            onClick={() => setSelectedBhajanForDrawer(null)}
          />
          
          {/* Drawer Panel */}
          <div 
            className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl border-l border-stone-200 transform transition-transform duration-300 ease-out flex flex-col overflow-hidden animate-in slide-in-from-right font-['Mukta']"
            role="dialog"
            aria-labelledby="drawer-title"
          >
            {/* Header */}
            <div className="px-6 py-4.5 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-orange-50 text-orange-600">
                  <Music className="w-4 h-4" />
                </div>
                <h3 id="drawer-title" className="font-extrabold text-base text-stone-900 leading-tight">
                  भजन विवरण विवरणिका
                </h3>
              </div>
              <button
                onClick={() => setSelectedBhajanForDrawer(null)}
                className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 rounded-xl transition-all"
                aria-label="Close drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* large Artwork */}
              <div className="relative rounded-2xl overflow-hidden border border-stone-250 aspect-video shadow-xs bg-stone-950 group">
                <img 
                  src={selectedBhajanForDrawer.imageUrl} 
                  alt={selectedBhajanForDrawer.title} 
                  className="w-full h-full object-cover" 
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openThumbnailModal(selectedBhajanForDrawer)}
                    className="px-3.5 py-1.5 bg-white text-stone-850 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm scale-95 hover:scale-100 transition-transform"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#EA580C]" />
                    <span>थंबनेल बदलें</span>
                  </button>
                </div>
              </div>

              {/* Core Details */}
              <div className="space-y-4">
                <div>
                  <span className="text-[0.65rem] font-bold text-stone-400 uppercase tracking-widest block">शीर्षक (Title)</span>
                  <h4 className="text-lg font-black text-stone-900 mt-0.5 leading-tight">
                    {selectedBhajanForDrawer.title}
                  </h4>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[0.65rem] font-bold text-stone-400 uppercase tracking-widest block">गायक / कलाकार</span>
                    <span className="font-bold text-stone-800 text-xs block mt-1">{selectedBhajanForDrawer.artist}</span>
                  </div>
                  <div>
                    <span className="text-[0.65rem] font-bold text-stone-400 uppercase tracking-widest block">अवधि (Duration)</span>
                    <span className="font-bold text-stone-700 text-xs block mt-1 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-stone-400" />
                      {selectedBhajanForDrawer.duration}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[0.65rem] font-bold text-stone-400 uppercase tracking-widest block">श्रेणी (Category)</span>
                    <span className="font-bold text-stone-800 text-xs block mt-1">{selectedBhajanForDrawer.category}</span>
                  </div>
                  <div>
                    <span className="text-[0.65rem] font-bold text-stone-400 uppercase tracking-widest block">उप-श्रेणी</span>
                    <span className="font-semibold text-stone-600 text-xs block mt-1">{selectedBhajanForDrawer.subCategory || 'सामान्य'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div>
                    <span className="text-[0.65rem] font-bold text-stone-400 uppercase tracking-widest block">कुल प्ले संख्या</span>
                    <span className="font-bold text-stone-800 text-xs block mt-1 font-mono">
                      {(selectedBhajanForDrawer.plays ?? 0).toLocaleString('hi-IN')}
                    </span>
                  </div>
                  <div>
                    <span className="text-[0.65rem] font-bold text-stone-400 uppercase tracking-widest block">स्थिति (Status)</span>
                    <div className="mt-1">
                      <StatusBadge {...getBhajanStatusConfig(selectedBhajanForDrawer.status || 'प्रकाशित')} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Audio Canonical Playback preview */}
              <div className="p-4.5 bg-stone-50 rounded-2.5xl border border-stone-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                    <Volume2 className="w-4 h-4 text-orange-600" />
                    <span>ऑडियो प्रीव्यू प्लेयर</span>
                  </span>
                  
                  {selectedBhajanForDrawer.status === 'प्रकाशित' ? (
                    <span className="text-[0.65rem] font-bold text-emerald-700 bg-emerald-50 border border-emerald-250 px-2 py-0.5 rounded-md flex items-center gap-0.5">
                      <Globe className="w-3 h-3" />
                      <span>लाइव</span>
                    </span>
                  ) : (
                    <span className="text-[0.65rem] font-bold text-stone-500 bg-stone-100 border border-stone-250 px-2 py-0.5 rounded-md flex items-center gap-0.5">
                      <Lock className="w-3 h-3" />
                      <span>अप्रकाशित</span>
                    </span>
                  )}
                </div>

                {selectedBhajanForDrawer.audioUrl ? (
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        if (currentTrack?.id === selectedBhajanForDrawer.id) {
                          togglePlay();
                        } else {
                          playTrack(selectedBhajanForDrawer);
                        }
                      }}
                      className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 shadow-xs active:scale-95 transition-transform ${
                        currentTrack?.id === selectedBhajanForDrawer.id && isPlaying
                          ? 'bg-[#EA580C] text-white'
                          : 'bg-orange-100 text-orange-850 hover:bg-orange-200'
                      }`}
                    >
                      {currentTrack?.id === selectedBhajanForDrawer.id && isPlaying ? (
                        <Pause className="w-4.5 h-4.5 fill-white stroke-none" />
                      ) : (
                        <Play className="w-4.5 h-4.5 fill-orange-850 stroke-none ml-0.5" />
                      )}
                    </button>
                    
                    <div className="min-w-0 flex-1">
                      <div className="text-[0.72rem] font-bold text-stone-800 truncate">
                        {selectedBhajanForDrawer.audioUrl.split('/').pop()?.split('?')[0] || 'ऑडियो फ़ाइल'}
                      </div>
                      <div className="text-[0.65rem] font-mono text-stone-400 mt-0.5 truncate">
                        {selectedBhajanForDrawer.storagePath || 'स्रोथ पाथ अनुपलब्ध'}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-2 text-stone-400 italic text-xs font-bold">
                    ⚠️ इस भजन के लिए कोई ऑडियो फ़ाइल लिंक नहीं की गई है।
                  </div>
                )}
              </div>

              {/* Lyrics Panel */}
              <div className="space-y-2">
                <span className="text-[0.65rem] font-bold text-stone-400 uppercase tracking-widest block">भजन के बोल (Lyrics)</span>
                <div className="bg-stone-50 border border-stone-200 rounded-2.5xl p-4.5 max-h-56 overflow-y-auto text-xs font-semibold text-stone-700 whitespace-pre-line leading-relaxed scrollbar-thin">
                  {selectedBhajanForDrawer.lyrics ? (
                    selectedBhajanForDrawer.lyrics
                  ) : (
                    <span className="text-stone-400 italic">इस भजन के लिए कोई बोल/लिरिक्स उपलब्ध नहीं हैं।</span>
                  )}
                </div>
              </div>

              {/* Storage Reference Audit */}
              <div className="text-[0.68rem] font-semibold text-stone-400 border-t border-stone-100 pt-4 space-y-1.5 font-mono">
                <div>ID: {selectedBhajanForDrawer.id}</div>
                {selectedBhajanForDrawer.addedDate && <div>Added: {selectedBhajanForDrawer.addedDate}</div>}
              </div>
            </div>

            {/* Bottom Actions Footer */}
            <div className="p-4 bg-stone-50 border-t border-stone-200 grid grid-cols-3 gap-2 font-bold text-xs">
              <button
                type="button"
                onClick={() => {
                  setSelectedBhajanForDrawer(null);
                  openEditModal(selectedBhajanForDrawer);
                }}
                className="py-2.5 bg-white border border-stone-200 hover:bg-stone-100 text-stone-700 rounded-xl transition-colors shadow-2xs flex items-center justify-center gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>संपादित करें</span>
              </button>

              <button
                type="button"
                onClick={() => handleTogglePublishStatus(selectedBhajanForDrawer)}
                className="py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl transition-colors flex items-center justify-center gap-1.5"
              >
                {selectedBhajanForDrawer.status === 'प्रकाशित' ? (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>ड्राफ्ट करें</span>
                  </>
                ) : (
                  <>
                    <Globe className="w-3.5 h-3.5" />
                    <span>प्रकाशित करें</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setBhajanToDelete(selectedBhajanForDrawer);
                  setIsDeleteDialogOpen(true);
                }}
                className="py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors shadow-2xs flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>हटाएँ</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* 4. Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title="भजन रिकॉर्ड स्थायी विलोपन"
        message={`क्या आप सचमुच "${bhajanToDelete?.title}" भजन को हटाना चाहते हैं? यह डेटाबेस संदर्भ को स्थायी रूप से हटा देगा। फ़ाइल मीडिया को हटाने के लिए कृपया स्टोरेज डैशबोर्ड का उपयोग करें।`}
        confirmText="हाँ, स्थायी रूप से हटाएं"
        cancelText="रद्द करें"
        isDestructive={true}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setIsDeleteDialogOpen(false)}
      />

      {/* 5. Quick Change Thumbnail Modal */}
      {thumbnailModalBhajan && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl border border-stone-200 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-amber-50 text-amber-700 border border-amber-250">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-stone-900">
                    भजन का थंबनेल बदलें
                  </h3>
                  <p className="text-xs text-stone-500 truncate max-w-[240px] font-semibold mt-0.5">
                    {thumbnailModalBhajan.title}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setThumbnailModalBhajan(null)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <input
              type="file"
              ref={thumbnailFileInputRef}
              onChange={handleQuickThumbnailUpload}
              accept="image/png, image/jpeg, image/webp"
              className="hidden"
            />

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700 block">
                नया थंबनेल प्रीव्यू (Live Preview):
              </label>
              <div className="relative rounded-2xl overflow-hidden border-2 border-amber-400/80 shadow-md h-48 bg-stone-900">
                <img
                  src={newThumbnailUrl}
                  alt="New Thumbnail Preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2.5 left-2.5 bg-black/70 text-white text-[0.65rem] px-2.5 py-0.5 rounded-full font-bold backdrop-blur-xs">
                  थंबनेल फ़ोटो
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => thumbnailFileInputRef.current?.click()}
                  className="p-3 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-2xl border border-amber-200 flex flex-col items-center justify-center gap-1.5 transition-all text-xs font-bold"
                >
                  <Upload className="w-5 h-5 text-[#EA580C]" />
                  <span>फ़ोटो अपलोड करें</span>
                  <span className="text-[0.65rem] text-stone-550 font-normal">डिवाइस से चुनें</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowUrlField(!showUrlField)}
                  className="p-3 bg-stone-50 hover:bg-stone-100 text-stone-800 rounded-2xl border border-stone-200 flex flex-col items-center justify-center gap-1.5 transition-all text-xs font-bold"
                >
                  <LinkIcon className="w-5 h-5 text-stone-600" />
                  <span>इमेज URL दर्ज करें</span>
                  <span className="text-[0.65rem] text-stone-550 font-normal">वेब लिंक पेस्ट करें</span>
                </button>
              </div>

              {showUrlField && (
                <div className="flex items-center gap-2 bg-stone-50 p-2 border border-stone-200">
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://... इमेज लिंक पेस्ट करें"
                    className="flex-1 px-3 py-1.5 bg-white border border-stone-200 rounded-lg text-xs focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (urlInput.trim()) {
                        setNewThumbnailUrl(urlInput.trim());
                        setUrlInput('');
                      }
                    }}
                    className="px-3.5 py-1.5 bg-[#EA580C] text-white rounded-lg font-bold text-xs shadow-xs"
                  >
                    लागू करें
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2.5 border-t border-stone-100 font-bold text-xs">
              <button
                type="button"
                onClick={() => setThumbnailModalBhajan(null)}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl transition-colors"
              >
                रद्द करें
              </button>
              <button
                type="button"
                onClick={handleSaveThumbnail}
                className="px-5 py-2 bg-[#EA580C] hover:bg-[#C2410C] text-white rounded-xl shadow-md flex items-center gap-1.5 transition-all active:scale-95 duration-100"
              >
                <Check className="w-4 h-4" />
                <span>थंबनेल सुरक्षित करें</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Full Edit Modal */}
      {editingBhajan && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl p-6 max-w-xl w-full shadow-2xl border border-stone-200 space-y-5 animate-in zoom-in-95 duration-150 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-amber-50 text-amber-700 border border-amber-250">
                  <Edit2 className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-base text-stone-900">
                  भजन विवरण संपादित करें
                </h3>
              </div>
              <button
                onClick={() => setEditingBhajan(null)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFullEdit} className="space-y-4 text-xs">
              {/* Title & Singer */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">भजन शीर्षक *</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500 font-bold text-stone-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">गायक / स्वर *</label>
                  <input
                    type="text"
                    value={editArtist}
                    onChange={(e) => setEditArtist(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500 font-semibold text-stone-855 text-stone-800"
                  />
                </div>
              </div>

              {/* Category Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">श्रेणी</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500 text-xs font-semibold text-stone-800 cursor-pointer"
                  >
                    {creatableCategoryOptions.map((cat) => (
                      <option key={cat.id || cat.name} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">उप-श्रेणी</label>
                  <input
                    type="text"
                    value={editSubCategory}
                    onChange={(e) => setEditSubCategory(e.target.value)}
                    placeholder="उप-श्रेणी दर्ज करें"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500 font-semibold"
                  />
                </div>
              </div>

              {/* Duration & Status */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">अवधि (mm:ss)</label>
                  <input
                    type="text"
                    value={editDuration}
                    onChange={(e) => setEditDuration(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">स्थिति</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500 text-xs font-semibold text-stone-850 cursor-pointer"
                  >
                    <option value="प्रकाशित">प्रकाशित</option>
                    <option value="ड्राफ्ट">ड्राफ्ट</option>
                    <option value="शेड्यूल किया गया">शेड्यूल करें (Scheduled Post)</option>
                  </select>
                </div>
              </div>

              {/* Scheduled post fields */}
              {editStatus === 'शेड्यूल किया गया' && (
                <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">शेड्यूल दिनांक</label>
                    <input
                      type="date"
                      value={editScheduledDate}
                      onChange={(e) => setEditScheduledDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">शेड्यूल समय</label>
                    <input
                      type="time"
                      value={editScheduledTime}
                      onChange={(e) => setEditScheduledTime(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              )}

              {/* Artwork Picker */}
              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  थंबनेल इमेज (फ़ाइल अपलोड करें या URL बदलें)
                </label>

                <input
                  type="file"
                  ref={editModalFileInputRef}
                  onChange={handleEditModalImageUpload}
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                />

                <div className="flex items-center gap-3 p-3 bg-stone-50 border border-stone-200 rounded-2xl">
                  <img
                    src={editImageUrl}
                    alt="Thumbnail preview"
                    className="w-16 h-16 rounded-xl object-cover border border-stone-200 shrink-0"
                  />
                  <div className="flex-1 space-y-1.5">
                    <button
                      type="button"
                      onClick={() => editModalFileInputRef.current?.click()}
                      className="px-3 py-1.5 bg-white border border-stone-350 border-stone-300 hover:bg-stone-100 rounded-lg font-bold text-[0.7rem] shadow-xs transition-colors"
                    >
                      डिवाइस से फ़ोटो चुनें
                    </button>
                    <input
                      type="url"
                      value={editImageUrl}
                      onChange={(e) => setEditImageUrl(e.target.value)}
                      placeholder="या इमेज URL दर्ज करें"
                      className="w-full px-2.5 py-1 bg-white border border-stone-200 rounded-lg text-[0.7rem] focus:outline-none focus:border-amber-500 font-mono text-stone-600"
                    />
                  </div>
                </div>
              </div>

              {/* Audio URL Picker */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-stone-700">
                    ऑडियो स्रोत (Audio URL / Storage Path)
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowEditStoragePickerModal(true)}
                    className="text-amber-700 hover:text-amber-900 font-bold text-[0.72rem] flex items-center gap-1"
                  >
                    <HardDrive className="w-3.5 h-3.5" />
                    <span>स्टोरेज ब्राउज़र से चुनें</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={editAudioUrl}
                  onChange={(e) => setEditAudioUrl(e.target.value)}
                  placeholder="फ़ायरबेस स्टोरेज ऑडियो लिंक (https://... या audio/bhajans/...)"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:border-amber-500 font-mono text-stone-600"
                />
              </div>

              {/* Lyrics textarea */}
              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  भजन के बोल / लिरिक्स (Lyrics)
                </label>
                <textarea
                  rows={4}
                  value={editLyrics}
                  onChange={(e) => setEditLyrics(e.target.value)}
                  placeholder="भजन के पद एवं बोल लिखें..."
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500 font-semibold"
                />
              </div>

              {/* Modal footer actions */}
              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-stone-100 font-bold text-xs">
                <button
                  type="button"
                  onClick={() => setEditingBhajan(null)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl transition-colors"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#EA580C] hover:bg-[#C2410C] text-white rounded-xl shadow-md flex items-center gap-1.5 transition-all active:scale-95 duration-100"
                >
                  <Check className="w-4 h-4" />
                  <span>बदलाव सुरक्षित करें</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Storage Audio picker for Edit Modal */}
      <StorageAudioPickerModal
        isOpen={showEditStoragePickerModal}
        onClose={() => setShowEditStoragePickerModal(false)}
        onSelect={(item) => {
          setEditAudioUrl(item.downloadUrl);
          showToast(`स्टोरेज से "${item.name}" का चयन किया गया!`);
        }}
        existingBhajans={bhajans}
        currentSelectedPath={editAudioUrl}
      />
    </div>
  );
};
