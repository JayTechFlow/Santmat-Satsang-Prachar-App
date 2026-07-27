import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Image as ImageIcon, 
  Quote, 
  Music, 
  Video, 
  Book,
  Bell 
} from 'lucide-react';

const navItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/banners', label: 'Banners', icon: ImageIcon },
  { path: '/quotes', label: 'Quotes', icon: Quote },
  { path: '/audio', label: 'Audio', icon: Music },
  { path: '/satsang', label: 'Satsang', icon: Video },
  { path: '/books', label: 'Books', icon: Book },
  { path: '/notifications', label: 'Notifications', icon: Bell },
];

export const Sidebar = () => {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-800">Admin Panel</h1>
      </div>
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};
