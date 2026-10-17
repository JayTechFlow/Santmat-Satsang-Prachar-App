import React from 'react';
import {
  FileText,
  Megaphone,
  Mic,
  Music,
  Radio,
  Share2,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { SITE_CONFIG } from '../../../config/siteConfig';
import { SEOHead } from '../../../components/shared/SEOHead';
import { SectionHeading } from '../../../components/common/SectionHeading';
import { BusinessInformation } from '../../../components/common/BusinessInformation';
import { PrimaryButton } from '../../../components/common/Buttons';

export const ServicesPage: React.FC = () => {
  const serviceCategories = [
    {
      id: 'digital-content',
      icon: FileText,
      title: 'Digital Content Production',
      titleHindi: 'डिजिटल कंटेंट निर्माण',
      description:
        'Creation and preparation of digital media content for online publication and distribution.',
      deliverables: [
        'High-quality digital audio files and synchronized lyrics/texts',
        'Multi-format media content formatted for streaming apps and web portals',
        'Audio editing, noise reduction, and level normalization',
        'Digital metadata tagging and catalog documentation',
      ],
    },
    {
      id: 'digital-marketing',
      icon: Megaphone,
      title: 'Digital Marketing',
      titleHindi: 'डिजिटल मार्केटिंग',
      description:
        'Digital content and marketing-oriented media activities.',
      deliverables: [
        'Strategic content distribution across digital platforms',
        'Audience engagement and announcement workflows',
        'Digital reach enhancement for published devotional media',
        'Analytics-informed audience growth and listener telemetry',
      ],
    },
    {
      id: 'sound-recording',
      icon: Mic,
      title: 'Sound Recording',
      titleHindi: 'साउंड रिकॉर्डिंग',
      description:
        'Audio recording and production activities conducted in studio or other appropriate environments.',
      deliverables: [
        'Studio sound capture for vocal recitations and musical instruments',
        'Field and event audio recording in monitored acoustic environments',
        'Audio mixing and dynamic equalization',
        'Final mastering engineered for clear vocal articulation',
      ],
    },
    {
      id: 'music-publishing',
      icon: Music,
      title: 'Music Publishing',
      titleHindi: 'म्यूजिक पब्लिशिंग',
      description:
        'Publishing and distributing original recorded music and audio content.',
      deliverables: [
        'Official publishing rights and intellectual property registration',
        'Release scheduling and metadata indexing',
        'Digital rights management and anti-piracy enforcement',
        'Catalog indexing of spiritual hymns, bhajans, and discourses',
      ],
    },
    {
      id: 'digital-media-publishing',
      icon: Radio,
      title: 'Digital Media Publishing',
      titleHindi: 'डिजिटल मीडिया पब्लिशिंग',
      description:
        'Preparing and publishing digital audio and related media content.',
      deliverables: [
        'End-to-end publishing pipelines into streaming platforms',
        'Integrated release management across apps and websites',
        'Formatted digital booklets, stuti prayer texts, and literature',
        'Cross-platform digital synchronization',
      ],
    },
    {
      id: 'audio-distribution',
      icon: Share2,
      title: 'Audio Content Distribution',
      titleHindi: 'ऑडियो कंटेंट वितरण',
      description:
        'Digital distribution of published audio content through supported platforms and applications.',
      deliverables: [
        'Direct streaming distribution via the official Android mobile app',
        'High-uptime content delivery network (CDN) endpoints',
        'Bandwidth-adaptive streaming delivery for mobile devices',
        'Secure cloud storage and scalable digital distribution',
      ],
    },
  ];

  return (
    <>
      <SEOHead
        title="Services & Business Activities | Digital Content, Sound Recording & Music Publishing"
        description="Comprehensive business activities of SANTMAT SATSANG PARCHAR including sound recording, music publishing, digital content production, and audio distribution."
        canonicalPath="/services"
      />

      {/* Header */}
      <section className="bg-gradient-to-b from-stone-50 via-white to-stone-50/40 border-b border-stone-200 py-14 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-stone-100 border border-stone-200/80 text-xs font-semibold text-stone-700 mb-4 shadow-2xs">
            <span>Official Commercial Scope • Sole Proprietorship</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-stone-900 tracking-tight mb-4">
            Services & Business Activities
          </h1>

          <p className="text-base sm:text-lg text-stone-600 leading-relaxed font-normal max-w-2xl mx-auto">
            Professional media activities conducted by <strong>{SITE_CONFIG.legalEntityName}</strong>{' '}
            as registered under Indian MSME Udyam and GST regulations.
          </p>
        </div>
      </section>

      {/* Main Services List */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            badge="Activities Overview"
            title="Six Core Business Activities"
            description="Our integrated operations unite sound recording, digital publishing, and distribution technology under a single professional framework."
          />

          <div className="space-y-8">
            {serviceCategories.map((service, index) => {
              const Icon = service.icon;
              return (
                <div
                  key={service.id}
                  id={service.id}
                  className="p-6 sm:p-8 rounded-2xl bg-stone-50/70 border border-stone-200/90 shadow-2xs hover:border-amber-300 transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div className="md:max-w-md">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-[10px] font-mono text-stone-400 uppercase font-semibold">
                            Activity 0{index + 1}
                          </span>
                          <h3 className="text-xl font-bold text-stone-900">
                            {service.title}
                          </h3>
                        </div>
                      </div>
                      <p className="text-xs font-semibold text-amber-800 mb-2">
                        {service.titleHindi}
                      </p>
                      <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                        {service.description}
                      </p>
                    </div>

                    <div className="flex-1 md:max-w-lg pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-stone-200/80 md:pl-6">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-3">
                        Scope & Operational Capabilities
                      </h4>
                      <ul className="space-y-2 text-xs sm:text-sm text-stone-600">
                        {service.deliverables.map((item, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* CTA Box */}
          <div className="mt-14 p-8 rounded-2xl bg-stone-900 text-white text-center max-w-3xl mx-auto shadow-md">
            <h3 className="text-xl sm:text-2xl font-bold mb-2">
              Explore Our Digital Distribution Platform
            </h3>
            <p className="text-xs sm:text-sm text-stone-300 mb-6 max-w-xl mx-auto leading-relaxed">
              Experience published devotional audio tracks, daily stuti texts, and spiritual discourses
              through our official Android mobile application.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <PrimaryButton
                to="/mobile-app"
                className="bg-amber-600 hover:bg-amber-700 text-white"
                icon={<ArrowRight className="w-4 h-4" />}
              >
                View Mobile Application
              </PrimaryButton>
              <PrimaryButton
                to="/contact"
                className="bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700"
              >
                Contact Support
              </PrimaryButton>
            </div>
          </div>
        </div>
      </section>

      {/* Business Registration Details */}
      <BusinessInformation />
    </>
  );
};
