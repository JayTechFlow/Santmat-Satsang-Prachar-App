import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

/**
 * Server-side pagination control.
 *
 * The shared `AdminPagination` renders one button per page, which is unusable
 * for a 365-day range (up to 53 pages at a 7-day page size). This component
 * windows the page buttons around the current page and additionally exposes
 * first/last jumps.
 *
 * `totalRows` comes from the backend, so the "showing X–Y of Z" line stays
 * truthful when filters are active.
 */

export interface AnalyticsPaginationProps {
  page: number;
  totalPages: number;
  totalRows: number;
  returnedRows: number;
  pageSize: number;
  disabled?: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
}

/** Build a compact window of page numbers with ellipsis markers. */
export const buildPageWindow = (page: number, totalPages: number, span = 2): Array<number | 'gap'> => {
  if (totalPages <= 1) return [1];

  // When every page fits comfortably in the window, show them all rather than
  // inserting a gap that hides a page the operator could otherwise reach.
  const maxRenderable = span * 2 + 3;
  if (totalPages <= maxRenderable) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages = new Set<number>([1, totalPages, page]);
  for (let offset = 1; offset <= span; offset += 1) {
    if (page - offset >= 1) pages.add(page - offset);
    if (page + offset <= totalPages) pages.add(page + offset);
  }

  const sorted = [...pages].sort((a, b) => a - b);
  const withGaps: Array<number | 'gap'> = [];
  let previous = 0;
  for (const value of sorted) {
    if (previous && value - previous > 1) withGaps.push('gap');
    withGaps.push(value);
    previous = value;
  }
  return withGaps;
};

const navButtonClass =
  'p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 disabled:opacity-30 disabled:pointer-events-none transition-colors';

export const AnalyticsPagination: React.FC<AnalyticsPaginationProps> = ({
  page,
  totalPages,
  totalRows,
  returnedRows,
  pageSize,
  disabled = false,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [7, 14, 31, 62, 93],
}) => {
  if (totalPages <= 1 && !onPageSizeChange) return null;

  const firstRow = totalRows === 0 ? 0 : (page - 1) * pageSize + 1;
  const lastRow = totalRows === 0 ? 0 : firstRow + returnedRows - 1;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-stone-100">
      <p className="text-[11px] font-bold text-stone-500">
        {totalRows === 0 ? (
          'कोई रिकॉर्ड नहीं'
        ) : (
          <>
            <span className="text-stone-700">
              {formatRowRange(firstRow, lastRow)}
            </span>{' '}
            में से {formatTotal(totalRows)} दिन
          </>
        )}
      </p>

      <div className="flex items-center gap-3 flex-wrap justify-center">
        {onPageSizeChange ? (
          <label className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-stone-500">प्रति पृष्ठ</span>
            <select
              value={pageSize}
              disabled={disabled}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="px-2 py-1 rounded-lg border border-stone-200 bg-white text-[11px] font-bold text-stone-700 focus:outline-none focus:ring-2 focus:ring-[#EA580C]/40 disabled:opacity-50"
              aria-label="प्रति पृष्ठ पंक्तियाँ"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        {totalPages > 1 ? (
          <nav className="flex items-center gap-1 font-['Mukta']" aria-label="पृष्ठ नेविगेशन">
            <button
              type="button"
              onClick={() => onPageChange(1)}
              disabled={disabled || page === 1}
              className={navButtonClass}
              aria-label="पहला पृष्ठ"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onPageChange(page - 1)}
              disabled={disabled || page === 1}
              className={navButtonClass}
              aria-label="पिछला पृष्ठ"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {buildPageWindow(page, totalPages).map((entry, index) =>
              entry === 'gap' ? (
                <span key={`gap-${index}`} className="px-1 text-[11px] font-black text-stone-400">
                  …
                </span>
              ) : (
                <button
                  key={entry}
                  type="button"
                  onClick={() => onPageChange(entry)}
                  disabled={disabled}
                  aria-current={entry === page ? 'page' : undefined}
                  className={`min-w-8 h-8 px-1.5 rounded-lg text-xs font-bold flex items-center justify-center transition-colors ${
                    entry === page
                      ? 'bg-[#EA580C] text-white shadow-xs'
                      : 'text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  {entry}
                </button>
              )
            )}

            <button
              type="button"
              onClick={() => onPageChange(page + 1)}
              disabled={disabled || page === totalPages}
              className={navButtonClass}
              aria-label="अगला पृष्ठ"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onPageChange(totalPages)}
              disabled={disabled || page === totalPages}
              className={navButtonClass}
              aria-label="अंतिम पृष्ठ"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </nav>
        ) : null}
      </div>
    </div>
  );
};

const formatTotal = (value: number): string => new Intl.NumberFormat('en-IN').format(value);
const formatRowRange = (from: number, to: number): string => `${formatTotal(from)}–${formatTotal(to)}`;

export default AnalyticsPagination;