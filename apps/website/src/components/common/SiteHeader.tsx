import React, { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X, Radio, Smartphone, ChevronRight } from 'lucide-react';
import { SITE_CONFIG } from '../../config/siteConfig';

export const SiteHeader: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { label: 'Home', path: SITE_CONFIG.routes.home },
    { label: 'About Us', path: SITE_CONFIG.routes.about },
    { label: 'Services', path: SITE_CONFIG.routes.services },
    { label: 'Mobile App', path: SITE_CONFIG.routes.mobileApp },
    { label: 'Contact Us', path: SITE_CONFIG.routes.contact },
    { label: 'Privacy Policy', path: SITE_CONFIG.routes.privacyPolicy },
  ];

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <>
      {/* Top Corporate Status Bar */}
      <div className="bg-stone-900 text-stone-300 text-[11px] py-1.5 px-4 text-center font-medium tracking-wide border-b border-stone-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <span className="hidden sm:inline">
            Official Business Website • {SITE_CONFIG.legalEntityName} ({SITE_CONFIG.businessStructure})
          </span>
          <span className="sm:hidden mx-auto font-mono text-[10px]">
            {SITE_CONFIG.legalEntityName}
          </span>
          <div className="hidden sm:flex items-center gap-4 text-stone-400">
            <span>Udyam: {SITE_CONFIG.udyamRegistrationNumber}</span>
            <span>•</span>
            <span>GSTIN: {SITE_CONFIG.gstin}</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Business Brand Identity */}
            <Link
              to="/"
              className="flex items-center gap-3 group focus:outline-none"
              onClick={closeMobileMenu}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-stone-900 to-stone-800 flex items-center justify-center text-amber-500 shadow-xs group-hover:scale-105 transition-transform duration-200">
                <Radio className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-base sm:text-lg font-extrabold tracking-tight text-stone-900 group-hover:text-amber-800 transition-colors">
                  {SITE_CONFIG.legalEntityName}
                </span>
                <span className="text-[10px] sm:text-[11px] font-semibold tracking-wider text-stone-500 uppercase">
                  {SITE_CONFIG.businessStructure} • Digital Media & Publishing
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
                    className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors duration-150 ${
                      isActive
                        ? 'bg-stone-100 text-stone-900 font-bold'
                        : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                    }`}
                  >
                    {item.label}
                  </NavLink>
                );
              })}
            </nav>

            {/* Header Right Action (Mobile App CTA) */}
            <div className="hidden sm:flex items-center gap-3">
              <Link
                to="/mobile-app"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow-xs transition-all active:scale-95"
              >
                <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                <span>Mobile App</span>
                <span className="bg-stone-700 text-[10px] px-1.5 py-0.5 rounded text-amber-300">
                  Coming Soon
                </span>
              </Link>
            </div>

            {/* Mobile Hamburger Button */}
            <div className="flex lg:hidden items-center">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-stone-700 hover:text-stone-900 hover:bg-stone-100 focus:outline-none"
                aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
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
                    `px-4 py-3 rounded-xl text-sm font-semibold flex items-center justify-between ${
                      isActive
                        ? 'bg-stone-100 text-stone-900 font-bold'
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
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-stone-900 text-white text-xs font-bold shadow-xs"
                >
                  <Smartphone className="w-4 h-4 text-amber-400" />
                  <span>Explore Mobile App (Coming Soon)</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
