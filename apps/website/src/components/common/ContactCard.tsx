import React from 'react';
import { Mail, Phone, MapPin, Building2, ExternalLink } from 'lucide-react';
import { SITE_CONFIG } from '../../config/siteConfig';

export const ContactCard: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Official Business Header */}
      <div className="p-6 rounded-2xl bg-white border border-stone-200/90 shadow-xs space-y-4">
        <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
          <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-700">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-stone-900 text-base">
              {SITE_CONFIG.legalEntityName}
            </h3>
            <p className="text-xs text-stone-500 font-medium">
              {SITE_CONFIG.businessStructure} • Proprietor: {SITE_CONFIG.proprietorName}
            </p>
          </div>
        </div>

        {/* Email */}
        <div className="flex items-start gap-3.5 pt-1">
          <div className="w-9 h-9 rounded-lg bg-stone-50 border border-stone-200/80 flex items-center justify-center text-stone-700 shrink-0 mt-0.5">
            <Mail className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
              Official Email
            </span>
            <a
              href={`mailto:${SITE_CONFIG.officialEmail}`}
              className="text-sm font-semibold text-amber-800 hover:text-amber-950 hover:underline font-mono"
            >
              {SITE_CONFIG.officialEmail}
            </a>
            <p className="text-[11px] text-stone-500 mt-0.5">
              General business inquiries and mobile application support.
            </p>
          </div>
        </div>

        {/* Telephone */}
        <div className="flex items-start gap-3.5 pt-2 border-t border-stone-100">
          <div className="w-9 h-9 rounded-lg bg-stone-50 border border-stone-200/80 flex items-center justify-center text-stone-700 shrink-0 mt-0.5">
            <Phone className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
              Contact Phone
            </span>
            <a
              href={`tel:${SITE_CONFIG.officialPhone}`}
              className="text-sm font-semibold text-stone-900 hover:text-amber-800 font-mono"
            >
              {SITE_CONFIG.officialPhoneFormatted}
            </a>
            <p className="text-[11px] text-stone-500 mt-0.5">
              Direct voice contact for business communications.
            </p>
          </div>
        </div>

        {/* Registered Office */}
        <div className="flex items-start gap-3.5 pt-2 border-t border-stone-100">
          <div className="w-9 h-9 rounded-lg bg-stone-50 border border-stone-200/80 flex items-center justify-center text-stone-700 shrink-0 mt-0.5">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block mb-1">
              Registered Office Address
            </span>
            <address className="not-italic text-xs sm:text-sm text-stone-700 leading-relaxed space-y-0.5">
              <p className="font-semibold text-stone-900">
                Building No. / Flat No.: {SITE_CONFIG.registeredAddress.buildingNo}
              </p>
              <p>Road / Street: {SITE_CONFIG.registeredAddress.roadStreet}</p>
              <p>Nearby Landmark: {SITE_CONFIG.registeredAddress.landmark}</p>
              <p>City / Town: {SITE_CONFIG.registeredAddress.city}</p>
              <p>District: {SITE_CONFIG.registeredAddress.district}</p>
              <p>
                State: {SITE_CONFIG.registeredAddress.state} — PIN Code:{' '}
                {SITE_CONFIG.registeredAddress.pincode}
              </p>
              <p className="font-medium text-stone-800">{SITE_CONFIG.registeredAddress.country}</p>
            </address>
          </div>
        </div>
      </div>
    </div>
  );
};
