/**
 * ============================================================================
 * Santmat Satsang Prachar - Category Manager
 * ============================================================================
 * Allows the administrator to manage devotional categories that power the
 * mobile application's exploration tabs and filtering systems.
 *
 * Enforces the permanent 4-category taxonomy:
 * 1. सभी भजन (All Sentinel / Filter only)
 * 2. शाही भजनावली (Maps to 'शाही भजनावली' & 'शाही भजनवाली')
 * 3. पदावली भजन
 * 4. स्वागत गीत
 */
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderTree,
  Edit2,
  Trash2,
  Check,
  Music,
  Sparkles,
  HeartHandshake,
  BookOpen,
  Scroll,
  Power,
  ShieldCheck,
  Layers,
} from 'lucide-react';
import { useApp } from '../../../app/providers/AppContext';
import { CategoryItem } from '../../../types/common/index';
import { NamasteIcon } from '../../../components/shared/DevotionalIcons';
import { AdminPageHeader, AdminButton } from '../../../components/admin';
import {
  isSystemCategoryId,
  isSystemCategoryName,
  isAllSentinelCategory,
  matchesBhajanCategory,
  sortCategoriesWithSystemFirst,
} from '../config/systemCategories';

export const AdminCategoryManager: React.FC = () => {
  const navigate = useNavigate();
  const { categories, updateCategory, deleteCategory, bhajans } = useApp();

  // State for editing an existing category
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editCatName, setEditCatName] = useState('');
  const [editCatDesc, setEditCatDesc] = useState('');

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  /**
   * Sort categories so that the 4 permanent system categories appear first in exact order:
   * 1. सभी भजन -> 2. शाही भजनावली -> 3. पदावली भजन -> 4. स्वागत गीत
   */
  const sortedCategories = useMemo(() => {
    return sortCategoriesWithSystemFirst(categories);
  }, [categories]);

  /**
   * Helper icon selector based on category name or icon key
   */
  const renderCategoryIcon = (name: string, isAllSentinel?: boolean) => {
    if (isAllSentinel || isAllSentinelCategory(name)) {
      return <Layers className="w-5 h-5 text-amber-600" />;
    }
    const safeName = name || '';
    if (safeName.includes('पदावली')) return <Scroll className="w-5 h-5 text-amber-700" />;
    if (safeName.includes('शाही')) return <Sparkles className="w-5 h-5 text-orange-600" />;
    if (safeName.includes('स्वागत')) return <HeartHandshake className="w-5 h-5 text-emerald-600" />;
    if (safeName.includes('विदाई')) return <NamasteIcon className="w-5 h-5 text-purple-600" />;
    if (safeName.includes('प्रभु')) return <HeartHandshake className="w-5 h-5 text-orange-600" />;
    if (safeName.includes('सत्संग')) return <BookOpen className="w-5 h-5 text-amber-700" />;
    if (safeName.includes('गुरु')) return <Sparkles className="w-5 h-5 text-amber-600" />;
    if (safeName.includes('प्रार्थना')) return <NamasteIcon className="w-5 h-5 text-purple-600" />;
    return <FolderTree className="w-5 h-5 text-orange-600" />;
  };

  /**
   * Count total bhajans that belong to a specific category
   */
  const getBhajanCountByCategory = (category: CategoryItem): number => {
    if (category.isAllSentinel || isAllSentinelCategory(category.id) || isAllSentinelCategory(category.name)) {
      return bhajans.length;
    }
    return bhajans.filter((b) => matchesBhajanCategory(b.category, category.name)).length;
  };

  /**
   * Start editing an existing category
   */
  const handleStartEdit = (category: CategoryItem) => {
    setEditingCatId(category.id);
    setEditCatName(category.name || category.id);
    setEditCatDesc(category.description || '');
  };

  /**
   * Save edited category
   */
  const handleSaveEdit = (catId: string, isSystem: boolean) => {
    if (!editCatName.trim()) {
      alert('श्रेणी का नाम खाली नहीं हो सकता।');
      return;
    }

    if (!isSystem && isSystemCategoryName(editCatName.trim())) {
      alert(`श्रेणी का नाम बदलकर स्थायी सिस्टम श्रेणी "${editCatName.trim()}" नहीं किया जा सकता।`);
      return;
    }

    updateCategory(catId, {
      ...(isSystem ? {} : { name: editCatName.trim() }),
      description: editCatDesc.trim(),
    });

    showToast('श्रेणी सफलतापूर्वक अपडेट हो गई!');
    setEditingCatId(null);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto font-['Mukta'] select-none">
      {/* Toast feedback */}
      {toastMessage && (
        <div className="admin-toast admin-toast-success">
          <Check className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <AdminPageHeader
        title="श्रेणी प्रबंधन (Category Taxonomy)"
        subtitle="स्थायी 4 सिस्टम श्रेणियाँ (सभी भजन, शाही भजनावली, पदावली भजन, स्वागत गीत)।"
        badgeText="SYSTEM CATEGORIES"
        badgeVariant="primary"
        breadcrumbs={[
          { label: 'डैशबोर्ड', href: '/admin' },
          { label: 'श्रेणी प्रबंधन' },
        ]}
      />

      {/* Grid of All Active Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {sortedCategories.map((cat, idx) => {
          const isSystem = Boolean(cat.isSystemCategory || isSystemCategoryId(cat.id));
          const isAllSentinel = Boolean(cat.isAllSentinel || isAllSentinelCategory(cat.id) || isAllSentinelCategory(cat.name));
          const isEditing = editingCatId === cat.id;
          const catName = cat.name || cat.id;
          const bhajanCount = getBhajanCountByCategory(cat);

          return (
            <div
              key={cat.id || idx}
              className={`admin-card p-5 transition-all hover:shadow-md ${
                isEditing
                  ? 'border-amber-500 ring-2 ring-amber-100'
                  : isSystem
                  ? 'border-amber-200 bg-linear-to-b from-amber-50/20 to-transparent'
                  : 'border-stone-200'
              }`}
            >
              {isEditing ? (
                /* Edit Mode Form */
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                    <span className="text-xs font-bold text-amber-700 flex items-center gap-1.5">
                      {isSystem && <ShieldCheck className="w-4 h-4 text-amber-600" />}
                      <span>{isSystem ? 'सिस्टम श्रेणी संपादित करें' : 'श्रेणी संपादित करें'}</span>
                    </span>
                    <button
                      onClick={() => setEditingCatId(null)}
                      className="text-stone-400 hover:text-stone-700 text-xs font-bold"
                    >
                      रद्द करें
                    </button>
                  </div>

                  <div>
                    <label className="block text-[0.72rem] font-bold text-stone-600 mb-1">
                      श्रेणी नाम {isSystem && <span className="text-amber-700 font-semibold">(स्थायी - बदला नहीं जा सकता)</span>}
                    </label>
                    <input
                      type="text"
                      value={editCatName}
                      onChange={(e) => setEditCatName(e.target.value)}
                      disabled={isSystem}
                      className={`admin-input ${isSystem ? 'bg-stone-100 text-stone-500 cursor-not-allowed select-none' : ''}`}
                    />
                  </div>

                  <div>
                    <label className="block text-[0.72rem] font-bold text-stone-600 mb-1">
                      विवरण
                    </label>
                    <input
                      type="text"
                      value={editCatDesc}
                      onChange={(e) => setEditCatDesc(e.target.value)}
                      className="admin-input"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
                    <AdminButton
                      type="button"
                      onClick={() => setEditingCatId(null)}
                      variant="tertiary"
                      size="sm"
                    >
                      रद्द करें
                    </AdminButton>
                    <AdminButton
                      type="button"
                      onClick={() => handleSaveEdit(cat.id, isSystem)}
                      variant="primary"
                      size="sm"
                    >
                      अपडेट करें
                    </AdminButton>
                  </div>
                </div>
              ) : (
                /* View Mode */
                <div className="space-y-3.5">
                  {/* Category Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center shadow-xs shrink-0 ${
                        isSystem ? 'bg-amber-100/70 border-amber-300' : 'bg-stone-50 border-stone-200'
                      }`}>
                        {renderCategoryIcon(catName, isAllSentinel)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-black text-base text-stone-900 leading-tight">
                            {catName}
                          </h3>
                          {isSystem ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.65rem] font-black bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs">
                              <ShieldCheck className="w-3 h-3 text-amber-700" />
                              <span>सिस्टम श्रेणी</span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[0.65rem] font-bold bg-stone-100 text-stone-700 border border-stone-200">
                              श्रेणी
                            </span>
                          )}
                          <span
                            className={`px-2 py-0.5 rounded-full text-[0.65rem] font-extrabold ${
                              cat.active === false
                                ? 'bg-red-100 text-red-800 border border-red-200'
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            }`}
                          >
                            {cat.active === false ? 'निष्क्रिय' : 'सक्रिय'}
                          </span>
                        </div>
                        <p className="text-xs text-stone-500 mt-0.5 line-clamp-1">
                          {isAllSentinel
                            ? 'स्थायी फ़िल्टर — सभी प्रकाशित भजन प्रदर्शित करने हेतु (Filter Sentinel)'
                            : cat.description || 'संतमत सत्संग भक्ति संगीत'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {/* Active/Inactive Power toggle */}
                      {isSystem ? (
                        <button
                          type="button"
                          disabled
                          className="p-1.5 rounded-md text-emerald-600/40 cursor-not-allowed opacity-60"
                          title="सिस्टम श्रेणियाँ स्थायी रूप से सक्रिय रहती हैं"
                        >
                          <Power className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            const newStatus = cat.active === false;
                            updateCategory(cat.id, { active: newStatus });
                            showToast(`श्रेणी "${catName}" ${newStatus ? 'सक्रिय' : 'निष्क्रिय'} की गई।`);
                          }}
                          className={`p-1.5 rounded-md transition-colors ${
                            cat.active === false
                              ? 'text-stone-400 hover:text-emerald-700 hover:bg-emerald-50'
                              : 'text-emerald-600 hover:text-red-600 hover:bg-red-50'
                          }`}
                          title={cat.active === false ? 'सक्रिय करें' : 'निष्क्रिय करें'}
                        >
                          <Power className="w-4 h-4" />
                        </button>
                      )}

                      {/* Edit Button */}
                      <button
                        onClick={() => handleStartEdit(cat)}
                        className="p-1.5 text-stone-500 hover:text-amber-800 hover:bg-amber-50 rounded-md transition-colors"
                        title={isSystem ? 'विवरण संपादित करें' : 'संपादित करें'}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      {/* Delete Button */}
                      {isSystem ? (
                        <button
                          type="button"
                          disabled
                          className="p-1.5 text-stone-300 cursor-not-allowed opacity-40"
                          title="स्थायी सिस्टम श्रेणी को हटाया नहीं जा सकता"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            if (confirm(`क्या आप निश्चित रूप से "${catName}" श्रेणी को हटाना चाहते हैं?`)) {
                              deleteCategory(cat.id);
                              showToast(`"${catName}" श्रेणी हटा दी गई।`);
                            }
                          }}
                          className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="हटाएं"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Bhajan Count Pill Badges */}
                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-stone-600 font-bold">
                      <Music className="w-3.5 h-3.5 text-amber-700" />
                      <span>{isAllSentinel ? 'कुल प्रकाशित भजन:' : 'इस श्रेणी के भजन:'}</span>
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-900 rounded-full font-black text-xs">
                        {bhajanCount}
                      </span>
                    </div>

                    <button
                      onClick={() => navigate('/admin/bhajan-list')}
                      className="text-xs font-bold text-amber-800 hover:underline"
                    >
                      {isAllSentinel ? 'सभी भजन देखें →' : 'इस श्रेणी के भजन देखें →'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
