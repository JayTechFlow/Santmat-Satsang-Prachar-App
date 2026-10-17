import React from 'react';
import { Link } from 'react-router-dom';
import { Radio, Mail, Phone, MapPin, ChevronRight, FileText } from 'lucide-react';
import { SITE_CONFIG } from '../../config/siteConfig';

export const SiteFooter: React.FC = () => {
  return (
    <footer className="bg-stone-950 text-stone-300 pt-16 pb-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 pb-12 border-b border-stone-800">
          {/* Col 1: Identity & Structure */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-600 flex items-center justify-center text-white font-bold">
                <Radio className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-white font-extrabold text-base leading-tight tracking-tight">
                  {SITE_CONFIG.legalEntityName}
                </h3>
                <p className="text-[11px] font-semibold text-amber-400 tracking-wider uppercase">
                  {SITE_CONFIG.businessStructure}
                </p>
              </div>
            </div>

            <p className="text-xs text-stone-400 leading-relaxed">
              Professional Sole Proprietorship business engaged in digital content, sound recording,
              music publishing, and digital media distribution.
            </p>

            {/* Compact Business Details Box */}
            <div className="p-3.5 rounded-xl bg-stone-900 border border-stone-800 text-[11px] space-y-1.5 font-mono text-stone-300">
              <div className="text-stone-400 text-[10px] uppercase font-sans font-bold tracking-wider">
                Registration Verification
              </div>
              <div>
                <span className="text-stone-500 font-sans">Proprietor: </span>
                <span className="text-stone-200 font-sans font-semibold">
                  {SITE_CONFIG.proprietorName}
                </span>
              </div>
              <div>
                <span className="text-stone-500">GSTIN: </span>
                <span className="text-amber-300">{SITE_CONFIG.gstin}</span>
              </div>
              <div>
                <span className="text-stone-500">Udyam: </span>
                <span className="text-stone-200">{SITE_CONFIG.udyamRegistrationNumber}</span>
              </div>
            </div>
          </div>

          {/* Col 2: Business Activities */}
          <div>
            <h4 className="text-white font-bold text-xs tracking-wider uppercase mb-4 flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span>Business Activities</span>
            </h4>
            <ul className="space-y-2.5 text-xs text-stone-400">
              <li>Digital Content Production</li>
              <li>Digital Marketing</li>
              <li>Sound Recording</li>
              <li>Music Publishing</li>
              <li>Digital Media Publishing</li>
              <li>Audio Content Distribution</li>
            </ul>
          </div>

          {/* Col 3: Navigation & Legal */}
          <div>
            <h4 className="text-white font-bold text-xs tracking-wider uppercase mb-4">
              Website Navigation
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-stone-600" />
                  <span>Home</span>
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-stone-600" />
                  <span>About Us</span>
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-stone-600" />
                  <span>Services</span>
                </Link>
              </li>
              <li>
                <Link to="/mobile-app" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-stone-600" />
                  <span>Mobile App</span>
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-stone-600" />
                  <span>Contact Us</span>
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-stone-600" />
                  <span>Privacy Policy</span>
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-stone-600" />
                  <span>Terms & Conditions</span>
                </Link>
              </li>
              <li>
                <Link to="/delete-account" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-stone-600" />
                  <span>Delete Account</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Official Contact & Address */}
          <div>
            <h4 className="text-white font-bold text-xs tracking-wider uppercase mb-4">
              Registered Office & Contact
            </h4>
            <div className="space-y-3 text-xs text-stone-400">
              <div>
                <strong className="text-stone-300 block mb-0.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-amber-400" />
                  <span>Official Email:</span>
                </strong>
                <a
                  href={`mailto:${SITE_CONFIG.officialEmail}`}
                  className="text-amber-400 hover:underline font-mono text-[11px]"
                >
                  {SITE_CONFIG.officialEmail}
                </a>
              </div>

              <div>
                <strong className="text-stone-300 block mb-0.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-amber-400" />
                  <span>Phone:</span>
                </strong>
                <a
                  href={`tel:${SITE_CONFIG.officialPhone}`}
                  className="text-stone-200 hover:text-white font-mono text-[11px]"
                >
                  {SITE_CONFIG.officialPhoneFormatted}
                </a>
              </div>

              <div>
                <strong className="text-stone-300 block mb-0.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span>Registered Office:</span>
                </strong>
                <p className="text-[11px] leading-relaxed text-stone-300">
                  {SITE_CONFIG.registeredAddress.compact}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <div>
            &copy; {new Date().getFullYear()} {SITE_CONFIG.legalEntityName} ({SITE_CONFIG.businessStructure}). All Rights Reserved.
          </div>
          <div className="text-[11px] text-stone-400">
            Professional Sole Proprietorship Digital Media & Publishing Presence
          </div>
        </div>
      </div>
    </footer>
  );
};
