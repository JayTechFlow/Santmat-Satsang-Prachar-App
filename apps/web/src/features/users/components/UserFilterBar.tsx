import React from 'react';
import { Search, X, RotateCcw } from 'lucide-react';
import type { UserRole, UserAccountStatus } from '../../../types/common/index';

export type UserSortOption = 'newest' | 'oldest' | 'name' | 'lastActive';

export interface UserFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  roleFilter: 'all' | UserRole;
  onRoleFilterChange: (role: 'all' | UserRole) => void;
  statusFilter: 'all' | UserAccountStatus;
  onStatusFilterChange: (status: 'all' | UserAccountStatus) => void;
  sortBy: UserSortOption;
  onSortByChange: (sort: UserSortOption) => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
}

export const UserFilterBar: React.FC<UserFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  statusFilter,
  onStatusFilterChange,
  sortBy,
  onSortByChange,
  onResetFilters,
  hasActiveFilters,
}) => {
  return (
    <section
      aria-label="खोज एवं फ़िल्टर"
      className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between"
    >
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="नाम, ईमेल, UID, फोन या शहर द्वारा खोजें…"
          aria-label="उपयोगकर्ता खोजें"
          className="admin-input pl-10 pr-9 text-xs"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer p-0.5"
            aria-label="खोज साफ़ करें"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Filter Selects */}
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={roleFilter}
          onChange={(e) => onRoleFilterChange(e.target.value as 'all' | UserRole)}
          aria-label="रोल फ़िल्टर"
          className="admin-select text-xs font-semibold"
        >
          <option value="all">सभी रोल्स (All Roles)</option>
          <option value="developer_super_admin">Developer Super Admin</option>
          <option value="client_super_admin">Client Super Admin</option>
          <option value="mobile_user">Mobile User (सत्संगी भक्त)</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value as 'all' | UserAccountStatus)}
          aria-label="स्थिति फ़िल्टर"
          className="admin-select text-xs font-semibold"
        >
          <option value="all">सभी स्थितियाँ (All Status)</option>
          <option value="active">सक्रिय (Active)</option>
          <option value="suspended">निलंबित (Suspended)</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => onSortByChange(e.target.value as UserSortOption)}
          aria-label="क्रमबद्ध करें"
          className="admin-select text-xs font-semibold"
        >
          <option value="newest">नवीनतम पंजीकरण (Newest)</option>
          <option value="oldest">पुरातन पंजीकरण (Oldest)</option>
          <option value="name">नाम (A-Z)</option>
          <option value="lastActive">हाल ही में सक्रिय (Last Active)</option>
        </select>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            title="सभी फ़िल्टर रीसेट करें"
          >
            <RotateCcw className="w-3 h-3 text-stone-500" />
            <span>रीसेट</span>
          </button>
        )}
      </div>
    </section>
  );
};
