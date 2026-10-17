import React from 'react';
import { Link } from 'react-router-dom';
import {
  Smartphone,
  ShieldCheck,
  Headphones,
  Sliders,
  FolderTree,
  Clock,
  Search,
  Heart,
  Bell,
  Play,
  Trash2,
  FileText,
  ArrowLeft,
  CheckCircle,
} from 'lucide-react';
import { SITE_CONFIG } from '../../../config/siteConfig';
import { SEOHead } from '../../../components/shared/SEOHead';
import { AppShowcase } from '../../../components/common/AppShowcase';
import { BusinessInformation } from '../../../components/common/BusinessInformation';

export const MobileAppPage: React.FC = () => {
  return (
    <>
      <SEOHead
        title="Official Mobile App | Santmat Satsang Prachar (Android)"
        description="Official mobile application developed and published by SANTMAT SATSANG PARCHAR. Stream high-quality devotional audio, background playback, daily stuti, and notifications."
        canonicalPath="/mobile-app"
        structuredData={{
          '@type': 'MobileApplication',
          name: SITE_CONFIG.mobileApp.name,
          operatingSystem: 'Android',
          applicationCategory: 'MultimediaApplication',
          publisher: {
            '@type': 'Organization',
            name: SITE_CONFIG.legalEntityName,
            url: SITE_CONFIG.siteUrl,
          },
        }}
      />

      {/* Header */}
      <section className="bg-gradient-to-b from-stone-50 via-white to-stone-50/40 border-b border-stone-200 py-14 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-6">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </Link>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-stone-100 border border-stone-200/80 text-xs font-semibold text-stone-700 mb-4 shadow-2xs">
            <Smartphone className="w-4 h-4 text-amber-700" />
            <span>Official Mobile Application • Android</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-stone-900 tracking-tight mb-2">
            {SITE_CONFIG.mobileApp.name}
          </h1>
          <p className="text-sm sm:text-base font-bold text-amber-800 uppercase tracking-wider mb-6">
            {SITE_CONFIG.mobileApp.englishName}
          </p>

          <p className="text-base sm:text-lg text-stone-600 leading-relaxed font-normal max-w-2xl mx-auto mb-8">
            The dedicated digital product of <strong>{SITE_CONFIG.legalEntityName}</strong> for
            accessing published recorded audio, daily stuti texts, and spiritual discourses.
          </p>

          {/* Product Relationship Box */}
          <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-2xs max-w-xl mx-auto text-left">
            <div className="flex items-center gap-2 font-bold text-stone-900 text-xs uppercase tracking-wider mb-3">
              <ShieldCheck className="w-4 h-4 text-amber-700" />
              <span>Product & Business Relationship</span>
            </div>
            <div className="space-y-2 text-xs text-stone-700">
              <div className="flex items-center justify-between py-1 border-b border-stone-100">
                <span className="text-stone-500 font-medium">Publishing Business:</span>
                <span className="font-semibold text-stone-900">{SITE_CONFIG.legalEntityName}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-stone-100">
                <span className="text-stone-500 font-medium">Business Structure:</span>
                <span className="font-semibold text-stone-900">{SITE_CONFIG.businessStructure}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-stone-100">
                <span className="text-stone-500 font-medium">Application Name:</span>
                <span className="font-semibold text-stone-900">{SITE_CONFIG.mobileApp.englishName}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-stone-500 font-medium">Package Identifier:</span>
                <span className="font-mono text-stone-800">{SITE_CONFIG.mobileApp.packageId}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Showcase with Features and Screen Architecture */}
      <AppShowcase detailed={true} />

      {/* Compliance & User Rights Section */}
      <section className="py-16 sm:py-20 bg-white border-b border-stone-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl sm:text-2xl font-bold text-stone-900 mb-3 text-center">
            User Privacy & Data Rights
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 text-center max-w-xl mx-auto mb-10">
            In compliance with Google Play Store developer guidelines and privacy standards,
            all user account and legal data management links are permanently available online.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              to="/privacy-policy"
              className="p-5 rounded-xl bg-stone-50 border border-stone-200 hover:border-amber-300 transition-colors group flex flex-col justify-between"
            >
              <div>
                <ShieldCheck className="w-5 h-5 text-amber-700 mb-2" />
                <h3 className="text-sm font-bold text-stone-900 mb-1 group-hover:text-amber-800">
                  Privacy Policy
                </h3>
                <p className="text-xs text-stone-500">
                  Complete declaration of Firebase authentication, playback analytics, and telemetry usage.
                </p>
              </div>
              <span className="text-[11px] font-bold text-amber-700 mt-4 block">
                Read Policy &rarr;
              </span>
            </Link>

            <Link
              to="/terms"
              className="p-5 rounded-xl bg-stone-50 border border-stone-200 hover:border-amber-300 transition-colors group flex flex-col justify-between"
            >
              <div>
                <FileText className="w-5 h-5 text-amber-700 mb-2" />
                <h3 className="text-sm font-bold text-stone-900 mb-1 group-hover:text-amber-800">
                  Terms of Service
                </h3>
                <p className="text-xs text-stone-500">
                  Intellectual property rights, audio copyright, and non-commercial end-user licensing.
                </p>
              </div>
              <span className="text-[11px] font-bold text-amber-700 mt-4 block">
                Read Terms &rarr;
              </span>
            </Link>

            <Link
              to="/delete-account"
              className="p-5 rounded-xl bg-stone-50 border border-stone-200 hover:border-amber-300 transition-colors group flex flex-col justify-between"
            >
              <div>
                <Trash2 className="w-5 h-5 text-rose-600 mb-2" />
                <h3 className="text-sm font-bold text-stone-900 mb-1 group-hover:text-rose-700">
                  Account Deletion
                </h3>
                <p className="text-xs text-stone-500">
                  Dedicated in-app and web deletion mechanism for user profiles and associated data.
                </p>
              </div>
              <span className="text-[11px] font-bold text-rose-600 mt-4 block">
                Request Deletion &rarr;
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Business Information */}
      <BusinessInformation />
    </>
  );
};
