import React from 'react';
import { ArrowRight, Smartphone, Disc, Radio } from 'lucide-react';
import { SITE_CONFIG } from '../../config/siteConfig';
import { PrimaryButton, SecondaryButton } from './Buttons';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-stone-50 via-white to-stone-50/50 border-b border-stone-200/80 pt-16 pb-20 sm:pt-24 sm:pb-28">
      {/* Background audio waveform graphic subtle accent */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none flex items-center justify-center overflow-hidden">
        <div className="max-w-[800px] w-full h-[300px] flex items-center justify-center gap-2">
          {Array.from({ length: 48 }).map((_, i) => (
            <div
              key={i}
              className="w-1.5 bg-stone-900 rounded-full"
              style={{
                height: `${20 + Math.sin(i * 0.4) * 40 + Math.cos(i * 0.2) * 30}%`,
              }}
            />
          ))}
        </div>
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Business entity badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-stone-100 border border-stone-200/80 text-xs font-semibold text-stone-700 mb-6 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse" />
          <span>Sole Proprietorship Business • Dharampur, Bihar</span>
        </div>

        {/* Headline */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-stone-900 tracking-tight leading-[1.12] mb-4">
          {SITE_CONFIG.legalEntityName}
        </h1>

        {/* Tagline */}
        <p className="text-lg sm:text-2xl font-bold text-amber-800 tracking-tight mb-6">
          {SITE_CONFIG.orgTagline}
        </p>

        {/* Supporting description */}
        <p className="text-base sm:text-lg text-stone-600 max-w-3xl mx-auto leading-relaxed mb-10 font-normal">
          <strong>{SITE_CONFIG.legalEntityName}</strong> is a{' '}
          <strong>{SITE_CONFIG.businessStructure}</strong> business engaged in digital content,
          sound recording, music publishing and related digital media activities.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto">
          <PrimaryButton
            to="/services"
            className="w-full sm:w-auto"
            icon={<ArrowRight className="w-4 h-4" />}
          >
            Explore Our Services
          </PrimaryButton>

          <SecondaryButton
            to="/mobile-app"
            className="w-full sm:w-auto"
            icon={<Smartphone className="w-4 h-4 text-stone-600" />}
          >
            Mobile Application
          </SecondaryButton>
        </div>

        {/* Quick Capabilities Highlights */}
        <div className="mt-14 pt-8 border-t border-stone-200/80 grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
          <div className="p-3 rounded-lg bg-white/60 border border-stone-200/70">
            <span className="text-[11px] uppercase tracking-wider text-stone-400 font-bold block mb-0.5">
              Activities
            </span>
            <span className="text-xs sm:text-sm font-semibold text-stone-800">
              Sound Recording
            </span>
          </div>

          <div className="p-3 rounded-lg bg-white/60 border border-stone-200/70">
            <span className="text-[11px] uppercase tracking-wider text-stone-400 font-bold block mb-0.5">
              Publishing
            </span>
            <span className="text-xs sm:text-sm font-semibold text-stone-800">
              Music & Audio Publishing
            </span>
          </div>

          <div className="p-3 rounded-lg bg-white/60 border border-stone-200/70">
            <span className="text-[11px] uppercase tracking-wider text-stone-400 font-bold block mb-0.5">
              Media
            </span>
            <span className="text-xs sm:text-sm font-semibold text-stone-800">
              Digital Content Creation
            </span>
          </div>

          <div className="p-3 rounded-lg bg-white/60 border border-stone-200/70">
            <span className="text-[11px] uppercase tracking-wider text-stone-400 font-bold block mb-0.5">
              Distribution
            </span>
            <span className="text-xs sm:text-sm font-semibold text-stone-800">
              Digital Apps & Streaming
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
