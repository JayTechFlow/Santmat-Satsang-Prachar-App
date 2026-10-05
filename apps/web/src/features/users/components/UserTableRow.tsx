import React, { useState } from 'react';
import {
  Mail, Copy, Check, Shield, ShieldAlert, ShieldCheck,
  Users, Lock, Unlock, Eye, Edit3, UserX, Clock, Phone, MapPin
} from 'lucide-react';
import type { UserProfile, UserRole } from '../../../types/common/index';
import { UserAvatar } from '../../../components/shared/UserAvatar';

export const ROLE_CONFIG: Record<
  UserRole,
  { label: string; labelEn: string; badgeClass: string; icon: React.FC<{ className?: string }> }
> = {
  developer_super_admin: {
    label: 'डेवलपर सुपर एडमिन',
    labelEn: 'Developer Super Admin',
    badgeClass: 'bg-purple-50 text-purple-800 border-purple-200',
    icon: ShieldAlert,
  },
  client_super_admin: {
    label: 'क्लाइंट एडमिन',
    labelEn: 'Client Super Admin',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
    icon: ShieldCheck,
  },
  mobile_user: {
    label: 'सत्संगी भक्त',
    labelEn: 'Mobile User',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    icon: Users,
  },
};

export interface UserTableRowProps {
  user: UserProfile;
  isSelf: boolean;
  isDeveloperSuperAdmin: boolean;
  isClientSuperAdmin: boolean;
  onViewDetails: (user: UserProfile) => void;
  onEditProfile: (user: UserProfile) => void;
  onChangeRole: (user: UserProfile) => void;
  onToggleStatus: (user: UserProfile) => void;
  onPermanentDelete: (user: UserProfile) => void;
}

export const UserTableRow: React.FC<UserTableRowProps> = ({
  user,
  isSelf,
  isDeveloperSuperAdmin,
  isClientSuperAdmin,
  onViewDetails,
  onEditProfile,
  onChangeRole,
  onToggleStatus,
  onPermanentDelete,
}) => {
  const [copiedUid, setCopiedUid] = useState(false);

  const roleMeta = ROLE_CONFIG[user.role] || ROLE_CONFIG.mobile_user;
  const RoleIcon = roleMeta.icon;

  const isSuspended = user.accountStatus === 'suspended' || user.status === 'suspended';
  const canManage = isDeveloperSuperAdmin || (isClientSuperAdmin && user.role !== 'developer_super_admin');

  const handleCopyUid = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(user.uid);
    setCopiedUid(true);
    setTimeout(() => setCopiedUid(false), 2000);
  };

  const formatDateTime = (isoString?: string) => {
    if (!isoString) return '—';
    try {
      return new Date(isoString).toLocaleDateString('hi-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return '—';
    }
  };

  return (
    <tr
      className="hover:bg-stone-50/80 transition-colors group cursor-pointer border-b border-stone-100 last:border-0"
      onClick={() => onViewDetails(user)}
      tabIndex={0}
      role="row"
      aria-label={`${user.displayName || user.email} विवरण`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onViewDetails(user);
        }
      }}
    >
      {/* 1. Identity */}
      <td className="py-3.5 px-4">
        <div className="flex items-center gap-3">
          <UserAvatar
            avatarUrl={user.photoURL}
            displayName={user.displayName}
            email={user.email}
            size={40}
            className="shrink-0 ring-1 ring-stone-200"
          />
          <div className="min-w-0">
            <h4 className="font-extrabold text-stone-900 text-xs truncate flex items-center gap-1.5">
              <span>{user.displayName || 'अनाम भक्त'}</span>
              {isSelf && (
                <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded text-[0.6rem] font-black shrink-0">
                  आप
                </span>
              )}
            </h4>
            <p className="text-[0.68rem] text-stone-500 truncate sm:hidden">{user.email || '—'}</p>
            {user.city && (
              <p className="text-[0.68rem] text-stone-500 truncate hidden sm:flex items-center gap-1">
                <MapPin className="w-2.5 h-2.5 text-stone-400 shrink-0" />
                <span>{user.city}</span>
              </p>
            )}
          </div>
        </div>
      </td>

      {/* 2. Contact & UID */}
      <td className="py-3.5 px-4 hidden sm:table-cell">
        <div className="space-y-0.5">
          <div className="font-semibold text-stone-900 flex items-center gap-1">
            <Mail className="w-3 h-3 text-stone-400 shrink-0" />
            <span className="truncate max-w-[200px] text-xs">{user.email || '—'}</span>
          </div>
          {user.phone && (
            <div className="flex items-center gap-1 text-[0.68rem] text-stone-600 font-medium">
              <Phone className="w-2.5 h-2.5 text-stone-400 shrink-0" />
              <span>{user.phone}</span>
            </div>
          )}
          <div className="flex items-center gap-1 text-[0.65rem] text-stone-400 font-mono">
            <span>{user.uid.slice(0, 12)}…</span>
            <button
              type="button"
              onClick={handleCopyUid}
              className="hover:text-stone-700 p-0.5 rounded cursor-pointer transition-colors"
              title={copiedUid ? 'कॉपी हो गया' : 'UID कॉपी करें'}
              aria-label="UID कॉपी करें"
            >
              {copiedUid ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
        </div>
      </td>

      {/* 3. Role */}
      <td className="py-3.5 px-4">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[0.68rem] font-extrabold ${roleMeta.badgeClass}`}>
          <RoleIcon className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden lg:inline">{roleMeta.label}</span>
          <span className="lg:hidden">{roleMeta.label.split(' ')[0]}</span>
        </span>
      </td>

      {/* 4. Status */}
      <td className="py-3.5 px-4">
        {isSuspended ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-[0.68rem] font-black">
            <Lock className="w-3 h-3 shrink-0" />
            <span>निलंबित</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[0.68rem] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
            <span>सक्रिय</span>
          </span>
        )}
      </td>

      {/* 5. Dates (Registration & Last Active) */}
      <td className="py-3.5 px-4 hidden md:table-cell">
        <div className="space-y-0.5 text-xs text-stone-600">
          <div className="font-medium text-stone-800 flex items-center gap-1">
            <span className="text-[0.65rem] text-stone-400">पंजीकरण:</span>
            <span>{formatDateTime(user.createdAt)}</span>
          </div>
          <div className="text-[0.65rem] text-stone-500 flex items-center gap-1">
            <Clock className="w-2.5 h-2.5 text-stone-400 shrink-0" />
            <span>सक्रिय: {user.lastActiveAt ? formatDateTime(user.lastActiveAt) : 'अनुपलब्ध'}</span>
          </div>
        </div>
      </td>

      {/* 6. Actions */}
      <td className="py-3.5 px-4 text-right">
        <div className="inline-flex items-center gap-1.5 justify-end" onClick={(e) => e.stopPropagation()}>
          {/* View Details */}
          <button
            type="button"
            onClick={() => onViewDetails(user)}
            className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer"
            title="विवरण देखें"
            aria-label={`${user.displayName || user.email} विवरण देखें`}
          >
            <Eye className="w-3.5 h-3.5" />
          </button>

          {/* Edit Profile */}
          {(isDeveloperSuperAdmin || isClientSuperAdmin) && (
            <button
              type="button"
              onClick={() => onEditProfile(user)}
              className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer"
              title="प्रोफ़ाइल संपादित करें"
              aria-label={`${user.displayName || user.email} संपादित करें`}
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Change Role & Suspend (Management actions) */}
          {canManage && !isSelf && (
            <>
              <button
                type="button"
                onClick={() => onChangeRole(user)}
                className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition-colors cursor-pointer"
                title="रोल बदलें"
                aria-label={`${user.displayName || user.email} का रोल बदलें`}
              >
                <Shield className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onToggleStatus(user)}
                className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                  isSuspended
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                    : 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
                }`}
                title={isSuspended ? 'पुनः सक्रिय करें' : 'खाता निलंबित करें'}
                aria-label={`${user.displayName || user.email} ${isSuspended ? 'पुनः सक्रिय करें' : 'निलंबित करें'}`}
              >
                {isSuspended ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
              </button>
            </>
          )}

          {/* Permanent Delete (Developer Super Admin only) */}
          {isDeveloperSuperAdmin && !isSelf && (
            <button
              type="button"
              onClick={() => onPermanentDelete(user)}
              className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition-colors cursor-pointer"
              title="स्थायी रूप से हटाएं (Developer Super Admin Only)"
              aria-label={`${user.displayName || user.email} को स्थायी रूप से हटाएं`}
            >
              <UserX className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};
