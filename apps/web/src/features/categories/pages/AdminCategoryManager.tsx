/**
 * ============================================================================
 * Santmat Satsang Prachar - Category & Sub-Category Manager
 * ============================================================================
 * Allows the administrator to manage devotional categories and sub-categories
 * that power the mobile application's exploration tabs and filtering systems.
 *
 * Enforces the permanent 4-category system:
 * 1. सभी भजन (All Sentinel / Filter only)
 * 2. शाही भजनवाली (Maps to 'शाही भजनावली' & 'शाही भजनवाली')
 * 3. पदावली भजन
 * 4. स्वागत गीत
 *
 * Followed by any administrator-created custom categories.
 */
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderTree,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Tag,
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
  const { categories, addCategory, updateCategory, deleteCategory, bhajans } = useApp();

  // State for adding a new category
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newSubCatInput, setNewSubCatInput] = useState('');
  const [newSubCatsList, setNewSubCatsList] = useState<string[]>([]);

  // State for editing an existing category
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editCatName, setEditCatName] = useState('');
  const [editCatDesc, setEditCatDesc] = useState('');
  const [editSubCatsList, setEditSubCatsList] = useState<string[]>([]);
  const [editSubCatInput, setEditSubCatInput] = useState('');

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  /**
   * Sort categories so that the 4 permanent system categories appear first in exact order:
   * 1. सभी भजन -> 2. शाही भजनवाली -> 3. पदावली भजन -> 4. स्वागत गीत
   * Followed by any custom categories.
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
   * Count bhajans that belong to a specific sub-category
   */
  const getBhajanCountBySubCategory = (subCatName: string): number => {
    return bhajans.filter(
      (b) => b.subCategory && (b.subCategory || '').trim().toLowerCase() === (subCatName || '').trim().toLowerCase()
    ).length;
  };

  /**
   * Handle adding subcategory tag to new category form
   */
  const handleAddNewSubCat = () => {
    if (newSubCatInput.trim() && !newSubCatsList.includes(newSubCatInput.trim())) {
      setNewSubCatsList([...newSubCatsList, newSubCatInput.trim()]);
      setNewSubCatInput('');
    }
  };

  /**
   * Handle removing subcategory tag from new category form
   */
  const handleRemoveNewSubCat = (tagToRemove: string) => {
    setNewSubCatsList(newSubCatsList.filter((tag) => tag !== tagToRemove));
  };

  /**
   * Handle submit create new category
   */
  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = newCatName.trim();
    if (!trimmedName) {
      alert('कृपया श्रेणी का नाम दर्ज करें।');
      return;
    }

    if (isSystemCategoryName(trimmedName) || isSystemCategoryId(trimmedName)) {
      alert(`"${trimmedName}" एक स्थायी सिस्टम श्रेणी है और इस नाम से नई श्रेणी नहीं बनाई जा सकती।`);
      return;
    }

    const isGeneralTarget = ['general', 'सामान्य'].includes(trimmedName.toLowerCase());
    const existingGeneral = categories.find((c) => ['general', 'सामान्य'].includes((c.name || '').toLowerCase()));
    if (isGeneralTarget && existingGeneral) {
      alert('सामान्य (General) श्रेणी पहले से मौजूद है। नई डुप्लिकेट श्रेणी नहीं बनाई जा सकती।');
      return;
    }

    const existingMatch = categories.find((c) => (c.name || '').trim().toLowerCase() === trimmedName.toLowerCase());
    if (existingMatch) {
      alert(`"${trimmedName}" नाम की श्रेणी पहले से मौजूद है।`);
      return;
    }

    addCategory({
      name: trimmedName,
      description: newCatDesc.trim() || 'संतमत सत्संग भक्ति संगीत संग्रह',
      subCategories: newSubCatsList.length > 0 ? newSubCatsList : ['सामान्य भक्ति'],
      active: true,
      order: Math.max(4, sortedCategories.length + 1),
    });

    showToast(`नई कस्टम श्रेणी "${trimmedName}" सफलतापूर्वक जोड़ी गई!`);
    setNewCatName('');
    setNewCatDesc('');
    setNewSubCatsList([]);
    setIsAddingCategory(false);
  };

  /**
   * Start editing an existing category
   */
  const handleStartEdit = (category: CategoryItem) => {
    setEditingCatId(category.id);
    setEditCatName(category.name || category.id);
    setEditCatDesc(category.description || '');
    setEditSubCatsList([...(category.subCategories || [])]);
    setEditSubCatInput('');
  };

  /**
   * Add subcategory chip in edit mode
   */
  const handleAddEditSubCat = () => {
    if (editSubCatInput.trim() && !editSubCatsList.includes(editSubCatInput.trim())) {
      setEditSubCatsList([...editSubCatsList, editSubCatInput.trim()]);
      setEditSubCatInput('');
    }
  };

  /**
   * Remove subcategory chip in edit mode
   */
  const handleRemoveEditSubCat = (tagToRemove: string) => {
    setEditSubCatsList(editSubCatsList.filter((tag) => tag !== tagToRemove));
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
      subCategories: editSubCatsList,
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
        title="श्रेणी एवं उप-श्रेणी प्रबंधन (Category Taxonomy)"
        subtitle="स्थायी सिस्टम श्रेणियाँ (सभी भजन, शाही भजनवाली, पदावली भजन, स्वागत गीत) एवं कस्टम श्रेणियों का प्रबंधन।"
        badgeText="TAXONOMY & SYSTEM CATEGORIES"
        badgeVariant="primary"
        breadcrumbs={[
          { label: 'डैशबोर्ड', href: '/admin' },
          { label: 'श्रेणी प्रबंधन' },
        ]}
        actions={
          <AdminButton
            onClick={() => setIsAddingCategory(!isAddingCategory)}
            variant="primary"
            size="md"
            icon={<Plus className="w-4 h-4" />}
          >
            {isAddingCategory ? 'फॉर्म बंद करें' : 'नई कस्टम श्रेणी जोड़ें'}
          </AdminButton>
        }
      />

      {/* Add New Category Form (Collapsible) */}
      {isAddingCategory && (
        <form
          onSubmit={handleCreateCategory}
          className="admin-card p-6 space-y-4 animate-in fade-in duration-200"
        >
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h3 className="font-extrabold text-base text-stone-900 flex items-center gap-2">
              <Plus className="w-5 h-5 text-[#EA580C]" />
              <span>नई कस्टम श्रेणी जोड़ें (Add Custom Category)</span>
            </h3>
            <button
              type="button"
              onClick={() => setIsAddingCategory(false)}
              className="text-stone-400 hover:text-stone-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-xs text-stone-500">
            नई कस्टम श्रेणियाँ स्थायी 4 सिस्टम श्रेणियों के बाद प्रदर्शित होंगी।
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-stone-700 mb-1">
                श्रेणी का नाम (Category Name) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="उदा. ध्यान एवं मानस जाप"
                required
                className="admin-input"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">
                संक्षिप्त विवरण (Description)
              </label>
              <input
                type="text"
                value={newCatDesc}
                onChange={(e) => setNewCatDesc(e.target.value)}
                placeholder="उदा. ध्यान साधना व अजपा जाप के आध्यात्मिक पद"
                className="admin-input"
              />
            </div>
          </div>

          {/* Sub-categories tag inputs */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              उप-श्रेणियाँ जोड़ें (Add Sub-Categories)
            </label>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="text"
                value={newSubCatInput}
                onChange={(e) => setNewSubCatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddNewSubCat();
                  }
                }}
                placeholder="उप-श्रेणी का नाम लिखें और 'जोड़ें' दबाएं (उदा. अजपा जाप, मानस ध्यान)"
                className="admin-input flex-1"
              />
              <button
                type="button"
                onClick={handleAddNewSubCat}
                className="px-4 py-2 bg-stone-800 hover:bg-stone-900 text-white rounded-xl text-xs font-bold transition-colors"
              >
                + जोड़ें
              </button>
            </div>

            {/* Added Sub-category tags */}
            <div className="flex flex-wrap gap-2 pt-1">
              {newSubCatsList.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold rounded-xl shadow-xs"
                >
                  <Tag className="w-3 h-3 text-amber-700" />
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveNewSubCat(tag)}
                    className="text-stone-400 hover:text-red-600 ml-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
              {newSubCatsList.length === 0 && (
                <p className="text-[0.72rem] text-stone-400 italic">
                  कोई उप-श्रेणी नहीं जोड़ी गई है। आप ऊपर से उप-श्रेणियाँ जोड़ सकते हैं।
                </p>
              )}
            </div>
          </div>

          {/* Submit Action */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <AdminButton
              type="button"
              onClick={() => setIsAddingCategory(false)}
              variant="tertiary"
              size="md"
            >
              रद्द करें
            </AdminButton>
            <AdminButton
              type="submit"
              variant="primary"
              size="md"
              icon={<Check className="w-4 h-4" />}
            >
              श्रेणी सहेजें
            </AdminButton>
          </div>
        </form>
      )}

      {/* Grid of All Active Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {sortedCategories.map((cat, idx) => {
          const isSystem = Boolean(cat.isSystemCategory || isSystemCategoryId(cat.id));
          const isAllSentinel = Boolean(cat.isAllSentinel || isAllSentinelCategory(cat.id) || isAllSentinelCategory(cat.name));
          const isEditing = editingCatId === cat.id;
          const catName = cat.name || cat.id;
          const catSubCategories = cat.subCategories || [];
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
                      <span>{isSystem ? 'सिस्टम श्रेणी संपादित करें' : 'कस्टम श्रेणी संपादित करें'}</span>
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

                  {/* Edit Sub Categories */}
                  {!isAllSentinel && (
                    <div>
                      <label className="block text-[0.72rem] font-bold text-stone-600 mb-1">
                        उप-श्रेणियाँ
                      </label>
                      <div className="flex items-center gap-2 mb-2">
                        <input
                          type="text"
                          value={editSubCatInput}
                          onChange={(e) => setEditSubCatInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddEditSubCat();
                            }
                          }}
                          placeholder="नई उप-श्रेणी जोड़ें"
                          className="admin-input flex-1"
                        />
                        <button
                          type="button"
                          onClick={handleAddEditSubCat}
                          className="px-3 py-1.5 bg-stone-800 text-white rounded-xl text-xs font-bold"
                        >
                          +
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {editSubCatsList.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-stone-100 border border-stone-200 text-stone-800 text-[0.72rem] font-bold rounded-lg"
                          >
                            <span>{tag}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveEditSubCat(tag)}
                              className="text-stone-400 hover:text-red-600"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

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
                              कस्टम श्रेणी
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
                        title={isSystem ? 'विवरण एवं उप-श्रेणियाँ संपादित करें' : 'संपादित करें'}
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

                  {/* Bhajan Count & Subcategories Pill Badges */}
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

                  {/* Sub-categories chip list */}
                  {!isAllSentinel && (
                    <div className="space-y-1.5">
                      <span className="text-[0.68rem] font-bold text-stone-400 uppercase tracking-wider">
                        संबद्ध उप-श्रेणियाँ ({catSubCategories.length})
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {catSubCategories.map((sub) => {
                          const subCount = getBhajanCountBySubCategory(sub);
                          return (
                            <span
                              key={sub}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-stone-50 border border-stone-200 text-stone-700 text-xs font-semibold rounded-xl"
                            >
                              <span>{sub}</span>
                              {subCount > 0 && (
                                <span className="text-[0.65rem] bg-stone-200 text-stone-800 px-1.5 py-0.2 rounded-full font-bold">
                                  {subCount}
                                </span>
                              )}
                            </span>
                          );
                        })}
                        {catSubCategories.length === 0 && (
                          <span className="text-[0.72rem] text-stone-400 italic">
                            कोई उप-श्रेणी संबद्ध नहीं है।
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
