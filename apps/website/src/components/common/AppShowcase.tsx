import React from 'react';
import { Link } from 'react-router-dom';
import {
  Smartphone,
  Headphones,
  Sliders,
  FolderTree,
  Search,
  Heart,
  Bell,
  Clock,
  Play,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { SITE_CONFIG } from '../../config/siteConfig';

export const AppShowcase: React.FC<{ detailed?: boolean }> = ({ detailed = false }) => {
  const verifiedFeatures = [
    {
      icon: Headphones,
      title: 'High-Quality Audio Streaming',
      desc: 'Crystal-clear audio streaming optimized for both low and high bandwidth networks.',
    },
    {
      icon: Sliders,
      title: 'Background Playback & Lock Screen',
      desc: 'Seamless continuous background playback with interactive lock screen and notification controls.',
    },
    {
      icon: FolderTree,
      title: 'Category-Wise Audio Catalog',
      desc: 'Structured organization across spiritual discourses, devotional bhajans, and stuti recordings.',
    },
    {
      icon: Clock,
      title: 'Sleep Timer Functionality',
      desc: 'Configurable countdown timer for peaceful night-time listening without battery drain.',
    },
    {
      icon: Search,
      title: 'Instant In-App Search',
      desc: 'Fast discovery of titles, tracks, categories, and published discourse collections.',
    },
    {
      icon: Heart,
      title: 'Favorites & Personalized Collections',
      desc: 'Save preferred tracks and access personal listening history quickly.',
    },
    {
      icon: Bell,
      title: 'Notification Alerts',
      desc: 'Timely push notifications for newly published tracks, albums, and announcements.',
    },
    {
      icon: Play,
      title: 'Advanced Audio Player',
      desc: 'Dedicated player screen with hold-to-seek, scrubbing, and speed adjustment capabilities.',
    },
  ];

  const appScreens = [
    {
      id: 'home',
      name: 'Home Screen',
      desc: 'Daily highlights, featured banners, and recently played tracks.',
      tag: 'Overview',
    },
    {
      id: 'carousel',
      name: 'Four-Banner Carousel',
      desc: 'Interactive banner carousel showcasing featured spiritual themes.',
      tag: 'Featured',
    },
    {
      id: 'audio',
      name: 'Audio Library',
      desc: 'Filterable catalog of published bhajans, discourses, and series.',
      tag: 'Catalog',
    },
    {
      id: 'stuti',
      name: 'Stuti-Vinati Section',
      desc: 'Morning and evening prayer texts alongside synchronized audio.',
      tag: 'Daily Prayers',
    },
    {
      id: 'notifications',
      name: 'Notifications Center',
      desc: 'Chronological feed of publishing updates and announcements.',
      tag: 'Updates',
    },
    {
      id: 'profile',
      name: 'Profile & Settings',
      desc: 'Account preferences, Devanagari font scaling, and data controls.',
      tag: 'Preferences',
    },
    {
      id: 'player',
      name: 'Audio Player',
      desc: 'Dedicated player interface with background audio service integration.',
      tag: 'Playback',
    },
  ];

  return (
    <section className="py-16 sm:py-20 bg-stone-900 text-stone-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold mb-3">
            <Smartphone className="w-3.5 h-3.5" />
            <span>Digital Product • Android Mobile Application</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
            {SITE_CONFIG.mobileApp.name} ({SITE_CONFIG.mobileApp.englishName})
          </h2>
          <p className="text-sm sm:text-base text-stone-300 leading-relaxed">
            The official mobile application published by{' '}
            <strong>{SITE_CONFIG.legalEntityName}</strong>. Engineered for accessing our
            curated catalog of published devotional audio recordings, daily stuti texts, and
            spiritual discourses.
          </p>
        </div>

        {/* Product Meta & Store Status */}
        <div className="p-6 rounded-2xl bg-stone-800/80 border border-stone-700/80 mb-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1 max-w-full">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs uppercase tracking-wider text-stone-400 font-semibold">
                Platform:
              </span>
              <span className="text-sm font-bold text-white">Android</span>
              <span className="text-stone-500">•</span>
              <span className="text-xs uppercase tracking-wider text-stone-400 font-semibold">
                Publisher:
              </span>
              <span className="text-sm font-semibold text-amber-400">
                {SITE_CONFIG.legalEntityName}
              </span>
            </div>
            <p className="text-xs text-stone-400 font-mono break-all">
              Package ID: {SITE_CONFIG.mobileApp.packageId}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Play store button compliant with coming soon state */}
            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-stone-950 border border-stone-700 text-stone-300 text-xs font-semibold shadow-inner">
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>Coming Soon on Google Play</span>
            </div>

            {!detailed && (
              <Link
                to="/mobile-app"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors"
              >
                <span>App Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-14">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-amber-400" />
            <span>Verified Production Capabilities</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {verifiedFeatures.map((feat) => {
              const Icon = feat.icon;
              return (
                <div
                  key={feat.title}
                  className="p-5 rounded-xl bg-stone-800/60 border border-stone-700/60 hover:border-stone-600 transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center mb-3">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-bold text-white mb-1.5">{feat.title}</h4>
                  <p className="text-xs text-stone-400 leading-relaxed">{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Production Screen Architecture (detailed or full) */}
        {detailed && (
          <div className="pt-8 border-t border-stone-800">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-amber-400" />
                <span>Production Application Modules</span>
              </h3>
              <p className="text-xs text-stone-400">
                Functional screen architecture verified in the current production mobile application codebase.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {appScreens.map((screen) => (
                <div
                  key={screen.id}
                  className="p-4 rounded-xl bg-stone-800/40 border border-stone-700/60 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">
                        {screen.tag}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white mb-1">{screen.name}</h4>
                    <p className="text-xs text-stone-400 leading-relaxed">{screen.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
