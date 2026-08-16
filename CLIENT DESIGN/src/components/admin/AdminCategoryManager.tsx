/**
 * ============================================================================
 * Santmat Satsang Prachar - Category & Sub-Category Manager
 * ============================================================================
 * Allows the administrator to manage devotional categories and sub-categories
 * that power the mobile application's exploration tabs and filtering systems.
 */
import React, { useState } from 'react';
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
  Layers,
  HeartHandshake,
  BookOpen,
  Compass,
  Sunrise,
  Scroll,
  Disc,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CategoryItem } from '../../types';
import { NamasteIcon } from '../shared/DevotionalIcons';

export const AdminCategoryManager: React.FC = () => {
  const { categories, addCategory, updateCategory, deleteCategory, bhajans, setAdminTab } = useApp();

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
   * Helper icon selector based on category name or icon key
   */
  const renderCategoryIcon = (name: string) => {
    if (name.includes('पदावली')) return <Scroll className="w-5 h-5 text-amber-700" />;
    if (name.includes('शाही')) return <Sparkles className="w-5 h-5 text-orange-600" />;
    if (name.includes('स्वागत')) return <HeartHandshake className="w-5 h-5 text-emerald-600" />;
    if (name.includes('विदाई')) return <NamasteIcon className="w-5 h-5 text-purple-600" />;
    if (name.includes('प्रभु')) return <HeartHandshake className="w-5 h-5 text-orange-600" />;
    if (name.includes('सत्संग')) return <BookOpen className="w-5 h-5 text-amber-700" />;
    if (name.includes('गुरु')) return <Sparkles className="w-5 h-5 text-amber-600" />;
    if (name.includes('प्रार्थना')) return <NamasteIcon className="w-5 h-5 text-purple-600" />;
    return <FolderTree className="w-5 h-5 text-orange-600" />;
  };

  /**
   * Count total bhajans that belong to a specific category
   */
  const getBhajanCountByCategory = (categoryName: string): number => {
    return bhajans.filter(
      (b) => b.category.trim().toLowerCase() === categoryName.trim().toLowerCase()
    ).length;
  };

  /**
   * Count bhajans that belong to a specific sub-category
   */
  const getBhajanCountBySubCategory = (subCatName: string): number => {
    return bhajans.filter(
      (b) => b.subCategory && b.subCategory.trim().toLowerCase() === subCatName.trim().toLowerCase()
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
    if (!newCatName.trim()) {
      alert('कृपया श्रेणी का नाम दर्ज करें।');
      return;
    }

    addCategory({
      name: newCatName.trim(),
      description: newCatDesc.trim() || 'संतमत सत्संग भक्ति संगीत संग्रह',
      subCategories: newSubCatsList.length > 0 ? newSubCatsList : ['सामान्य भक्ति'],
      isFeatured: true,
      order: categories.length + 1,
    });

    showToast(`नई श्रेणी "${newCatName}" सफलतापूर्वक जोड़ी गई!`);
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
    setEditCatName(category.name);
    setEditCatDesc(category.description || '');
    setEditSubCatsList([...category.subCategories]);
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
  const handleSaveEdit = (catId: string) => {
    if (!editCatName.trim()) {
      alert('श्रेणी का नाम खाली नहीं हो सकता।');
      return;
    }

    updateCategory(catId, {
      name: editCatName.trim(),
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
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 font-bold text-sm animate-in slide-in-from-top duration-200">
          <Check className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-orange-950 via-amber-900 to-stone-900 p-6 rounded-3xl text-white shadow-md">
        <div>
          <div className="flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-wider mb-1">
            <FolderTree className="w-4 h-4" />
            <span>संगीत एवं सत्संग वर्गीकरण</span>
          </div>
          <h1 className="text-2xl font-extrabold">श्रेणी एवं उप-श्रेणी प्रबंधन</h1>
          <p className="text-stone-300 text-sm mt-1 max-w-2xl">
            यहाँ से आप मोबाइल ऐप में प्रदर्शित होने वाली सभी प्रमुख श्रेणियों (जैसे प्रभु भजन, सत्संग भजन, गुरु महिमा) एवं उनकी उप-श्रेणियों को जोड़, संपादित अथवा हटा सकते हैं।
          </p>
        </div>

        <button
          onClick={() => setIsAddingCategory(!isAddingCategory)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold rounded-2xl text-sm transition-all shadow-md active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{isAddingCategory ? 'फॉर्म बंद करें' : 'नई श्रेणी जोड़ें'}</span>
        </button>
      </div>

      {/* Add New Category Form (Collapsible) */}
      {isAddingCategory && (
        <form
          onSubmit={handleCreateCategory}
          className="bg-white rounded-3xl p-6 border-2 border-amber-300/80 shadow-lg space-y-4 animate-in fade-in duration-200"
        >
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h3 className="font-extrabold text-base text-stone-900 flex items-center gap-2">
              <Plus className="w-5 h-5 text-[#EA580C]" />
              <span>नई श्रेणी जोड़ें (Add New Category)</span>
            </h3>
            <button
              type="button"
              onClick={() => setIsAddingCategory(false)}
              className="text-stone-400 hover:text-stone-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

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
                className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500 font-bold text-stone-900"
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
                className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500 text-stone-800"
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
                className="flex-1 px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-amber-500"
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
            <button
              type="button"
              onClick={() => setIsAddingCategory(false)}
              className="px-5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition-colors"
            >
              रद्द करें
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-[#EA580C] hover:bg-[#C2410C] text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>श्रेणी सहेजें</span>
            </button>
          </div>
        </form>
      )}

      {/* Grid of All Active Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {categories.map((cat, idx) => {
          const isEditing = editingCatId === cat.id;
          const bhajanCount = getBhajanCountByCategory(cat.name);

          return (
            <div
              key={cat.id || idx}
              className={`bg-white rounded-3xl p-5 border transition-all shadow-xs hover:shadow-md ${
                isEditing ? 'border-amber-500 ring-2 ring-amber-100' : 'border-stone-200'
              }`}
            >
              {isEditing ? (
                /* Edit Mode Form */
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                    <span className="text-xs font-bold text-amber-700">श्रेणी संपादित करें</span>
                    <button
                      onClick={() => setEditingCatId(null)}
                      className="text-stone-400 hover:text-stone-700 text-xs font-bold"
                    >
                      रद्द करें
                    </button>
                  </div>

                  <div>
                    <label className="block text-[0.72rem] font-bold text-stone-600 mb-1">
                      श्रेणी नाम
                    </label>
                    <input
                      type="text"
                      value={editCatName}
                      onChange={(e) => setEditCatName(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-xl font-bold focus:outline-none focus:border-amber-500"
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
                      className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Edit Sub Categories */}
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
                        className="flex-1 px-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-amber-500"
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
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
                    <button
                      type="button"
                      onClick={() => setEditingCatId(null)}
                      className="px-4 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl"
                    >
                      रद्द करें
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveEdit(cat.id)}
                      className="px-5 py-1.5 bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-bold rounded-xl shadow-xs"
                    >
                      अपडेट करें
                    </button>
                  </div>
                </div>
              ) : (
                /* View Mode */
                <div className="space-y-3.5">
                  {/* Category Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center shadow-xs shrink-0">
                        {renderCategoryIcon(cat.name)}
                      </div>
                      <div>
                        <h3 className="font-black text-base text-stone-900 leading-tight">
                          {cat.name}
                        </h3>
                        <p className="text-xs text-stone-500 mt-0.5 line-clamp-1">
                          {cat.description || 'संतमत सत्संग भक्ति संगीत'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleStartEdit(cat)}
                        className="p-1.5 text-stone-500 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition-colors"
                        title="संपादित करें"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          if (categories.length <= 1) {
                            alert('कम से कम एक श्रेणी होना अनिवार्य है।');
                            return;
                          }
                          if (confirm(`क्या आप निश्चित रूप से "${cat.name}" श्रेणी को हटाना चाहते हैं?`)) {
                            deleteCategory(cat.id);
                            showToast(`"${cat.name}" श्रेणी हटा दी गई।`);
                          }
                        }}
                        className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="हटाएं"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Bhajan Count & Subcategories Pill Badges */}
                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-stone-600 font-bold">
                      <Music className="w-3.5 h-3.5 text-amber-700" />
                      <span>कुल भजन:</span>
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-900 rounded-full font-black text-xs">
                        {bhajanCount}
                      </span>
                    </div>

                    <button
                      onClick={() => setAdminTab('bhajan_list')}
                      className="text-xs font-bold text-amber-800 hover:underline"
                    >
                      इस श्रेणी के भजन देखें →
                    </button>
                  </div>

                  {/* Sub-categories chip list */}
                  <div className="space-y-1.5">
                    <span className="text-[0.68rem] font-bold text-stone-400 uppercase tracking-wider">
                      संबद्ध उप-श्रेणियाँ ({cat.subCategories.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {cat.subCategories.map((sub) => {
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
                    </div>
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
