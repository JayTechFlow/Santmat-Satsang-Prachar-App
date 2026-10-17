import React from 'react';
import { FileText, ShieldAlert, CheckCircle, Mail } from 'lucide-react';
import { SITE_CONFIG } from '../../../config/siteConfig';
import { SEOHead } from '../../../components/shared/SEOHead';
import { LegalSection } from '../../../components/common/LegalSection';
import { BusinessInformation } from '../../../components/common/BusinessInformation';

export const TermsPage: React.FC = () => {
  return (
    <>
      <SEOHead
        title="Terms & Conditions | Legal Agreement & IP Rights"
        description="Official Terms and Conditions for SANTMAT SATSANG PARCHAR website and mobile application. Intellectual property, music publishing rights, and terms of service."
        canonicalPath="/terms"
      />

      {/* Header */}
      <section className="bg-gradient-to-b from-stone-50 via-white to-stone-50/40 border-b border-stone-200 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-stone-100 border border-stone-200/80 text-xs font-semibold text-stone-700 mb-4 shadow-2xs">
            <FileText className="w-4 h-4 text-amber-700" />
            <span>Legal Agreement & Terms of Service</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-stone-900 tracking-tight mb-3">
            Terms & Conditions
          </h1>
          <p className="text-xs sm:text-sm font-bold text-amber-800 uppercase tracking-widest mb-3">
            {SITE_CONFIG.legalEntityName} ({SITE_CONFIG.businessStructure})
          </p>

          <p className="text-xs text-stone-500 font-medium">
            Effective Date: October 2026 • Last Reviewed: October 2026
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 text-stone-700 leading-relaxed text-xs sm:text-sm">
          {/* Important Notice */}
          <div className="p-5 sm:p-6 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-2">
            <h2 className="text-base font-bold text-stone-900">
              Mandatory Intellectual Property Notice
            </h2>
            <p className="text-xs sm:text-sm text-stone-800 font-medium leading-relaxed">
              All media, text, audio recordings and logos belong to{' '}
              <strong>{SITE_CONFIG.legalEntityName}</strong>. Unauthorized distribution or commercial
              use of audio content without permission is prohibited.
            </p>
          </div>

          {/* 1. Acceptance */}
          <LegalSection title="1. Acceptance of Terms">
            <p>
              By accessing, browsing, or utilizing the public website (
              <strong>{SITE_CONFIG.siteUrl}</strong>) or downloading and using the official mobile
              application (<strong>{SITE_CONFIG.mobileApp.englishName}</strong>), you agree to be bound
              by these Terms and Conditions. If you do not agree to all provisions contained herein, you
              must discontinue access to our website and uninstall our applications.
            </p>
          </LegalSection>

          {/* 2. Website Use */}
          <LegalSection title="2. Website Use">
            <p>
              This website is provided as an official public business presence for informational,
              verification, and legal transparency purposes. Users agree not to disrupt, compromise, or
              circumvent the security, architecture, or normal operation of the website, nor attempt
              unauthorized access to administrative systems or restricted directories.
            </p>
          </LegalSection>

          {/* 3. Mobile Application */}
          <LegalSection title="3. Mobile Application">
            <p>
              The mobile application is a digital media product provided by{' '}
              <strong>{SITE_CONFIG.legalEntityName}</strong> for end users to listen to published audio
              recordings and view accompanying literature. End users receive a limited, revocable,
              non-exclusive, personal license to install and stream content through the mobile application.
            </p>
          </LegalSection>

          {/* 4. Intellectual Property */}
          <LegalSection title="4. Intellectual Property">
            <p>
              All trademarks, service marks, logos, brand assets, source code, text compilations, audio
              files, recordings, and visual layouts are the exclusive intellectual property of{' '}
              <strong>{SITE_CONFIG.legalEntityName}</strong> and its proprietor{' '}
              <strong>{SITE_CONFIG.proprietorName}</strong>, protected under the Copyright Act, 1957 of
              India and international intellectual property conventions.
            </p>
          </LegalSection>

          {/* 5. Audio Content */}
          <LegalSection title="5. Audio Content">
            <p>
              Audio recordings made available through our digital platforms represent specialized sound
              recording and music publishing assets. Content may be streamed strictly for personal,
              devotional, and non-commercial listening purposes. Downloading or capturing streams outside
              authorized app features is prohibited.
            </p>
          </LegalSection>

          {/* 6. Music Publishing */}
          <LegalSection title="6. Music Publishing & Rights Management">
            <p>
              As a Sole Proprietorship business engaged in sound recording and music publishing activities in
              studio or elsewhere, <strong>{SITE_CONFIG.legalEntityName}</strong> asserts all mechanical,
              synchronization, digital reproduction, and public dissemination rights over all published
              master recordings and catalogs.
            </p>
          </LegalSection>

          {/* 7. Unauthorized Distribution */}
          <LegalSection title="7. Unauthorized Distribution">
            <p>
              Re-uploading, republishing, rebroadcasting, distributing via peer-to-peer networks, mirroring on
              unauthorized third-party websites or mobile apps, or repackaging any audio or textual content
              without express prior written consent from <strong>{SITE_CONFIG.legalEntityName}</strong> is
              strictly prohibited and constitutes infringement of copyright.
            </p>
          </LegalSection>

          {/* 8. Commercial Use */}
          <LegalSection title="8. Commercial Use Prohibition">
            <p>
              Any commercial exploitation, monetized streaming, public exhibition for paid admission, sale, or
              commercial synchronization of published tracks and literature without an executed licensing
              agreement is strictly prohibited.
            </p>
          </LegalSection>

          {/* 9. Content Availability */}
          <LegalSection title="9. Content Availability & Modifications">
            <p>
              We endeavor to maintain high service availability, but we reserve the right to modify,
              suspend, withdraw, or update any audio track, category, literature text, or application feature
              at our sole discretion without prior notice or liability.
            </p>
          </LegalSection>

          {/* 10. Contact */}
          <LegalSection title="10. Legal & Business Contact">
            <p>
              For licensing inquiries, legal questions, copyright clearance, or permissions, please contact:
            </p>
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs space-y-1">
              <p>
                <strong>Entity:</strong> {SITE_CONFIG.legalEntityName} ({SITE_CONFIG.businessStructure})
              </p>
              <p>
                <strong>Proprietor:</strong> {SITE_CONFIG.proprietorName}
              </p>
              <p>
                <strong>Official Email:</strong>{' '}
                <a
                  href={`mailto:${SITE_CONFIG.officialEmail}`}
                  className="text-amber-800 font-bold hover:underline font-mono"
                >
                  {SITE_CONFIG.officialEmail}
                </a>
              </p>
              <p>
                <strong>Phone:</strong>{' '}
                <a
                  href={`tel:${SITE_CONFIG.officialPhone}`}
                  className="text-stone-900 font-semibold font-mono"
                >
                  {SITE_CONFIG.officialPhoneFormatted}
                </a>
              </p>
              <p>
                <strong>Registered Address:</strong> {SITE_CONFIG.registeredAddress.full}
              </p>
            </div>
          </LegalSection>
        </div>
      </section>

      {/* Business Information */}
      <BusinessInformation />
    </>
  );
};
