import React from 'react';
import { ArrowDown, ArrowUp, CalendarRange, Info } from 'lucide-react';
import type { AnalyticsTotals, DailyAnalyticsRecord } from '../../analytics/types';
import { formatDayKey } from '../../analytics/dateRange';
import { formatDuration, formatIndian } from '../../analytics/format';

/**
 * Daily analytics table.
 *
 * Per-cell coverage handling is the point of this component: a day where the
 * play collector was not running shows "—" in the play column while still
 * showing its (real) registration count. Rendering a column as fully zeroed
 * would destroy the signal that registrations genuinely existed that day.
 */

export type SortableColumn =
  | 'date'
  | 'totalPlays'
  | 'totalListenDurationSeconds'
  | 'uniqueActiveUsers'
  | 'distinctTracksPlayed'
  | 'newRegistrations';

export interface AnalyticsTableProps {
  rows: DailyAnalyticsRecord[];
  coverage: AnalyticsTotals['coverage'];
  sortKey: SortableColumn;
  sortDirection: 'asc' | 'desc';
  onSortChange: (key: SortableColumn) => void;
}

interface ColumnSpec {
  key: SortableColumn;
  label: string;
  /** false → render an em dash instead of a number. */
  covered: boolean;
  render: (row: DailyAnalyticsRecord) => string;
  /** numeric accessor used for client-side sort within the loaded page. */
  numeric: (row: DailyAnalyticsRecord) => number;
}

const COLUMNS: ColumnSpec[] = [
  {
    key: 'date',
    label: 'दिनांक',
    covered: true,
    render: (row) => formatDayKey(row.date),
    numeric: (row) => Date.parse(`${row.date}T00:00:00.000Z`),
  },
  {
    key: 'totalPlays',
    label: 'कुल प्ले',
    covered: false,
    render: (row) => formatIndian(row.totalPlays),
    numeric: (row) => row.totalPlays ?? 0,
  },
  {
    key: 'totalListenDurationSeconds',
    label: 'श्रवण समय',
    covered: false,
    render: (row) => formatDuration(row.totalListenDurationSeconds),
    numeric: (row) => row.totalListenDurationSeconds ?? 0,
  },
  {
    key: 'uniqueActiveUsers',
    label: 'सक्रिय उपयोगकर्ता',
    covered: false,
    render: (row) => formatIndian(row.uniqueActiveUsers),
    numeric: (row) => row.uniqueActiveUsers ?? 0,
  },
  {
    key: 'distinctTracksPlayed',
    label: 'विशिष्ट भजन',
    covered: false,
    render: (row) => formatIndian(row.distinctTracksPlayed),
    numeric: (row) => row.distinctTracksPlayed ?? 0,
  },
  {
    key: 'newRegistrations',
    label: 'नए पंजीकरण',
    covered: true,
    render: (row) => formatIndian(row.newRegistrations),
    numeric: (row) => row.newRegistrations ?? 0,
  },
];

export const AnalyticsTable: React.FC<AnalyticsTableProps> = ({ rows, coverage, sortKey, sortDirection, onSortChange }) => {
  const sorted = [...rows].sort((a, b) => {
    const column = COLUMNS.find((c) => c.key === sortKey) ?? COLUMNS[0];
    const delta = column.numeric(a) - column.numeric(b);
    return sortDirection === 'asc' ? delta : -delta;
  });

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="text-left text-stone-500 border-b border-stone-200">
            {COLUMNS.map((column) => {
              const isSorted = sortKey === column.key;
              const covered = column.covered || coverage[coverageKeyFor(column.key)];
              return (
                <th key={column.key} className="py-2 pr-3 font-bold">
                  <button
                    type="button"
                    onClick={() => onSortChange(column.key)}
                    className="inline-flex items-center gap-1 hover:text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C]/40 rounded"
                    aria-label={`${column.label} से क्रमबद्ध करें`}
                  >
                    {column.label}
                    {!covered ? (
                      <Info className="w-3 h-3 text-amber-500" aria-label="इस स्तंभ का डेटा एकत्र नहीं हुआ" />
                    ) : null}
                    {isSorted ? (
                      sortDirection === 'asc' ? (
                        <ArrowUp className="w-3 h-3 text-[#EA580C]" />
                      ) : (
                        <ArrowDown className="w-3 h-3 text-[#EA580C]" />
                      )
                    ) : null}
                  </button>
                </th>
              );
            })}
            <th className="py-2 font-bold">स्थिति</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => (
            <tr key={row.date} className="border-b border-stone-100 last:border-0 hover:bg-stone-50/60">
              {COLUMNS.map((column) => {
                const covered = column.covered || coverage[coverageKeyFor(column.key)];
                return (
                  <td
                    key={column.key}
                    className={`py-2 pr-3 ${column.key === 'date' ? 'font-bold text-stone-800' : 'text-stone-700'}`}
                  >
                    {covered ? column.render(row) : <span className="text-stone-300 font-bold">—</span>}
                  </td>
                );
              })}
              <td className="py-2">
                {row.isPartial ? (
                  <span className="px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-black">
                    अधूरा
                  </span>
                ) : row.topCategory ? (
                  <span className="px-1.5 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200 text-[10px] font-bold">
                    {row.topCategory}
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-stone-300">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/** Map a column to the coverage flag that governs it. */
export const coverageKeyFor = (key: SortableColumn): keyof AnalyticsTotals['coverage'] => {
  switch (key) {
    case 'totalPlays':
      return 'plays';
    case 'totalListenDurationSeconds':
      return 'playtime';
    case 'uniqueActiveUsers':
      return 'activeUsers';
    case 'distinctTracksPlayed':
      return 'libraryActivity';
    default:
      return 'registrations';
  }
};

export const AnalyticsTableHeader: React.FC<{ children: React.ReactNode; right?: React.ReactNode }> = ({
  children,
  right,
}) => (
  <div className="flex items-center justify-between gap-3 border-b border-stone-100 pb-3 flex-wrap">
    <h3 className="font-black text-base text-stone-900 flex items-center gap-2">
      <CalendarRange className="w-5 h-5 text-[#EA580C]" />
      <span>{children}</span>
    </h3>
    {right}
  </div>
);

export default AnalyticsTable;