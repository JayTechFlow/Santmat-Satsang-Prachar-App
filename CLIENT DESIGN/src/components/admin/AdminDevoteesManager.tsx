/**
 * ============================================================================
 * Santmat Satsang Prachar - Devotee Activity & Sadhana Analytics (Admin)
 * ============================================================================
 * Overview of devotee engagement, daily sadhana completion rates, top devotional
 * regions across India/Nepal, and user-curated devotional playlists.
 */
import React, { useState, useMemo } from 'react';
import {
  Users,
  ListMusic,
  MapPin,
  Music,
  TrendingUp,
  Search,
  Filter,
  Shield,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useUsers } from '../../hooks/useUsers';
import { UserProfile, UserRole } from '../../types';

export const AdminDevoteesManager: React.FC = () => {
  const { playlists, setAdminTab } = useApp();
  const { users: backendUsers, loading: usersLoading, error: usersError, updateUserRole, updateUserStatus } = useUsers();
  const [searchFilter, setSearchFilter] = useState('');

  const [userActionSuccess, setUserActionSuccess] = useState<string | null>(null);
  const [userActionStatus, setUserActionStatus] = useState<string | null>(null);

  const handleToggleUserStatus = async (user: UserProfile) => {
    try {
      const nextStatus = user.accountStatus === 'active' ? 'suspended' : 'active';
      const res = await updateUserStatus(user.uid, nextStatus);
      if (res.success) {
        setUserActionSuccess(`स्टेटस अपडेट: ${user.displayName} → ${nextStatus === 'active' ? 'सक्रिय' : 'निलंबित'}`);
        setTimeout(() => setUserActionSuccess(null), 4000);
      } else {
        console.warn('Status update failed:', res.error);
        setUserActionStatus(`त्रुटि: ${res.error || 'अज्ञात त्रुटि'}`);
      }
    } catch (err) {
      console.error('Status update exception:', err);
      setUserActionStatus(`त्रुटि: अपडेट failed`);
    }
  };

  const handleChangeRole = async (user: UserProfile, role: UserRole) => {
    try {
      const res = await updateUserRole(user.uid, role);
      if (res.success) {
        setUserActionSuccess(`रोल अपडेट: ${user.displayName} → ${role}`);
        setTimeout(() => setUserActionSuccess(null), 4000);
      } else {
        console.warn('Role update failed:', res.error);
        setUserActionStatus(`त्रुटि: ${res.error || 'अज्ञात त्रुटि'}`);
      }
    } catch (err) {
      console.error('Role update exception:', err);
      setUserActionStatus(`त्रुटि: अपडेट failed`);
    }
  };

  const ROLE_LABELS: Record<UserRole, string> = {
    developer_super_admin: 'डेवलपर सुपर एडमिन',
    client_super_admin: 'क्लाइंट एडमिन',
    mobile_user: 'मोबाइल यूज़र',
  };

  // Real regional distribution computed from the live users collection
  const regionData = useMemo(() => {
    const usersList = backendUsers || [];
    const byRegion = new Map<string, { count: number; centers: Set<string> }>();
    usersList.forEach((u) => {
      const region = u.city || 'अन्य / अनिर्दिष्ट';
      if (!byRegion.has(region)) byRegion.set(region, { count: 0, centers: new Set() });
      const entry = byRegion.get(region)!;
      entry.count += 1;
      if (u.dikshaGuru) entry.centers.add(u.dikshaGuru);
    });
    const total = usersList.length || 1;
    return Array.from(byRegion.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 6)
      .map(([state, entry]) => ({
        state,
        devotees: String(entry.count),
        percent: Math.round((entry.count / total) * 100),
        topCenter: entry.centers.size ? Array.from(entry.centers).slice(0, 2).join(' • ') : 'उपलब्ध नहीं',
      }));
  }, [backendUsers]);

  const filteredDevotees = backendUsers.filter((d) => {
    const q = searchFilter.toLowerCase();
    return (
      d.displayName.toLowerCase().includes(q) ||
      (d.email || '').toLowerCase().includes(q) ||
      (d.city || '').toLowerCase().includes(q)
    );
  });

  const activeUsers = backendUsers.filter((u) => u.accountStatus === 'active').length;
  const adminUsers = backendUsers.filter((u) => u.role !== 'mobile_user').length;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto font-['Mukta'] select-none">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-emerald-950 via-teal-950 to-stone-900 p-6 rounded-3xl text-white shadow-md">
        <div>
          <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" />
            <span>साधना एवं भक्त समुदाय प्रबंधन</span>
          </div>
          <h1 className="text-2xl font-extrabold">सत्संगी भक्त एवं साधना सांख्यिकी</h1>
          <p className="text-stone-300 text-sm mt-1 max-w-2xl">
            यहाँ से आप पंजीकृत सत्संगी भक्तों की साधना प्रगति, दैनिक स्तुति निरंतरता (Streak), क्षेत्रीय वितरण एवं बनाई गई भजन प्लेलिस्ट्स का अवलोकन कर सकते हैं।
          </p>
        </div>

        {/* View Switcher & Actions */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => setAdminTab('playlists')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-black/40 backdrop-blur-md text-stone-200 hover:text-white rounded-xl text-xs font-extrabold shadow-sm transition-all cursor-pointer"
          >
            <ListMusic className="w-4 h-4" />
            <span>प्लेलिस्ट्स ({playlists.length}) →</span>
          </button>
          <button
            type="button"
            disabled
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white/10 text-stone-300 rounded-xl text-xs font-bold"
            title="नया प्रमाणित उपयोगकर्ता सृजन केवल सुरक्षित पहचान सेवा (Firebase Auth / Admin SDK) द्वारा किया जाता है"
          >
            <Shield className="w-4 h-4" />
            <span>उपयोगकर्ता सृजन: सुरक्षित सेवा द्वारा (स्वयं साइन-अप / निमंत्रण)</span>
          </button>
        </div>
      </div>

      {/* 4 Stats Cards (Real Backend Data) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold text-stone-500">कुल पंजीकृत सत्संगी</p>
            <h3 className="font-extrabold text-2xl text-stone-900">
              {usersLoading ? '…' : backendUsers.length.toLocaleString('en-IN')}
            </h3>
            <span className="text-xs font-bold text-emerald-700">
              {backendUsers.length > 0 ? `${activeUsers} सक्रिय भक्त` : 'डेटा लोड हो रहा है'}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold text-stone-500">एडमिन उपयोगकर्ता (RBAC)</p>
            <h3 className="font-extrabold text-2xl text-stone-900">
              {usersLoading ? '…' : adminUsers}
            </h3>
            <span className="text-xs font-bold text-amber-700">
              developer / client super admin
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center">
            <Shield className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold text-stone-500">डेटा स्थिति</p>
            <h3 className="font-extrabold text-2xl text-stone-900">
              {usersError ? 'त्रुटि' : usersLoading ? '…' : 'सिंक'}
            </h3>
            <span className="text-xs font-bold text-purple-700">
              {usersError ? usersError : 'लाइव Firestore से'}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold text-stone-500">भक्तों द्वारा सृजित प्लेलिस्ट्स</p>
            <h3 className="font-extrabold text-2xl text-stone-900">{playlists.length}</h3>
            <span className="text-xs font-bold text-blue-700">भजन संग्रह</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center">
            <ListMusic className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Devotees & Regional Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Devotee List (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
              <h2 className="text-base font-extrabold text-stone-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-700" />
                <span>सत्संगी भक्त सूची (Devotees List)</span>
              </h2>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="नाम या शहर से खोजें..."
                  className="pl-8 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="space-y-3">
              {filteredDevotees.map((devotee) => (
                <div
                  key={devotee.uid}
                  className="p-4 rounded-2xl bg-stone-50/70 border border-stone-200/80 hover:bg-stone-50 transition-colors flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white font-black flex items-center justify-center text-sm shadow-xs shrink-0">
                      {(devotee.displayName || devotee.email || 'सा').charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-extrabold text-xs text-stone-900 truncate">
                        {devotee.displayName}
                      </h4>
                      <p className="text-[0.68rem] text-stone-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-stone-400" />
                        <span>{devotee.city || devotee.email || 'स्थान अनिर्दिष्ट'}</span>
                      </p>
                      <p className="text-[0.65rem] text-amber-800 font-semibold mt-0.5 truncate">
                        {devotee.role === 'mobile_user' ? 'मोबाइल यूज़र' : devotee.role}
                        {devotee.accountStatus === 'suspended' && (
                          <span className="text-red-600 ml-1.5">• निलंबित</span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <select
                      value={devotee.role}
                      onChange={(e) => handleChangeRole(devotee, e.target.value as UserRole)}
                      className="bg-amber-50 border border-amber-200 px-2 py-1.5 rounded-xl text-[0.68rem] font-bold text-amber-900 focus:outline-none focus:border-amber-500"
                      title="अनुमति रोल बदलें"
                    >
                      <option value="mobile_user">mobile_user</option>
                      <option value="client_super_admin">client_super_admin</option>
                      <option value="developer_super_admin">developer_super_admin</option>
                    </select>
                    <button
                      onClick={() => handleToggleUserStatus(devotee)}
                      className={`px-2.5 py-1.5 rounded-xl text-[0.68rem] font-bold border transition-colors ${
                        devotee.accountStatus === 'suspended'
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                          : 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100'
                      }`}
                    >
                      {devotee.accountStatus === 'suspended' ? 'पुनः सक्रिय' : 'निलंबित'}
                    </button>
                  </div>
                </div>
              ))}
              {filteredDevotees.length === 0 && (
                <div className="py-10 text-center text-stone-400 font-['Mukta'] space-y-2">
                  <Users className="w-10 h-10 mx-auto text-stone-300" />
                  <p className="text-sm">कोई पंजीकृत भक्त नहीं मिला</p>
                  {usersLoading && <p className="text-xs text-stone-400">लोड हो रहा है…</p>}
                  {usersError && <p className="text-xs text-red-500">{usersError}</p>}
                </div>
              )}
            </div>
          </div>

          {/* Regional Satsang Centers (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
            <h2 className="text-base font-extrabold text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-3">
              <MapPin className="w-5 h-5 text-amber-700" />
              <span>सत्संग क्षेत्र एवं मंडल वितरण</span>
            </h2>

            <div className="space-y-4">
              {regionData.map((item, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-stone-800">{item.state}</span>
                    <span className="text-amber-900 font-extrabold">{item.devotees} ({item.percent}%)</span>
                  </div>
                  <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-orange-600 rounded-full"
                      style={{ width: `${item.percent}%` }}
                    />
                  </div>
                  <p className="text-[0.65rem] text-stone-500">{item.topCenter}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

      {/* User Action Feedback Toast */}
      {userActionSuccess && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-emerald-500/30 text-xs font-bold flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{userActionSuccess}</span>
        </div>
      )}
    </div>
  );
};
