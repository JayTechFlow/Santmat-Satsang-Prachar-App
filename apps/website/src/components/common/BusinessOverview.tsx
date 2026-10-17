import React from 'react';
import { SITE_CONFIG } from '../../config/siteConfig';
import { Disc3, Radio, FileText } from 'lucide-react';

export const BusinessOverview: React.FC = () => {
  return (
    <section className="py-16 sm:py-20 bg-white border-b border-stone-200/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Main Copy */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-block text-[11px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 border border-amber-200/70 px-3 py-1 rounded-full">
              Sole Proprietorship Business
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-stone-900 tracking-tight leading-tight">
              About {SITE_CONFIG.legalEntityName}
            </h2>

            <p className="text-base sm:text-lg text-stone-700 leading-relaxed font-normal">
              <strong>{SITE_CONFIG.legalEntityName}</strong> operates as a{' '}
              <strong>{SITE_CONFIG.businessStructure}</strong> business based in Bihar, India,
              with activities focused on digital content, sound recording, music publishing, and
              digital media publishing.
            </p>

            <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
              The business also develops, records, produces, and distributes devotional audio content
              and spiritual discourse recordings as part of its specialized media and publishing activities.
              Our production pipeline spans audio recording, sound engineering, catalog management, and
              multi-platform digital delivery.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-lg bg-stone-50 border border-stone-200/80">
                <div className="text-xs font-bold text-stone-900 mb-1 flex items-center gap-1.5">
                  <Disc3 className="w-4 h-4 text-amber-700" />
                  <span>Production & Publishing</span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Studio audio recording, music mastering, digital publishing, and distribution.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-stone-50 border border-stone-200/80">
                <div className="text-xs font-bold text-stone-900 mb-1 flex items-center gap-1.5">
                  <Radio className="w-4 h-4 text-amber-700" />
                  <span>Digital Media & Apps</span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Dedicated digital application and online streaming delivery for audiences.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Fact Card */}
          <div className="lg:col-span-5">
            <div className="p-7 rounded-2xl bg-gradient-to-br from-stone-900 to-stone-800 text-white shadow-lg space-y-5">
              <div className="flex items-center justify-between border-b border-stone-700/80 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white">Business Profile</h3>
                  <p className="text-xs text-stone-400">Sole Proprietorship Identity</p>
                </div>
                <span className="text-[10px] font-mono uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded">
                  Active
                </span>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <span className="text-stone-400 block text-[11px] mb-0.5">Legal Entity Name</span>
                  <span className="font-semibold text-white font-mono text-sm">
                    {SITE_CONFIG.legalEntityName}
                  </span>
                </div>

                <div>
                  <span className="text-stone-400 block text-[11px] mb-0.5">Proprietor</span>
                  <span className="font-semibold text-stone-200">
                    {SITE_CONFIG.proprietorName}
                  </span>
                </div>

                <div>
                  <span className="text-stone-400 block text-[11px] mb-0.5">Registered Office</span>
                  <span className="text-stone-300 leading-relaxed">
                    {SITE_CONFIG.registeredAddress.full}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-stone-700/60">
                  <div>
                    <span className="text-stone-400 block text-[10px]">GSTIN</span>
                    <span className="font-mono text-stone-200 text-xs font-semibold">
                      {SITE_CONFIG.gstin}
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[10px]">Udyam Reg.</span>
                    <span className="font-mono text-stone-200 text-xs font-semibold">
                      {SITE_CONFIG.udyamRegistrationNumber}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2 text-[11px] text-stone-400 border-t border-stone-700/60 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Verified Sole Proprietorship entity under MSME Udyam & GST.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
