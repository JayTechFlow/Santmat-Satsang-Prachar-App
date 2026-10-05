import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import type { UserProfile } from '../../../types/common/index';
import { UserTableRow } from './UserTableRow';
import { UserTableSkeleton } from './UserTableSkeleton';
import { UserEmptyState } from './UserEmptyState';

export interface UserTableProps {
  users: UserProfile[];
  totalFilteredCount: number;
  loading: boolean;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  hasActiveFilters: boolean;
  onResetFilters: () => void;
  currentAuthUid?: string;
  isDeveloperSuperAdmin: boolean;
  isClientSuperAdmin: boolean;
  onViewDetails: (user: UserProfile) => void;
  onEditProfile: (user: UserProfile) => void;
  onChangeRole: (user: UserProfile) => void;
  onToggleStatus: (user: UserProfile) => void;
  onPermanentDelete: (user: UserProfile) => void;
}

export const UserTable: React.FC<UserTableProps> = ({
  users,
  totalFilteredCount,
  loading,
  currentPage,
  pageSize,
  totalPages,
  onPageChange,
  onPageSizeChange,
  hasActiveFilters,
  onResetFilters,
  currentAuthUid,
  isDeveloperSuperAdmin,
  isClientSuperAdmin,
  onViewDetails,
  onEditProfile,
  onChangeRole,
  onToggleStatus,
  onPermanentDelete,
}) => {
  const startRange = totalFilteredCount > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endRange = Math.min(currentPage * pageSize, totalFilteredCount);

  return (
    <section aria-label="उपयोगकर्ता सूची" className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
      {/* Header bar */}
      <div className="p-4 border-b border-stone-100 flex flex-wrap items-center justify-between gap-3 text-xs font-bold text-stone-500 bg-stone-50/60">
        <div>
          <span>प्रदर्शित: </span>
          <strong className="text-stone-900">{totalFilteredCount}</strong>
          <span> में से </span>
          <strong className="text-stone-900">{startRange}–{endRange}</strong>
        </div>

        <div className="flex items-center gap-2">
          <span>प्रति पृष्ठ:</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="bg-white border border-stone-200 rounded-lg px-2.5 py-1 text-xs font-bold text-stone-800 cursor-pointer"
            aria-label="प्रति पृष्ठ उपयोगकर्ता संख्या"
          >
            {[10, 25, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table grid */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse" role="grid">
          <thead>
            <tr className="border-b border-stone-200 bg-stone-50/90 text-[0.7rem] uppercase tracking-wider font-extrabold text-stone-600">
              <th scope="col" className="py-3.5 px-4">उपयोगकर्ता</th>
              <th scope="col" className="py-3.5 px-4 hidden sm:table-cell">संपर्क एवं UID</th>
              <th scope="col" className="py-3.5 px-4">रोल</th>
              <th scope="col" className="py-3.5 px-4">स्थिति</th>
              <th scope="col" className="py-3.5 px-4 hidden md:table-cell">पंजीकरण व गतिविधि</th>
              <th scope="col" className="py-3.5 px-4 text-right">कार्य</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 text-xs">
            {loading ? (
              <UserTableSkeleton rows={pageSize > 10 ? 10 : pageSize} />
            ) : users.length > 0 ? (
              users.map((user) => (
                <UserTableRow
                  key={user.uid}
                  user={user}
                  isSelf={currentAuthUid === user.uid}
                  isDeveloperSuperAdmin={isDeveloperSuperAdmin}
                  isClientSuperAdmin={isClientSuperAdmin}
                  onViewDetails={onViewDetails}
                  onEditProfile={onEditProfile}
                  onChangeRole={onChangeRole}
                  onToggleStatus={onToggleStatus}
                  onPermanentDelete={onPermanentDelete}
                />
              ))
            ) : (
              <UserEmptyState hasFilters={hasActiveFilters} onResetFilters={onResetFilters} />
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 0 && (
        <div className="p-4 border-t border-stone-100 bg-stone-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-bold text-stone-600">
          <div>
            पृष्ठ <strong className="text-stone-900">{currentPage}</strong> / <strong className="text-stone-900">{totalPages}</strong>
          </div>
          <div className="flex items-center gap-1.5">
            {/* First Page */}
            <button
              type="button"
              onClick={() => onPageChange(1)}
              disabled={currentPage <= 1 || loading}
              className="p-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              title="प्रथम पृष्ठ"
              aria-label="प्रथम पृष्ठ"
            >
              <ChevronsLeft className="w-4 h-4 text-stone-600" />
            </button>

            {/* Prev Page */}
            <button
              type="button"
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage <= 1 || loading}
              className="px-3 py-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1 transition-colors"
              aria-label="पिछला पृष्ठ"
            >
              <ChevronLeft className="w-4 h-4 text-stone-600" />
              <span>पिछला</span>
            </button>

            {/* Next Page */}
            <button
              type="button"
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage >= totalPages || loading}
              className="px-3 py-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1 transition-colors"
              aria-label="अगला पृष्ठ"
            >
              <span>अगला</span>
              <ChevronRight className="w-4 h-4 text-stone-600" />
            </button>

            {/* Last Page */}
            <button
              type="button"
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage >= totalPages || loading}
              className="p-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              title="अंतिम पृष्ठ"
              aria-label="अंतिम पृष्ठ"
            >
              <ChevronsRight className="w-4 h-4 text-stone-600" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
