import React, { useState } from 'react';
import {
  LayoutDashboard,
  Music,
  BookOpen,
  FolderTree,
  Users,
  ListMusic,
  Bell,
  Image,
  BarChart3,
  Settings,
  MessageSquare,
  LogOut,
  ChevronDown,
  ChevronRight,
  PlusCircle,
  List,
  BookMarked,
  Search,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { usePermissions } from '../../context/PermissionContext';
import { NavLink } from 'react-router-dom';
import { AdminTab } from '../../types';
import { DiyaIcon } from '../shared/DevotionalIcons';

export const AdminSidebar: React.FC = () => {
  const { adminTab, setAdminTab } = useApp();
  const { logout } = usePermissions();
  const [bhajanMenuOpen, setBhajanMenuOpen] = useState(true);
  const [stutiMenuOpen, setStutiMenuOpen] = useState(false);

  return (
    <aside className="w-64 bg-white border-r border-stone-200 flex flex-col h-full select-none shrink-0">
      {/* Top Logo & Title */}
      <div className="p-4 border-b border-stone-200 flex items-center gap-3">
        <div className="p-1.5 rounded-lg bg-amber-50 border border-amber-200">
          <DiyaIcon className="w-7 h-7" />
        </div>
        <div>
          <h2 className="font-['Mukta'] font-extrabold text-stone-900 text-base leading-tight">
            संतमत सत्संग प्रचार
          </h2>
          <span className="font-['Mukta'] text-xs font-semibold text-amber-800">
            एडमिन पैनल
          </span>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1 text-sm font-['Mukta']">
        {/* Dashboard */}
        <NavLink
          to="/admin"
          className={
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold transition-all text-stone-700 hover:bg-stone-100'
          }
          style={{
            color: adminTab === 'dashboard' ? '#EA580C' : 'inherit',
            fontWeight: adminTab === 'dashboard' ? 'bold' : 'normal',
          }}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>डैशबोर्ड</span>
        </NavLink>

        {/* Bhajan Management (Expandable) */}
        <div>
          <button
            onClick={() => setBhajanMenuOpen(!bhajanMenuOpen)}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold transition-all ${
              adminTab === 'add_bhajan' || adminTab === 'bhajan_list'
                ? 'text-amber-800 bg-amber-50'
                : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <Music className="w-4 h-4" />
              <span>भजन प्रबंधन</span>
            </div>
            {bhajanMenuOpen ? (
              <ChevronDown className="w-4 h-4 text-stone-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-stone-400" />
            )}
          </button>

          {bhajanMenuOpen && (
            <div className="pl-6 pt-1 space-y-1">
              <NavLink
                to="/admin/add-bhajan"
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                  adminTab === 'add_bhajan' ? 'bg-[#EA580C] text-white shadow-xs' : 'text-stone-600 hover:bg-stone-100'
                }`}
                style={{
                  color: adminTab === 'add_bhajan' ? 'white' : 'inherit',
                }}
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>नया भजन जोड़ें</span>
              </NavLink>

              <NavLink
                to="/admin/bhajan-list"
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                  adminTab === 'bhajan_list' ? 'bg-[#EA580C] text-white shadow-xs' : 'text-stone-600 hover:bg-stone-100'
                }`}
                style={{
                  color: adminTab === 'bhajan_list' ? 'white' : 'inherit',
                }}
              >
                <List className="w-3.5 h-3.5" />
                <span>भजन सूची</span>
              </NavLink>
            </div>
          )}
        </div>

        {/* Stuti Management */}
        <NavLink
          to="/admin/stuti-vinati"
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold transition-all ${
            adminTab === 'stuti_management' ? 'bg-[#EA580C] text-white shadow-sm' : 'text-stone-700 hover:bg-stone-100'
          }`}
          style={{
            color: adminTab === 'stuti_management' ? 'white' : 'inherit',
          }}
        >
          <div className="flex items-center gap-3">
            <BookOpen className="w-4 h-4" />
            <span>स्तुति-विनती प्रबंधन</span>
          </div>
          <ChevronRight className="w-4 h-4 text-stone-400" />
        </NavLink>

        {/* Categories */}
        <NavLink
          to="/admin/categories"
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold transition-all ${
            adminTab === 'categories' ? 'bg-[#EA580C] text-white shadow-sm' : 'text-stone-700 hover:bg-stone-100'
          }`}
          style={{
            color: adminTab === 'categories' ? 'white' : 'inherit',
          }}
        >
          <FolderTree className="w-4 h-4" />
          <span>श्रेणियाँ प्रबंधन</span>
        </NavLink>

        {/* Users */}
        <NavLink
          to="/admin/users"
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold transition-all ${
            adminTab === 'users' ? 'bg-[#EA580C] text-white shadow-sm' : 'text-stone-700 hover:bg-stone-100'
          }`}
          style={{
            color: adminTab === 'users' ? 'white' : 'inherit',
            fontWeight: 'bold',
          }}
        >
          <Users className="w-4 h-4" />
          <span>उपयोगकर्ता प्रबंधन</span>
        </NavLink>

        {/* Playlists */}
        <NavLink
          to="/admin/playlists"
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold transition-all ${
            adminTab === 'playlists' ? 'bg-[#EA580C] text-white shadow-sm' : 'text-stone-700 hover:bg-stone-100'
          }`}
          style={{
            color: adminTab === 'playlists' ? 'white' : 'inherit',
          }}
        >
          <ListMusic className="w-4 h-4" />
          <span>प्ले लिस्ट प्रबंधन</span>
        </NavLink>

        {/* Notifications */}
        <NavLink
          to="/admin/notifications"
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold transition-all ${
            adminTab === 'notifications' ? 'bg-[#EA580C] text-white shadow-sm' : 'text-stone-700 hover:bg-stone-100'
          }`}
          style={{
            color: adminTab === 'notifications' ? 'white' : 'inherit',
          }}
        >
          <Bell className="w-4 h-4" />
          <span>सूचनाएँ भेजें</span>
        </NavLink>

        {/* Banners */}
        <NavLink
          to="/admin/banners"
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold transition-all ${
            adminTab === 'banners' ? 'bg-[#EA580C] text-white shadow-sm' : 'text-stone-700 hover:bg-stone-100'
          }`}
          style={{
            color: adminTab === 'banners' ? 'white' : 'inherit',
          }}
        >
          <Image className="w-4 h-4" />
          <span>बैनर प्रबंधन</span>
        </NavLink>

        {/* Reports & Analytics */}
        <NavLink
          to="/admin/reports"
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold transition-all ${
            adminTab === 'analytics' ? 'bg-[#EA580C] text-white shadow-sm' : 'text-stone-700 hover:bg-stone-100'
          }`}
          style={{
            color: adminTab === 'analytics' ? 'white' : 'inherit',
          }}
        >
          <BarChart3 className="w-4 h-4" />
          <span>रिपोर्ट और एनालिटिक्स</span>
        </NavLink>

        {/* App Settings */}
        <NavLink
          to="/admin/settings"
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold transition-all ${
            adminTab === 'settings' ? 'bg-[#EA580C] text-white shadow-sm' : 'text-stone-700 hover:bg-stone-100'
          }`}
          style={{
            color: adminTab === 'settings' ? 'white' : 'inherit',
          }}
        >
          <Settings className="w-4 h-4" />
          <span>ऐप सेटिंग्स</span>
        </NavLink>

        {/* Support */}
        <NavLink
          to="/admin/support"
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold transition-all ${
            adminTab === 'support' ? 'bg-[#EA580C] text-white shadow-sm' : 'text-stone-700 hover:bg-stone-100'
          }`}
          style={{
            color: adminTab === 'support' ? 'white' : 'inherit',
          }}
        >
          <MessageSquare className="w-4 h-4" />
          <span>समर्थन संदेश</span>
        </NavLink>

        {/* Books */}
        <NavLink
          to="/admin/books"
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold transition-all ${
            adminTab === 'books' ? 'bg-[#EA580C] text-white shadow-sm' : 'text-stone-700 hover:bg-stone-100'
          }`}
          style={{
            color: adminTab === 'books' ? 'white' : 'inherit',
          }}
        >
          <BookMarked className="w-4 h-4" />
          <span>पुस्तकें प्रबंधन</span>
        </NavLink>

        {/* Search */}
        <NavLink
          to="/admin/search"
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold transition-all ${
            adminTab === 'search' ? 'bg-[#EA580C] text-white shadow-sm' : 'text-stone-700 hover:bg-stone-100'
          }`}
          style={{
            color: adminTab === 'search' ? 'white' : 'inherit',
          }}
        >
          <Search className="w-4 h-4" />
          <span>वैश्विक खोज</span>
        </NavLink>

        {/* Log Out Admin */}
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl font-semibold text-red-600 hover:bg-red-50 transition-all"
        >
          <LogOut className="w-4 h-4 text-red-500" />
          <span>सुरक्षित लॉग आउट</span>
        </button>
      </div>

      {/* Support Info Box at bottom */}
      <div className="p-3.5 m-3 bg-[#FFFBF0] rounded-2xl border border-amber-200">
        <h4 className="font-['Mukta'] font-bold text-xs text-amber-900 mb-1">
          सहायता की आवश्यकता है?
        </h4>
        <p className="font-['Mukta'] text-[0.7rem] text-stone-600 leading-tight">
          संपर्क करें: admin@santmat.app
        </p>
        <p className="font-['Mukta'] text-[0.7rem] text-stone-600 leading-tight mt-0.5">
          +91 12345 67890
        </p>
      </div>
    </aside>
  );
};