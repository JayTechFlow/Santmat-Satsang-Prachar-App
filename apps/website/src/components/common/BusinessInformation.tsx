import React from 'react';
import { Building2, User, FileText, Award, MapPin } from 'lucide-react';
import { SITE_CONFIG } from '../../config/siteConfig';

interface BusinessInformationProps {
  className?: string;
  condensed?: boolean;
}

export const BusinessInformation: React.FC<BusinessInformationProps> = ({
  className = '',
  condensed = false,
}) => {
  const fields = [
    {
      label: 'Legal Entity',
      value: SITE_CONFIG.legalEntityName,
      icon: Building2,
    },
    {
      label: 'Business Structure',
      value: SITE_CONFIG.businessStructure,
      icon: FileText,
    },
    {
      label: 'Proprietor',
      value: SITE_CONFIG.proprietorName,
      icon: User,
    },
    {
      label: 'GSTIN',
      value: SITE_CONFIG.gstin,
      icon: Award,
    },
    {
      label: 'Udyam Registration',
      value: SITE_CONFIG.udyamRegistrationNumber,
      icon: Award,
    },
    {
      label: 'Registered Office',
      value: SITE_CONFIG.registeredAddress.compact,
      icon: MapPin,
    },
  ];

  if (condensed) {
    return (
      <div className={`p-5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-600 ${className}`}>
        <h4 className="font-bold text-stone-900 uppercase tracking-wider text-[11px] mb-3">
          Business Registration Details
        </h4>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
          {fields.map((f) => (
            <div key={f.label} className="flex flex-col">
              <dt className="text-[10px] uppercase font-semibold text-stone-400">
                {f.label}
              </dt>
              <dd className="font-mono text-stone-800 text-[11px] font-medium">
                {f.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    );
  }

  return (
    <section className={`py-12 bg-stone-50/70 border-y border-stone-200/80 ${className}`}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-8">
          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block mb-1">
            Verification & Legal Registration
          </span>
          <h3 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
            Business Information
          </h3>
          <p className="text-xs text-stone-500 mt-1">
            Official government registration and business profile details.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {fields.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="p-4 rounded-xl bg-white border border-stone-200/90 shadow-2xs flex items-start gap-3.5"
              >
                <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-stone-600 shrink-0 mt-0.5">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-semibold tracking-wider text-stone-500 uppercase block">
                    {item.label}
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-stone-900 block truncate font-mono">
                    {item.value}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
