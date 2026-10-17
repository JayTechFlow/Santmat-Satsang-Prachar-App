import React from 'react';
import {
  Building2,
  FileText,
  Disc3,
  Radio,
  Share2,
  Mic,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';
import { SITE_CONFIG } from '../../../config/siteConfig';
import { SEOHead } from '../../../components/shared/SEOHead';
import { BusinessInformation } from '../../../components/common/BusinessInformation';

export const AboutPage: React.FC = () => {
  return (
    <>
      <SEOHead
        title="About Us | Business Profile & Overview"
        description="Learn about SANTMAT SATSANG PARCHAR, a Sole Proprietorship business in Bihar, India, engaged in digital content, sound recording, music publishing, and digital distribution."
        canonicalPath="/about"
      />

      {/* Header / Intro */}
      <section className="bg-gradient-to-b from-stone-50 via-white to-stone-50/40 border-b border-stone-200 py-14 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-stone-100 border border-stone-200/80 text-xs font-semibold text-stone-700 mb-4 shadow-2xs">
            <Building2 className="w-4 h-4 text-amber-700" />
            <span>Business Profile • {SITE_CONFIG.businessStructure}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-stone-900 tracking-tight mb-4">
            {`About ${SITE_CONFIG.legalEntityName}`}
          </h1>

          <p className="text-base sm:text-lg text-stone-600 leading-relaxed font-normal max-w-2xl mx-auto">
            A professional Sole Proprietorship business based in Bihar, India, specializing
            in digital content creation, sound recording, music publishing, and multi-platform media publishing.
          </p>
        </div>
      </section>

      {/* Main Content Sections */}
      <section className="py-14 sm:py-18 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 text-stone-700 leading-relaxed">
          {/* 1. Business Overview */}
          <div className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-black text-stone-900 flex items-center gap-2.5">
              <FileText className="w-5 h-5 text-amber-700" />
              <span>1. Business Overview</span>
            </h2>
            <p className="text-sm sm:text-base">
              <strong>{SITE_CONFIG.legalEntityName}</strong> operates as a registered{' '}
              <strong>{SITE_CONFIG.businessStructure}</strong> enterprise situated in Samastipur
              District, Bihar, India. Our core activities are centered on digital content production,
              digital marketing, sound recording, and music publishing in studio or other appropriate environments.
            </p>
            <p className="text-sm sm:text-base">
              The business also develops, engineers, and distributes devotional and spiritual audio content
              as a primary content vertical within its publishing catalog. Content offerings include
              recorded spiritual discourses, classical devotional bhajans, and synchronized prayer recitations.
            </p>
          </div>

          {/* 2. Business Structure */}
          <div className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-black text-stone-900 flex items-center gap-2.5">
              <Building2 className="w-5 h-5 text-amber-700" />
              <span>2. Business Structure & Governance</span>
            </h2>
            <p className="text-sm sm:text-base">
              The business operates under the Sole Proprietorship structure, established under the
              ownership and management of <strong>{SITE_CONFIG.proprietorName}</strong>.
              All administrative, editorial, and commercial publishing activities are governed
              directly by the proprietor in compliance with applicable commercial and tax regulations
              in India.
            </p>
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm text-stone-600">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-stone-400 font-semibold block text-[11px] uppercase">
                    Legal Entity Name:
                  </span>
                  <span className="text-stone-900 font-semibold">{SITE_CONFIG.legalEntityName}</span>
                </div>
                <div>
                  <span className="text-stone-400 font-semibold block text-[11px] uppercase">
                    Structure:
                  </span>
                  <span className="text-stone-900 font-semibold">{SITE_CONFIG.businessStructure}</span>
                </div>
                <div>
                  <span className="text-stone-400 font-semibold block text-[11px] uppercase">
                    Proprietor:
                  </span>
                  <span className="text-stone-900 font-semibold">{SITE_CONFIG.proprietorName}</span>
                </div>
                <div>
                  <span className="text-stone-400 font-semibold block text-[11px] uppercase">
                    Location:
                  </span>
                  <span className="text-stone-900 font-semibold">{SITE_CONFIG.registeredAddress.compact}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Business Activities */}
          <div className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-black text-stone-900 flex items-center gap-2.5">
              <Disc3 className="w-5 h-5 text-amber-700" />
              <span>3. Business Activities & Scope</span>
            </h2>
            <p className="text-sm sm:text-base">
              As registered under Udyam and GST guidelines, our commercial activities encompass:
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
              {SITE_CONFIG.businessActivities.map((act) => (
                <li
                  key={act.id}
                  className="p-3.5 rounded-lg bg-stone-50 border border-stone-200/80 flex items-start gap-2.5"
                >
                  <CheckCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-stone-900 block">{act.title}</strong>
                    <span className="text-stone-600 text-xs">{act.description}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* 4. Digital Media Work & Technology */}
          <div className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-black text-stone-900 flex items-center gap-2.5">
              <Radio className="w-5 h-5 text-amber-700" />
              <span>4. Digital Media Work</span>
            </h2>
            <p className="text-sm sm:text-base">
              We employ modern media publishing workflows to prepare high-fidelity digital audio assets,
              synchronized metadata, catalog indices, and multi-format streaming streams. Media preparation
              focuses on clarity, lossless fidelity, and universal compatibility across devices.
            </p>
          </div>

          {/* 5. Audio Production & Sound Recording */}
          <div className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-black text-stone-900 flex items-center gap-2.5">
              <Mic className="w-5 h-5 text-amber-700" />
              <span>5. Audio Production & Sound Recording</span>
            </h2>
            <p className="text-sm sm:text-base">
              Audio content is recorded and mastered in studio settings or monitored environments.
              Audio processing includes acoustic noise reduction, equalization, dynamic mastering,
              and optimization for both handheld mobile speakers and high-fidelity headphones.
            </p>
          </div>

          {/* 6. Music Publishing & Digital Distribution */}
          <div className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-black text-stone-900 flex items-center gap-2.5">
              <Share2 className="w-5 h-5 text-amber-700" />
              <span>6. Music Publishing & Distribution Infrastructure</span>
            </h2>
            <p className="text-sm sm:text-base">
              Published catalogs are made accessible through our dedicated Android mobile application
              and official online distribution channels. All recordings, texts, and original compilations
              are published under official copyright owned and managed by{' '}
              <strong>{SITE_CONFIG.legalEntityName}</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* 7. Business Information Section */}
      <BusinessInformation />
    </>
  );
};
