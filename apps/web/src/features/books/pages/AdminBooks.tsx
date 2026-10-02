/**
 * ============================================================================
 * Santmat Satsang Prachar - Books Library Management (Admin)
 * ============================================================================
 * Manage the devotional books library backed by the real `books` collection.
 * Includes Cover Image Validation/Optimization, PDF Validation, and
 * browser-native PDF preview modal.
 */
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  BookMarked,
  Plus,
  Trash2,
  Upload,
  Loader2,
  FileText,
  Eye,
  Edit2,
  FileUp,
  Check,
} from 'lucide-react';
import { bookService } from '../services/bookService';
import { BookEntity } from '../../../types/common/index';
import { contentPublishingService, PublishProgress } from '../../../services/shared/ContentPublishingService';
import { UploadProgressComponent } from '../../../components/ui/UploadProgress';

import { SearchBar } from '../../../components/ui/SearchBar';
import {
  AdminButton,
  AdminPageHeader,
  AdminModal,
  AdminModalHeader,
  AdminModalTitle,
  AdminModalClose,
  AdminModalBody,
  AdminModalFooter,
} from '../../../components/admin';
import { FilterBar } from '../../../components/ui/FilterBar';
import { Pagination } from '../../../components/ui/Pagination';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { EmptyState } from '../../../components/ui/EmptyState';
import { ErrorState } from '../../../components/ui/ErrorState';
import { DataTable, Column } from '../../../components/ui/DataTable';

// Media validation / optimization
import { mediaValidator, MEDIA_VALIDATION_CONFIGS } from '../../../lib/media/validation/MediaValidator';
import { ImageOptimizer } from '../../../lib/media/optimization/ImageOptimizer';

interface BookForm {
  title: string;
  author: string;
  category: string;
  pagesCount: string;
  publishDate: string;
  coverUrl: string;
  pdfUrl: string;
  status: 'published' | 'draft';
  language: string;
  description: string;
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
  language: 'हिंदी',
  description: '',
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
  
  // File refs
  const coverInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [publishProgress, setPublishProgress] = useState<PublishProgress | null>(null);

  // Responsive state
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Sorting state
  const [sortKey, setSortKey] = useState<string>('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // PDF Preview url
  const [previewPdfUrl, setPreviewPdfUrl] = useState<string | null>(null);

  // Details drawer
  const [selectedBookForDrawer, setSelectedBookForDrawer] = useState<BookEntity | null>(null);

  // Delete Dialog state
  const [bookToDelete, setBookToDelete] = useState<BookEntity | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Cover media stats & error states
  const [coverOriginalStats, setCoverOriginalStats] = useState<{ name: string; size: string; width: number; height: number; format: string } | null>(null);
  const [coverOptimizedStats, setCoverOptimizedStats] = useState<{ size: string; width: number; height: number; format: string; ratio: number } | null>(null);
  const [coverErrors, setCoverErrors] = useState<string[]>([]);

  // PDF media stats & error states
  const [pdfOriginalStats, setPdfOriginalStats] = useState<{ name: string; size: string } | null>(null);
  const [pdfErrors, setPdfErrors] = useState<string[]>([]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  const resetFormStates = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setCoverFile(null);
    setPdfFile(null);
    setCoverOriginalStats(null);
    setCoverOptimizedStats(null);
    setCoverErrors([]);
    setPdfOriginalStats(null);
    setPdfErrors([]);
  };

  const openAdd = () => {
    resetFormStates();
    setIsFormOpen(true);
  };

  const openEdit = (book: BookEntity) => {
    resetFormStates();
    setForm({
      title: book.title || '',
      author: book.author || '',
      category: book.category || '',
      pagesCount: book.pagesCount ? String(book.pagesCount) : '',
      publishDate: book.publishDate || '',
      coverUrl: book.coverUrl || '',
      pdfUrl: book.pdfUrl || '',
      status: book.status === 'draft' ? 'draft' : 'published',
      language: book.language || 'हिंदी',
      description: book.description || '',
    });
    setEditingId(book.id);
    setIsFormOpen(true);
  };

  // Cover image validation and canvas WebP optimization
  const handleCoverUpload = async (file: File) => {
    setCoverOriginalStats(null);
    setCoverOptimizedStats(null);
    setCoverErrors([]);

    // 1. Initial basic validation (MIME/size/extension)
    const initialValidation = await mediaValidator.validate(file, 'image', 'book_cover', true);
    if (!initialValidation.valid) {
      const errMsgs = initialValidation.errors.map(e => e.message);
      setCoverErrors(errMsgs);
      alert(`कवर इमेज सत्यापन विफल:\n${errMsgs.join('\n')}`);
      return;
    }

    // Read dimensions
    const img = new Image();
    img.src = URL.createObjectURL(file);
    await new Promise<void>((resolve) => {
      img.onload = () => {
        setCoverOriginalStats({
          name: file.name,
          size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
          width: img.naturalWidth,
          height: img.naturalHeight,
          format: file.type,
        });
        resolve();
      };
      img.onerror = () => {
        resolve();
      };
    });

    // 2. Optimize image to 2:3 WebP
    const config = MEDIA_VALIDATION_CONFIGS['book_cover'];
    const optRes = await ImageOptimizer.optimize(file, {
      maxWidth: config.maxWidth,
      maxHeight: config.maxHeight,
      quality: 0.82,
    });

    if (optRes.success && optRes.data) {
      const stats = optRes.data;

      // 3. Final validation on optimized file
      const finalValidation = await mediaValidator.validate(stats.file, 'image', 'book_cover', false);
      if (!finalValidation.valid) {
        const errMsgs = finalValidation.errors.map(e => e.message);
        setCoverErrors(errMsgs);
        alert(`कवर इमेज सत्यापन विफल:\n${errMsgs.join('\n')}`);
        setCoverFile(null);
        setCoverOriginalStats(null);
        return;
      }

      setCoverFile(stats.file);
      const optUrl = URL.createObjectURL(stats.file);
      setForm((f) => ({ ...f, coverUrl: optUrl }));
      setCoverOptimizedStats({
        size: (stats.optimized.sizeBytes / 1024 / 1024).toFixed(2) + ' MB',
        width: stats.optimized.width,
        height: stats.optimized.height,
        format: stats.optimized.mimeType,
        ratio: stats.optimized.compressionRatio,
      });
      showMessage('कवर इमेज अनुकूलित एवं सत्यापित हुई');
    } else {
      // Fallback validate
      const finalValidation = await mediaValidator.validate(file, 'image', 'book_cover', false);
      if (!finalValidation.valid) {
        const errMsgs = finalValidation.errors.map(e => e.message);
        setCoverErrors(errMsgs);
        alert(`कवर इमेज सत्यापन विफल:\n${errMsgs.join('\n')}`);
        setCoverFile(null);
        setCoverOriginalStats(null);
        return;
      }
      setCoverFile(file);
      showMessage('कवर इमेज चयनित हुई (अपलोड लंबित है)');
    }
  };

  // PDF file validation
  const handlePdfUpload = async (file: File) => {
    setPdfOriginalStats(null);
    setPdfErrors([]);

    const result = await mediaValidator.validate(file, 'pdf', 'book_pdf');
    if (!result.valid) {
      const errMsgs = result.errors.map(e => e.message);
      setPdfErrors(errMsgs);
      alert(`PDF फ़ाइल सत्यापन विफल:\n${errMsgs.join('\n')}`);
      return;
    }

    setPdfFile(file);
    setPdfOriginalStats({
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
    });
    setForm((f) => ({ ...f, pdfUrl: file.name }));
    showMessage('PDF पुस्तक फ़ाइल सत्यापित हुई (अपलोड लंबित है)');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.author.trim()) return;

    if (!pdfFile && !form.pdfUrl.trim()) {
      alert('कृपया पुस्तक की PDF फ़ाइल अपलोड करें।');
      return;
    }

    setIsUploading(true);
    setPublishProgress({
      phase: 'IDLE',
      percentage: 0,
      message: 'सामग्री अपलोड प्रारंभ हो रही है...',
    });

    // Handle defensive checks
    const payload: Record<string, any> = {
      title: form.title.trim(),
      author: form.author.trim(),
      category: form.category.trim() || 'सामान्य',
      pagesCount: form.pagesCount ? Number(form.pagesCount) : undefined,
      publishDate: form.publishDate.trim() || undefined,
      status: form.status,
      language: form.language,
      description: form.description.trim(),
    };
    if (editingId) {
      payload.id = editingId;
    }

    const res = await contentPublishingService.publishContent({
      contentType: 'book',
      payload,
      files: {
        pdf: pdfFile,
        image: coverFile,
      },
      existingUrls: {
        pdf: pdfFile ? undefined : form.pdfUrl,
        image: coverFile ? undefined : form.coverUrl.startsWith('data:') || form.coverUrl.startsWith('blob:') ? undefined : form.coverUrl,
      },
      actionType: form.status === 'draft' ? 'draft' : 'publish',
    }, (prog) => {
      setPublishProgress(prog);
    });

    setIsUploading(false);

    if (res.success) {
      showMessage(editingId ? 'पुस्तक विवरण अपडेट हुआ।' : 'नई पुस्तक जोड़ी गई।');
      setTimeout(() => {
        setPublishProgress(null);
        setIsFormOpen(false);
        resetFormStates();
      }, 1500);
    } else {
      showMessage(res.error || 'सहेजने की प्रक्रिया विफल रही।');
    }
  };

  const confirmDelete = async () => {
    if (!bookToDelete) return;
    const res = await bookService.deleteBook(bookToDelete.id);
    if (res.success) {
      showMessage('पुस्तक हटा दी गई।');
      setIsDeleteDialogOpen(false);
      setBookToDelete(null);
    } else {
      alert(res.error || 'पुस्तक हटाने में त्रुटि');
    }
  };

  // Search & Filter Memo Logic
  const filteredBooks = useMemo(() => {
    return books
      .filter((book) => {
        const matchesSearch =
          !searchQuery.trim() ||
          (book.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (book.author || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (book.description || '').toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCategory = !selectedCategory || book.category === selectedCategory;
        const matchesLanguage = !selectedLanguage || book.language === selectedLanguage;
        const matchesStatus =
          !selectedStatus ||
          (selectedStatus === 'published' && book.status !== 'draft') ||
          (selectedStatus === 'draft' && book.status === 'draft');

        return matchesSearch && matchesCategory && matchesLanguage && matchesStatus;
      })
      .sort((a, b) => {
        let valA = (a as any)[sortKey] ?? '';
        let valB = (b as any)[sortKey] ?? '';
        
        if (typeof valA === 'string') {
          return sortDir === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        } else {
          return sortDir === 'asc' ? valA - valB : valB - valA;
        }
      });
  }, [books, searchQuery, selectedCategory, selectedLanguage, selectedStatus, sortKey, sortDir]);

  // Paginated books
  const paginatedBooks = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredBooks.slice(start, start + pageSize);
  }, [filteredBooks, currentPage, pageSize]);

  // Unique categories & languages from active books
  const categoryOptions = useMemo(() => {
    const categoriesSet = new Set(books.map((b) => b.category).filter(Boolean));
    return Array.from(categoriesSet).map((c) => ({ label: c, value: c }));
  }, [books]);

  const languageOptions = useMemo(() => {
    const langSet = new Set(books.map((b) => b.language).filter(Boolean));
    return Array.from(langSet).map((l) => ({ label: l, value: l }));
  }, [books]);

  const statusOptions = [
    { label: 'प्रकाशित (Published)', value: 'published' },
    { label: 'ड्राफ्ट (Draft)', value: 'draft' },
  ];

  // DataTable Column Definitions
  const columns: Column<BookEntity>[] = [
    {
      header: 'कवर (Cover)',
      key: 'coverUrl',
      render: (item) => (
        <div 
          onClick={() => setSelectedBookForDrawer(item)}
          className="w-8 h-12 rounded-lg overflow-hidden border border-stone-200 shrink-0 bg-stone-50 cursor-pointer animate-in fade-in duration-200"
        >
          {item.coverUrl ? (
            <img src={item.coverUrl} alt={item.title} className="w-full h-full object-cover" />
          ) : (
            <BookMarked className="w-4 h-4 text-stone-300 mx-auto mt-4" />
          )}
        </div>
      ),
    },
    {
      header: 'पुस्तक का नाम (Title)',
      key: 'title',
      sortable: true,
      render: (item) => (
        <span 
          onClick={() => setSelectedBookForDrawer(item)}
          className="font-bold text-stone-900 hover:text-emerald-700 cursor-pointer block truncate max-w-[200px]"
        >
          {item.title}
        </span>
      ),
    },
    {
      header: 'लेखक (Author)',
      key: 'author',
      sortable: true,
    },
    {
      header: 'श्रेणी (Category)',
      key: 'category',
      sortable: true,
      render: (item) => (
        <span className="inline-flex items-center gap-1 bg-stone-55 text-stone-700 px-2 py-0.5 rounded-full border border-stone-200 text-[0.65rem] font-bold">
          {item.category}
        </span>
      ),
    },
    {
      header: 'भाषा (Language)',
      key: 'language',
      sortable: true,
      render: (item) => (
        <span className="text-stone-600 font-semibold">
          {item.language || 'हिंदी'}
        </span>
      ),
    },
    {
      header: 'पृष्ठ (Pages)',
      key: 'pagesCount',
      sortable: true,
      render: (item) => item.pagesCount ? `${item.pagesCount} पृष्ठ` : '-',
    },
    {
      header: 'स्थिति (Status)',
      key: 'status',
      sortable: true,
      render: (item) => (
        <StatusBadge 
          variant={item.status === 'draft' ? 'draft' : 'published'} 
          label={item.status === 'draft' ? 'ड्राफ्ट' : 'प्रकाशित'}
          size="sm"
        />
      ),
    },
    {
      header: 'कार्रवाई (Actions)',
      key: 'id',
      render: (item) => (
        <div className="flex items-center gap-2">
          {item.pdfUrl && (
            <button
              onClick={() => setPreviewPdfUrl(item.pdfUrl!)}
              className="p-1.5 hover:bg-emerald-50 text-emerald-700 rounded-md transition-colors"
              title="पूर्वावलोकन (Preview)"
            >
              <Eye className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => openEdit(item)}
            className="p-1.5 hover:bg-amber-50 text-amber-800 rounded-md transition-colors"
            title="संपादित करें"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setBookToDelete(item);
              setIsDeleteDialogOpen(true);
            }}
            className="p-1.5 hover:bg-red-50 text-red-600 rounded-md transition-colors"
            title="हटाएं"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto font-['Mukta'] select-none">
      {/* Header Bar */}
      <AdminPageHeader
        title="संत साहित्य पुस्तकालय (Books Library)"
        subtitle="आध्यात्मिक ग्रंथों, किताबों एवं संत साहित्य का प्रबंधन करें — नई पुस्तक जोड़ें, 2:3 कवर अपलोड करें, प्रकाशित/ड्राफ्ट स्थिति नियंत्रित करें।"
        badgeText="LITERATURE & PDFS"
        badgeVariant="success"
        breadcrumbs={[
          { label: 'डैशबोर्ड', href: '/admin' },
          { label: 'पुस्तकालय' },
        ]}
        actions={
          <AdminButton
            onClick={openAdd}
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
          >
            नई पुस्तक जोड़ें
          </AdminButton>
        }
      />

      {message && (
        <div className="admin-toast admin-toast-success">
          {message}
        </div>
      )}

      {/* Coordinated Ingestion Upload Progress Panel */}
      {publishProgress && (
        <UploadProgressComponent
          progress={publishProgress}
          onClose={() => setPublishProgress(null)}
        />
      )}

      {/* Search & Filters */}
      <div className="admin-card p-4 flex flex-col lg:flex-row items-center gap-3">
        <div className="w-full lg:flex-1">
          <SearchBar
            value={searchQuery}
            onSearch={setSearchQuery}
            placeholder="पुस्तक का नाम, लेखक, विवरण खोजें..."
          />
        </div>
        <div className="w-full lg:w-auto self-stretch lg:self-auto flex flex-wrap items-center gap-2 shrink-0">
          <FilterBar
            options={categoryOptions}
            value={selectedCategory}
            onChange={(val) => setSelectedCategory(String(val))}
            placeholder="सभी श्रेणियाँ (Categories)"
          />
          <FilterBar
            options={languageOptions}
            value={selectedLanguage}
            onChange={(val) => setSelectedLanguage(String(val))}
            placeholder="सभी भाषाएँ (Languages)"
          />
          <FilterBar
            options={statusOptions}
            value={selectedStatus}
            onChange={(val) => setSelectedStatus(String(val))}
            placeholder="सभी स्थितियाँ (Statuses)"
          />
        </div>
      </div>

      {/* Books Display */}
      {loading ? (
        <div className="admin-card p-12 text-center space-y-3">
          <Loader2 className="w-10 h-10 mx-auto text-emerald-600 animate-spin" />
          <p className="text-xs font-bold text-stone-600">पुस्तकें लोड हो रही हैं…</p>
        </div>
      ) : error ? (
        <ErrorState
          title="डेटा लोड करने में असमर्थ"
          message={error}
          onRetry={() => window.location.reload()}
        />
      ) : filteredBooks.length === 0 ? (
        <EmptyState
          title="कोई पुस्तक नहीं मिली"
          message="खोजे गए मापदंडों के अनुसार कोई पुस्तक उपलब्ध नहीं है। कृपया फ़िल्टर बदलें।"
          action={
            <AdminButton
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('');
                setSelectedLanguage('');
                setSelectedStatus('');
              }}
              variant="tertiary"
              size="md"
            >
              फ़िल्टर साफ़ करें
            </AdminButton>
          }
        />
      ) : (
        <div className="space-y-4">
          {isMobile ? (
            /* Card list view for Mobile screen size */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {paginatedBooks.map((book) => (
                <div 
                  key={book.id} 
                  onClick={() => setSelectedBookForDrawer(book)}
                  className="admin-card p-4 hover:shadow-md transition-shadow flex flex-col gap-3 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-18 rounded-lg overflow-hidden border border-stone-200 shrink-0 bg-stone-50">
                      {book.coverUrl ? (
                        <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
                      ) : (
                        <BookMarked className="w-6 h-6 text-stone-300 mx-auto mt-6" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-extrabold text-stone-900 text-sm truncate leading-tight">
                        {book.title}
                      </h4>
                      <p className="text-[0.68rem] text-stone-500 font-semibold mt-0.5 truncate">
                        {book.author}
                      </p>
                      <div className="flex items-center gap-1.5 mt-2">
                        <StatusBadge 
                          variant={book.status === 'draft' ? 'draft' : 'published'} 
                          label={book.status === 'draft' ? 'ड्राफ्ट' : 'प्रकाशित'}
                          size="sm"
                        />
                        <span className="text-[0.65rem] bg-stone-105 text-stone-75 px-2 py-0.5 rounded-full border border-stone-200">
                          {book.category}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* DataTable for Tablet & Desktop screen size */
            <DataTable
              data={paginatedBooks}
              columns={columns}
              keyExtractor={(item) => item.id}
              onSort={(key, dir) => {
                setSortKey(key);
                setSortDir(dir);
              }}
            />
          )}

          {/* Pagination controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 px-2">
            <div className="flex items-center gap-4 text-xs font-semibold text-stone-500">
              <span>
                कुल {filteredBooks.length} में से {(currentPage - 1) * pageSize + 1}-
                {Math.min(currentPage * pageSize, filteredBooks.length)} पुस्तकें प्रदर्शित
              </span>
              
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-stone-400">प्रति पृष्ठ:</span>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="admin-select w-auto"
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
              totalPages={Math.ceil(filteredBooks.length / pageSize)}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      )}

      {/* Add / Edit Book Modal */}
      <AdminModal open={isFormOpen} onOpenChange={(o) => { if (!o) setIsFormOpen(false); }} className="max-w-lg">
        <AdminModalHeader>
          <AdminModalTitle className="flex items-center gap-2">
            <BookMarked className="w-6 h-6 text-emerald-700" />
            <span>{editingId ? 'पुस्तक विवरण संपादित करें' : 'नई पुस्तक जोड़ें'}</span>
          </AdminModalTitle>
          <AdminModalClose onClick={() => setIsFormOpen(false)} />
        </AdminModalHeader>
        <AdminModalBody>
          <form onSubmit={handleSubmit} id="book-form" className="space-y-4 text-xs font-bold text-stone-700">
              {/* Section 1: Basic Information */}
              <div className="space-y-3">
                <h4 className="text-[0.72rem] text-emerald-800 uppercase tracking-wider border-l-2 border-emerald-600 pl-2">
                  1. सामान्य जानकारी (Basic Information)
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="book-title" className="block text-stone-700 mb-1">पुस्तक का नाम *</label>
                    <input
                      id="book-title"
                      name="title"
                      required
                      type="text"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      placeholder="उदा. सत्यनाम की महिमा"
                      className="admin-input"
                    />
                  </div>
                  <div>
                    <label htmlFor="book-author" className="block text-stone-700 mb-1">लेखक / ग्रन्थ *</label>
                    <input
                      id="book-author"
                      name="author"
                      required
                      type="text"
                      value={form.author}
                      onChange={(e) => setForm({ ...form, author: e.target.value })}
                      placeholder="उदा. पूज्य गुरुदेव"
                      className="admin-input"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="book-desc" className="block text-stone-700 mb-1">पुस्तक विवरण (Description)</label>
                  <textarea
                    id="book-desc"
                    name="description"
                    rows={2}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="पुस्तक के अध्यायों, इतिहास या उपयोग का संक्षिप्त विवरण दर्ज करें..."
                    className="admin-textarea font-medium"
                  />
                </div>
              </div>

              {/* Section 2: Classification */}
              <div className="space-y-3">
                <h4 className="text-[0.72rem] text-emerald-800 uppercase tracking-wider border-l-2 border-emerald-600 pl-2">
                  2. वर्गीकरण (Classification)
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="book-category" className="block text-stone-700 mb-1">श्रेणी (Category)</label>
                    <select
                      id="book-category"
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="admin-select"
                    >
                      <option value="सत्संग">सत्संग (Satsang)</option>
                      <option value="भजन">भजन (Devotional Songs)</option>
                      <option value="जीवनी">जीवनी (Biography)</option>
                      <option value="दर्शन">दर्शन (Philosophy)</option>
                      <option value="पद्यावली">पद्यावली (Poetry)</option>
                      <option value="सामान्य">सामान्य (General)</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="book-language" className="block text-stone-700 mb-1">भाषा (Language)</label>
                    <select
                      id="book-language"
                      value={form.language}
                      onChange={(e) => setForm({ ...form, language: e.target.value })}
                      className="admin-select"
                    >
                      <option value="हिंदी">हिंदी (Hindi)</option>
                      <option value="अंग्रेजी">अंग्रेजी (English)</option>
                      <option value="मैथिली">मैथिली (Maithili)</option>
                      <option value="संस्कृत">संस्कृत (Sanskrit)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 3: Cover Image Upload */}
              <div className="space-y-3">
                <h4 className="text-[0.72rem] text-emerald-800 uppercase tracking-wider border-l-2 border-emerald-600 pl-2">
                  3. कवर इमेज (Book Cover Artwork)
                </h4>
                
                <div className="flex items-center gap-3">
                  <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) handleCoverUpload(e.target.files[0]);
                    }}
                  />
                  <div
                    onClick={() => coverInputRef.current?.click()}
                    className="flex-1 border-2 border-dashed border-stone-300 hover:border-emerald-500 rounded-xl p-3 bg-stone-50 flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <Upload className="w-4 h-4 text-emerald-700" />
                    <span>कवर इमेज चुनें</span>
                  </div>
                  {form.coverUrl && (
                    <img src={form.coverUrl} alt="Cover Preview" className="w-10 h-14 object-cover rounded-lg border border-stone-200 shrink-0" />
                  )}
                </div>

                {/* Cover validation summary display */}
                {coverOriginalStats && (
                  <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 space-y-2 text-[0.7rem] text-stone-700 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between border-b border-stone-200 pb-1.5">
                      <span className="font-bold text-stone-900">कवर फ़ाइल विवरण (Cover Metadata)</span>
                      <span className="bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded-full text-[0.6rem]">
                        सत्यापित
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 font-semibold">
                      <div>मूल आकार: <strong className="text-stone-900">{coverOriginalStats.size}</strong></div>
                      <div>मूल आयाम: <strong className="text-stone-900">{coverOriginalStats.width}x{coverOriginalStats.height}</strong></div>
                      {coverOptimizedStats && (
                        <>
                          <div>अनुकूलित आकार: <strong className="text-stone-900">{coverOptimizedStats.size}</strong></div>
                          <div>अनुकूलित आयाम: <strong className="text-stone-900">{coverOptimizedStats.width}x{coverOptimizedStats.height}</strong></div>
                          <div className="col-span-2 text-emerald-700">WebP अनुपात: <strong>{coverOptimizedStats.ratio}x छोटा</strong></div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {coverErrors.length > 0 && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-3 space-y-1">
                    <span className="font-bold text-rose-900">कवर त्रुटियां:</span>
                    <ul className="list-disc pl-4 space-y-0.5 font-medium">
                      {coverErrors.map((err, i) => <li key={i}>{err}</li>)}
                    </ul>
                  </div>
                )}
              </div>

              {/* Section 4: PDF Document */}
              <div className="space-y-3">
                <h4 className="text-[0.72rem] text-emerald-800 uppercase tracking-wider border-l-2 border-emerald-600 pl-2">
                  4. पुस्तक PDF दस्तावेज़ (PDF Document)
                </h4>
                
                <input
                  ref={pdfInputRef}
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) handlePdfUpload(e.target.files[0]);
                  }}
                />

                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={form.pdfUrl}
                    onChange={(e) => setForm({ ...form, pdfUrl: e.target.value })}
                    placeholder="https://... या PDF फ़ाइल अपलोड करें"
                    className="admin-input flex-1 min-w-0"
                  />
                  <AdminButton
                    type="button"
                    onClick={() => pdfInputRef.current?.click()}
                    variant="primary"
                    icon={<FileUp className="w-4 h-4" />}
                    className="shrink-0"
                  >
                    PDF अपलोड
                  </AdminButton>
                </div>

                {pdfOriginalStats && (
                  <div className="bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-[0.7rem] text-stone-700 flex items-center justify-between animate-in fade-in duration-200">
                    <div>
                      <span>PDF आकार: <strong>{pdfOriginalStats.size}</strong></span>
                    </div>
                    <span className="bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded-full text-[0.6rem]">
                      सत्यापित
                    </span>
                  </div>
                )}

                {pdfErrors.length > 0 && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-3 space-y-1">
                    <span className="font-bold text-rose-900">PDF त्रुटियां:</span>
                    <ul className="list-disc pl-4 space-y-0.5 font-medium">
                      {pdfErrors.map((err, i) => <li key={i}>{err}</li>)}
                    </ul>
                  </div>
                )}

                <div>
                  <label htmlFor="book-pages" className="block text-stone-700 mb-1">कुल पृष्ठ संख्या (Total Pages)</label>
                  <input
                    id="book-pages"
                    name="pagesCount"
                    type="number"
                    min={1}
                    value={form.pagesCount}
                    onChange={(e) => setForm({ ...form, pagesCount: e.target.value })}
                    placeholder="उदा. 120"
                    className="admin-input"
                  />
                </div>
              </div>

              {/* Section 5: Publication */}
              <div className="space-y-3">
                <h4 className="text-[0.72rem] text-emerald-800 uppercase tracking-wider border-l-2 border-emerald-600 pl-2">
                  5. प्रकाशन (Publication Details)
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="book-status" className="block text-stone-700 mb-1">स्थिति (Status)</label>
                    <select
                      id="book-status"
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value as 'published' | 'draft' })}
                      className="admin-select"
                    >
                      <option value="published">प्रकाशित (Published)</option>
                      <option value="draft">ड्राफ्ट (Draft)</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="book-publish-date" className="block text-stone-700 mb-1">प्रकाशन तिथि (Publish Date)</label>
                    <input
                      id="book-publish-date"
                      name="publishDate"
                      type="date"
                      value={form.publishDate}
                      onChange={(e) => setForm({ ...form, publishDate: e.target.value })}
                      className="admin-input"
                    />
                  </div>
                </div>
              </div>

              {/* Section 6: Preview */}
              <div className="space-y-3 bg-stone-50 border border-stone-200 rounded-2xl p-4">
                <h4 className="text-[0.72rem] text-emerald-800 uppercase tracking-wider border-l-2 border-emerald-600 pl-2">
                  6. लाइव पूर्वावलोकन (Card Live Preview)
                </h4>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-18 rounded-xl overflow-hidden border border-stone-200 bg-white shrink-0 flex items-center justify-center">
                    {form.coverUrl ? (
                      <img src={form.coverUrl} alt="Cover Live" className="w-full h-full object-cover" />
                    ) : (
                      <BookMarked className="w-6 h-6 text-stone-300" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h5 className="font-extrabold text-stone-900 text-sm truncate">{form.title || 'शीर्षक विहीन'}</h5>
                    <p className="text-[0.68rem] text-stone-500 font-semibold">{form.author || 'अज्ञात लेखक'}</p>
                    <div className="flex items-center gap-2 mt-1 text-[0.62rem] text-stone-600">
                      <span>श्रेणी: {form.category || 'सामान्य'}</span>
                      <span>•</span>
                      <span>भाषा: {form.language}</span>
                      {form.pagesCount && (
                        <>
                          <span>•</span>
                          <span>{form.pagesCount} पृष्ठ</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 7: Actions */}
              <div className="pt-2 flex justify-end gap-2 border-t border-stone-150">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-bold"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-md disabled:opacity-60 flex items-center gap-1"
                >
                  {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>{editingId ? 'अपडेट करें' : 'सहेजें'}</span>
                </button>
              </div>
            </form>
        </AdminModalBody>
      </AdminModal>

      {/* Book details drawer/modal */}
      {selectedBookForDrawer && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-end"
          onClick={() => setSelectedBookForDrawer(null)}
        >
          <div 
            className="bg-white h-full max-w-md w-full p-6 border-l border-stone-200 shadow-2xl flex flex-col space-y-5 relative overflow-y-auto animate-in slide-in-from-right duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <span className="font-extrabold text-stone-900 text-base">पुस्तक विवरण (Book Details)</span>
              <button
                onClick={() => setSelectedBookForDrawer(null)}
                className="text-stone-400 hover:text-stone-700 p-1"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-28 h-40 rounded-2xl overflow-hidden border border-stone-200 shadow-sm bg-stone-50">
                {selectedBookForDrawer.coverUrl ? (
                  <img src={selectedBookForDrawer.coverUrl} alt={selectedBookForDrawer.title} className="w-full h-full object-cover" />
                ) : (
                  <BookMarked className="w-12 h-12 text-stone-300 mt-14 mx-auto" />
                )}
              </div>
              <div>
                <h3 className="font-extrabold text-stone-900 text-base leading-snug">{selectedBookForDrawer.title}</h3>
                <p className="text-xs text-stone-500 font-semibold mt-1">द्वारा: {selectedBookForDrawer.author}</p>
              </div>
            </div>

            <div className="space-y-3 bg-stone-50 p-4 rounded-2xl border border-stone-150 text-xs">
              <div className="flex justify-between">
                <span className="text-stone-500 font-semibold">श्रेणी (Category):</span>
                <span className="font-extrabold text-stone-900">{selectedBookForDrawer.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500 font-semibold">भाषा (Language):</span>
                <span className="font-extrabold text-stone-900">{selectedBookForDrawer.language || 'हिंदी'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500 font-semibold">पृष्ठ (Pages):</span>
                <span className="font-extrabold text-stone-900">{selectedBookForDrawer.pagesCount || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500 font-semibold">प्रकाशन तिथि (Publish Date):</span>
                <span className="font-extrabold text-stone-900">{selectedBookForDrawer.publishDate || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500 font-semibold">प्रकाशन स्थिति (Status):</span>
                <span className="font-extrabold text-stone-900 capitalize">{selectedBookForDrawer.status || 'published'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500 font-semibold">PDF लिंक (PDF Available):</span>
                <span className={`font-extrabold ${selectedBookForDrawer.pdfUrl ? 'text-emerald-700' : 'text-stone-400'}`}>
                  {selectedBookForDrawer.pdfUrl ? 'हाँ (Yes)' : 'नहीं (No)'}
                </span>
              </div>
              {selectedBookForDrawer.description && (
                <div className="pt-2 border-t border-stone-200">
                  <span className="text-stone-500 font-semibold block mb-1">विवरण (Description):</span>
                  <p className="text-stone-800 font-medium leading-relaxed">{selectedBookForDrawer.description}</p>
                </div>
              )}
            </div>

            <div className="pt-4 mt-auto border-t border-stone-150 flex items-center gap-2">
              <button
                onClick={() => {
                  setSelectedBookForDrawer(null);
                  openEdit(selectedBookForDrawer);
                }}
                className="flex-1 py-2.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl text-xs font-bold transition-colors"
              >
                संपादित करें (Edit)
              </button>
              {selectedBookForDrawer.pdfUrl && (
                <button
                  onClick={() => {
                    setPreviewPdfUrl(selectedBookForDrawer.pdfUrl!);
                  }}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>पढ़ें / पूर्वावलोकन</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PDF Preview Modal */}
      {previewPdfUrl && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-4xl w-full h-[85vh] border border-stone-200 shadow-2xl flex flex-col space-y-4 relative animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-stone-900 text-base flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-700" />
                <span>पुस्तक दस्तावेज़ पूर्वावलोकन (PDF Preview)</span>
              </h3>
              <button
                onClick={() => setPreviewPdfUrl(null)}
                className="text-stone-400 hover:text-stone-700 p-1 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 bg-stone-100 rounded-lg overflow-hidden border border-stone-200">
              <iframe
                src={`${previewPdfUrl}#toolbar=0`}
                title="PDF Preview"
                className="w-full h-full border-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title="पुस्तक हटाएं (Delete Book)"
        message={`क्या आप वास्तव में पुस्तक '${bookToDelete?.title || ''}' को हटाना चाहते हैं? यह क्रिया पूर्ववत नहीं की जा सकती।`}
        onConfirm={confirmDelete}
        onCancel={() => {
          setIsDeleteDialogOpen(false);
          setBookToDelete(null);
        }}
      />
    </div>
  );
};
