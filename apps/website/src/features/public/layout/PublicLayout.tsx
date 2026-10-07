import React, { useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  Smartphone,
  ShieldCheck,
  FileText,
  Mail,
  Home,
  Lock,
  ChevronRight,
  Heart,
} from 'lucide-react';
import { SITE_CONFIG } from '../../../config/siteConfig';

export const PublicLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { label: 'गृह (Home)', path: '/' },
    { label: 'परिचय (About)', path: '/about' },
    { label: 'मोबाइल ऐप (Mobile App)', path: '/mobile-app' },
    { label: 'संपर्क (Contact)', path: '/contact' },
    { label: 'गोपनीयता नीति (Privacy)', path: '/privacy-policy' },
    { label: 'नियम व शर्तें (Terms)', path: '/terms' },
  ];

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF7] text-stone-900 font-sans selection:bg-amber-600 selection:text-white">
      {/* Top Banner */}
      <div className="bg-amber-700 text-amber-50 text-xs py-1.5 px-4 text-center font-medium tracking-wide">
        <span>॥ जय गुरु ॥ संतमत सत्संग प्रचार की आधिकारिक संस्था वेबसाइट (Official Organization Website)</span>
      </div>

      {/* Main Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo / Brand */}
            <Link
              to="/"
              className="flex items-center gap-3.5 group focus:outline-none"
              onClick={closeMobileMenu}
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center text-white font-bold text-xl shadow-md shadow-amber-600/20 group-hover:scale-105 transition-transform duration-200">
                ॐ
              </div>
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-stone-900 group-hover:text-amber-700 transition-colors">
                  {SITE_CONFIG.orgNameHindi}
                </span>
                <span className="text-[11px] sm:text-xs font-bold tracking-widest text-amber-700 uppercase">
                  {SITE_CONFIG.orgName}
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
              {navLinks.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors duration-150 ${
                      isActive
                        ? 'bg-amber-50 text-amber-800 font-bold'
                        : 'text-stone-700 hover:text-amber-700 hover:bg-stone-50'
                    }`}
                  >
                    {item.label}
                  </NavLink>
                );
              })}
            </nav>

            {/* App CTA Button (Desktop) */}
            <div className="hidden sm:flex items-center gap-3">
              <Link
                to="/mobile-app"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-amber-600/20 transition-all hover:shadow-lg active:scale-95"
              >
                <Smartphone className="w-4 h-4" />
                <span>मोबाइल ऐप</span>
                <span className="bg-amber-800/80 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-semibold">
                  शीघ्र उपलब्ध
                </span>
              </Link>
            </div>

            {/* Mobile Hamburger Button */}
            <div className="flex lg:hidden items-center">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-stone-700 hover:text-stone-900 hover:bg-stone-100 focus:outline-none"
                aria-label="मुख्य मेनू खोलें"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-stone-200 bg-white px-4 pt-3 pb-6 shadow-xl animate-in slide-in-from-top-2">
            <div className="flex flex-col gap-1">
              {navLinks.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={closeMobileMenu}
                  className={({ isActive }) =>
                    `px-4 py-3 rounded-xl text-base font-semibold flex items-center justify-between ${
                      isActive
                        ? 'bg-amber-50 text-amber-800 font-bold'
                        : 'text-stone-700 hover:bg-stone-50'
                    }`
                  }
                >
                  <span>{item.label}</span>
                  <ChevronRight className="w-4 h-4 text-stone-400" />
                </NavLink>
              ))}

              <div className="mt-4 pt-4 border-t border-stone-100 flex flex-col gap-2">
                <Link
                  to="/mobile-app"
                  onClick={closeMobileMenu}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-amber-600 text-white font-bold shadow-md"
                >
                  <Smartphone className="w-5 h-5" />
                  <span>आधिकारिक मोबाइल ऐप देखें (Coming Soon)</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Render Area */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-300 pt-16 pb-12 border-t border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 pb-12 border-b border-stone-800">
            {/* Col 1: Identity & Hierarchy */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-600 flex items-center justify-center text-white font-bold text-lg">
                  ॐ
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg leading-tight">
                    {SITE_CONFIG.orgNameHindi}
                  </h3>
                  <p className="text-xs font-semibold text-amber-400 tracking-wider">
                    {SITE_CONFIG.orgName}
                  </p>
                </div>
              </div>
              <p className="text-xs text-stone-400 leading-relaxed">
                {SITE_CONFIG.orgTagline}
              </p>

              {/* Hierarchy Box */}
              <div className="p-3.5 rounded-xl bg-stone-800/80 border border-stone-700/60 text-xs">
                <div className="font-bold text-stone-200 mb-2 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>आधिकारिक संरचना (Official Hierarchy)</span>
                </div>
                <div className="space-y-1 font-mono text-[11px] text-stone-400">
                  <div className="text-amber-300 font-bold">{SITE_CONFIG.orgName}</div>
                  <div className="text-stone-500 pl-2">↓ Official Organization Website</div>
                  <div className="text-amber-200 pl-4">santmatsatsangparchar.in</div>
                  <div className="text-stone-500 pl-6">↓ Official Mobile Application</div>
                  <div className="text-stone-300 pl-8 font-sans font-medium">Santmat Satsang Prachar (Coming Soon)</div>
                </div>
              </div>
            </div>

            {/* Col 2: Canonical Public Links */}
            <div>
              <h4 className="text-white font-bold text-sm tracking-wider uppercase mb-4 flex items-center gap-2">
                <Home className="w-4 h-4 text-amber-400" />
                <span>मुख्य पृष्ठ (Public Navigation)</span>
              </h4>
              <ul className="space-y-2.5 text-xs">
                <li>
                  <Link to="/" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
                    <ChevronRight className="w-3.5 h-3.5 text-stone-500" />
                    <span>मुख्य पृष्ठ (Homepage)</span>
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
                    <ChevronRight className="w-3.5 h-3.5 text-stone-500" />
                    <span>संस्था परिचय (About Us)</span>
                  </Link>
                </li>
                <li>
                  <Link to="/mobile-app" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
                    <ChevronRight className="w-3.5 h-3.5 text-stone-500" />
                    <span>आधिकारिक मोबाइल ऐप (Mobile App)</span>
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
                    <ChevronRight className="w-3.5 h-3.5 text-stone-500" />
                    <span>संपर्क सूत्र (Contact Us)</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 3: Legal & Privacy */}
            <div>
              <h4 className="text-white font-bold text-sm tracking-wider uppercase mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                <span>वैधानिक एवं नीतियां (Legal & Policies)</span>
              </h4>
              <ul className="space-y-2.5 text-xs">
                <li>
                  <Link to="/privacy-policy" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
                    <ChevronRight className="w-3.5 h-3.5 text-stone-500" />
                    <span>गोपनीयता नीति (Privacy Policy)</span>
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
                    <ChevronRight className="w-3.5 h-3.5 text-stone-500" />
                    <span>नियम एवं शर्तें (Terms & Conditions)</span>
                  </Link>
                </li>
                <li>
                  <Link to="/delete-account" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
                    <ChevronRight className="w-3.5 h-3.5 text-stone-500" />
                    <span>खाता विलोपन (Account Deletion)</span>
                  </Link>
                </li>
              </ul>
              <div className="mt-4 p-3 rounded-lg bg-stone-800 text-[11px] text-stone-400 leading-relaxed">
                <span>Google Play Store नीति के पूर्ण अनुपालन में सभी वैधानिक नीतियां सार्वजनिक डोमेन पर उपलब्ध हैं।</span>
              </div>
            </div>

            {/* Col 4: Contact & Identity */}
            <div>
              <h4 className="text-white font-bold text-sm tracking-wider uppercase mb-4 flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-400" />
                <span>संपर्क एवं सेवा (Contact)</span>
              </h4>
              <div className="space-y-3 text-xs text-stone-400">
                <p>
                  <strong className="text-stone-300 block mb-0.5">ईमेल (Email):</strong>
                  <a
                    href={`mailto:${SITE_CONFIG.contactEmail}`}
                    className="text-amber-400 hover:underline"
                  >
                    {SITE_CONFIG.contactEmail}
                  </a>
                </p>
                <p>
                  <strong className="text-stone-300 block mb-0.5">आधिकारिक वेबसाइट:</strong>
                  <span className="text-stone-200 font-mono text-[11px]">
                    https://santmatsatsangparchar.in
                  </span>
                </p>
                <p>
                  <strong className="text-stone-300 block mb-0.5">मुख्यालय (Headquarters):</strong>
                  <span>{SITE_CONFIG.ashramHeadquarters}</span>
                </p>
              </div>

              {/* Administrative Portal Link (same origin, full page navigation) */}
              <div className="mt-5 pt-4 border-t border-stone-800">
                <a
                  href={SITE_CONFIG.routes.adminLogin}
                  className="inline-flex items-center gap-1.5 text-stone-400 hover:text-stone-200 text-[11px] transition-colors"
                >
                  <Lock className="w-3 h-3 text-stone-500" />
                  <span>प्रशासक लॉगिन (Admin Portal)</span>
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
            <div>
              &copy; {new Date().getFullYear()} {SITE_CONFIG.orgName}. सर्वाधिकार सुरक्षित (All Rights Reserved).
            </div>
            <div className="flex items-center gap-1 text-[11px]">
              <span>समर्पित सेवा भाव से निर्मित</span>
              <Heart className="w-3.5 h-3.5 text-amber-600 fill-amber-600" />
              <span>Santmat Devotees</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
