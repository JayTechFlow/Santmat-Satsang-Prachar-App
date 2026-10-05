import React from 'react';
import { Users, SearchX, RotateCcw } from 'lucide-react';

export interface UserEmptyStateProps {
  hasFilters: boolean;
  onResetFilters: () => void;
}

export const UserEmptyState: React.FC<UserEmptyStateProps> = ({ hasFilters, onResetFilters }) => {
  return (
    <tr>
      <td colSpan={6} className="py-14 text-center text-stone-400">
        <div className="flex flex-col items-center justify-center max-w-sm mx-auto p-4">
          {hasFilters ? (
            <>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-3">
                <SearchX className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-stone-800">कोई परिणाम नहीं मिला</h3>
              <p className="text-xs text-stone-500 mt-1 mb-4 leading-relaxed">
                आपके द्वारा चुने गए खोज शब्द या फ़िल्टर से कोई उपयोगकर्ता मेल नहीं खाता।
              </p>
              <button
                type="button"
                onClick={onResetFilters}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5 text-stone-500" />
                <span>फ़िल्टर साफ़ करें</span>
              </button>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-2xl bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-400 mb-3">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-stone-800">कोई उपयोगकर्ता पंजीकृत नहीं है</h3>
              <p className="text-xs text-stone-500 mt-1">
                डेटाबेस में कोई उपयोगकर्ता नहीं पाया गया। नया उपयोगकर्ता जोड़ें।
              </p>
            </>
          )}
        </div>
      </td>
    </tr>
  );
};
