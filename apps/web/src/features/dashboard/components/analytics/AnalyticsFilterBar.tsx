import React from 'react';
import { Filter, RotateCcw, SlidersHorizontal } from 'lucide-react';
import type { AnalyticsFilters, AnalyticsSortOrder } from '../../analytics/types';

/**
 * Analytics filter bar.
 *
 * Every control here maps to a field the Cloud Function actually applies
 * (see RowFilter in firebase/functions/src/analytics.ts). This is the key
 * property: the filters are not cosmetic client-side narrowing, they are
 * translated into a server query, so `totalRows` and the period totals stay
 * consistent with what is displayed.
 */

export interface AnalyticsFilterBarProps {
  filters: AnalyticsFilters;
  sortOrder: AnalyticsSortOrder;
  /** Distinct top categories present in the data, for the category filter. */
  categoryOptions: string[];
  activeFilterCount: number;
  onFiltersChange: (filters: AnalyticsFilters) => void;
  onSortOrderChange: (order: AnalyticsSortOrder) => void;
  onReset: () => void;
  disabled?: boolean;
}

export const EMPTY_FILTERS: AnalyticsFilters = {};

const numberFieldClass =
  'w-24 px-2.5 py-1.5 rounded-lg border border-stone-200 bg-white text-xs font-bold text-stone-700 focus:outline-none focus:ring-2 focus:ring-[#EA580C]/40';

export const AnalyticsFilterBar: React.FC<AnalyticsFilterBarProps> = ({
  filters,
  sortOrder,
  categoryOptions,
  activeFilterCount,
  onFiltersChange,
  onSortOrderChange,
  onReset,
  disabled = false,
}) => {
  const setNumber = (key: keyof AnalyticsFilters, raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) {
      const next = { ...filters };
      delete next[key];
      onFiltersChange(next);
      return;
    }
    const parsed = Number(trimmed);
    if (!Number.isFinite(parsed) || parsed < 0) return;
    onFiltersChange({ ...filters, [key]: Math.trunc(parsed) });
  };

  return (
    <div className="admin-card p-4 space-y-3">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h3 className="font-black text-sm text-stone-900 flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-[#EA580C]" />
          <span>फ़िल्टर</span>
          {activeFilterCount > 0 ? (
            <span className="px-1.5 py-0.5 rounded-full bg-[#EA580C] text-white text-[10px] font-black">
              {activeFilterCount}
            </span>
          ) : null}
        </h3>

        {activeFilterCount > 0 || sortOrder !== 'desc' ? (
          <button
            type="button"
            onClick={onReset}
            disabled={disabled}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-stone-600 hover:bg-stone-100 border border-stone-200 disabled:opacity-50"
          >
            <RotateCcw className="w-3 h-3" />
            फ़िल्टर हटाएँ
          </button>
        ) : null}
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-bold text-stone-500">न्यूनतम प्ले</span>
          <input
            type="number"
            min={0}
            disabled={disabled}
            value={filters.minPlays ?? ''}
            onChange={(e) => setNumber('minPlays', e.target.value)}
            placeholder="कोई नहीं"
            className={numberFieldClass}
            aria-label="न्यूनतम प्ले"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-bold text-stone-500">न्यूनतम श्रवण (सेकंड)</span>
          <input
            type="number"
            min={0}
            disabled={disabled}
            value={filters.minPlaytimeSeconds ?? ''}
            onChange={(e) => setNumber('minPlaytimeSeconds', e.target.value)}
            placeholder="कोई नहीं"
            className={numberFieldClass}
            aria-label="न्यूनतम श्रवण समय सेकंड"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-bold text-stone-500">न्यूनतम सक्रिय उपयोगकर्ता</span>
          <input
            type="number"
            min={0}
            disabled={disabled}
            value={filters.minActiveUsers ?? ''}
            onChange={(e) => setNumber('minActiveUsers', e.target.value)}
            placeholder="कोई नहीं"
            className={numberFieldClass}
            aria-label="न्यूनतम सक्रिय उपयोगकर्ता"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-bold text-stone-500">शीर्ष श्रेणी</span>
          <select
            disabled={disabled}
            value={filters.category ?? ''}
            onChange={(e) => {
              const next = { ...filters };
              if (e.target.value) next.category = e.target.value;
              else delete next.category;
              onFiltersChange(next);
            }}
            className="px-2.5 py-1.5 rounded-lg border border-stone-200 bg-white text-xs font-bold text-stone-700 focus:outline-none focus:ring-2 focus:ring-[#EA580C]/40 disabled:opacity-50"
            aria-label="शीर्ष श्रेणी फ़िल्टर"
          >
            <option value="">सभी</option>
            {categoryOptions.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-bold text-stone-500">क्रम</span>
          <select
            disabled={disabled}
            value={sortOrder}
            onChange={(e) => onSortOrderChange(e.target.value as AnalyticsSortOrder)}
            className="px-2.5 py-1.5 rounded-lg border border-stone-200 bg-white text-xs font-bold text-stone-700 focus:outline-none focus:ring-2 focus:ring-[#EA580C]/40 disabled:opacity-50"
            aria-label="क्रमबद्ध करें"
          >
            <option value="desc">नया → पुराना</option>
            <option value="asc">पुराना → नया</option>
          </select>
        </label>
      </div>

      {categoryOptions.length === 0 ? (
        <p className="flex items-center gap-1.5 text-[11px] font-semibold text-stone-400">
          <Filter className="w-3 h-3" />
          श्रेणी फ़िल्टर उपलब्ध नहीं — इस अवधि में कोई श्रेणी डेटा दर्ज नहीं है।
        </p>
      ) : null}
    </div>
  );
};

export default AnalyticsFilterBar;