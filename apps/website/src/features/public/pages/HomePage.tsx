import React from 'react';
import { SITE_CONFIG } from '../../../config/siteConfig';
import { SEOHead } from '../../../components/shared/SEOHead';
import { HeroSection } from '../../../components/common/HeroSection';
import { BusinessOverview } from '../../../components/common/BusinessOverview';
import { SectionHeading } from '../../../components/common/SectionHeading';
import { BusinessActivityCard } from '../../../components/common/BusinessActivityCard';
import { BusinessInformation } from '../../../components/common/BusinessInformation';
import { AppShowcase } from '../../../components/common/AppShowcase';

export const HomePage: React.FC = () => {
  return (
    <>
      <SEOHead
        title="SANTMAT SATSANG PARCHAR | Digital Content, Sound Recording & Music Publishing"
        description="Official website of SANTMAT SATSANG PARCHAR, a Sole Proprietorship business engaged in digital content, digital marketing, sound recording and music publishing activities."
        canonicalPath="/"
        structuredData={{
          '@type': 'LocalBusiness',
          name: SITE_CONFIG.legalEntityName,
          description:
            'Sole Proprietorship business engaged in digital content, digital marketing, sound recording and music publishing activities.',
          url: SITE_CONFIG.siteUrl,
          email: SITE_CONFIG.officialEmail,
          telephone: `+91${SITE_CONFIG.officialPhone}`,
          address: {
            '@type': 'PostalAddress',
            streetAddress: `${SITE_CONFIG.registeredAddress.buildingNo}, ${SITE_CONFIG.registeredAddress.roadStreet}, Near ${SITE_CONFIG.registeredAddress.landmark}`,
            addressLocality: SITE_CONFIG.registeredAddress.city,
            addressRegion: SITE_CONFIG.registeredAddress.state,
            postalCode: SITE_CONFIG.registeredAddress.pincode,
            addressCountry: 'IN',
          },
        }}
      />

      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. Business Overview */}
      <BusinessOverview />

      {/* 3. Business Activities / Services Section */}
      <section className="py-16 sm:py-20 bg-stone-50/50 border-b border-stone-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            badge="Business Activities"
            title="Core Services & Production Activities"
            description="Our professional operations encompass end-to-end audio recording, digital media production, music publishing, and multi-channel distribution."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SITE_CONFIG.businessActivities.map((activity, index) => (
              <BusinessActivityCard
                key={activity.id}
                activity={activity}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 4. Digital Product: Mobile Application Showcase */}
      <AppShowcase />

      {/* 5. Business Information (Restrained, Secondary Presentation) */}
      <BusinessInformation />
    </>
  );
};
