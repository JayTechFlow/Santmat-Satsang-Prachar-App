import React from 'react';
import { Users, Unlock, Lock, ShieldAlert, ShieldCheck, Smartphone } from 'lucide-react';
import { StatCard } from '../../dashboard/components/StatCard';
import type { UserProfile } from '../../../types/common/index';

export interface UserStatsStripProps {
  users: UserProfile[];
  loading: boolean;
}

export const UserStatsStrip: React.FC<UserStatsStripProps> = ({ users, loading }) => {
  const kpis = React.useMemo(() => {
    const list = users || [];
    return {
      total: list.length,
      active: list.filter((u) => u.accountStatus === 'active' || u.status === 'active').length,
      suspended: list.filter((u) => u.accountStatus === 'suspended' || u.status === 'suspended').length,
      devAdmins: list.filter((u) => u.role === 'developer_super_admin').length,
      clientAdmins: list.filter((u) => u.role === 'client_super_admin').length,
      mobileUsers: list.filter((u) => u.role === 'mobile_user').length,
    };
  }, [users]);

  return (
    <section aria-label="उपयोगकर्ता सांख्यिकी" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
      <StatCard
        value={kpis.total.toLocaleString('en-IN')}
        label="कुल उपयोगकर्ता"
        icon={<Users className="w-6 h-6" />}
        loading={loading}
        iconBg="bg-stone-100 border-stone-200 text-stone-600"
      />
      <StatCard
        value={kpis.active.toLocaleString('en-IN')}
        label="सक्रिय (Active)"
        icon={<Unlock className="w-6 h-6" />}
        loading={loading}
        iconBg="bg-emerald-50 border-emerald-200 text-emerald-600"
      />
      <StatCard
        value={kpis.suspended.toLocaleString('en-IN')}
        label="निलंबित (Suspended)"
        icon={<Lock className="w-6 h-6" />}
        loading={loading}
        iconBg="bg-rose-50 border-rose-200 text-rose-600"
      />
      <StatCard
        value={String(kpis.devAdmins)}
        label="डेवलपर एडमिन"
        icon={<ShieldAlert className="w-6 h-6" />}
        loading={loading}
        iconBg="bg-purple-50 border-purple-200 text-purple-600"
      />
      <StatCard
        value={String(kpis.clientAdmins)}
        label="क्लाइंट एडमिन"
        icon={<ShieldCheck className="w-6 h-6" />}
        loading={loading}
        iconBg="bg-amber-50 border-amber-200 text-amber-600"
      />
      <StatCard
        value={kpis.mobileUsers.toLocaleString('en-IN')}
        label="मोबाइल उपभोक्ता"
        icon={<Smartphone className="w-6 h-6" />}
        loading={loading}
        iconBg="bg-stone-100 border-stone-200 text-stone-500"
      />
    </section>
  );
};
