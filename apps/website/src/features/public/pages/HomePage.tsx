import React from 'react';
import { Link } from 'react-router-dom';
import {
  Smartphone,
  BookOpen,
  Music,
  Sunrise,
  ShieldCheck,
  CheckCircle,
  Sparkles,
  ArrowRight,
  Lock,
} from 'lucide-react';
import { SITE_CONFIG } from '../../../config/siteConfig';
import { SEOHead } from '../../../components/shared/SEOHead';

export const HomePage: React.FC = () => {
  return (
    <>
      <SEOHead
        title="संतमत सत्संग प्रचार — आधिकारिक संस्था वेबसाइट"
        description="संतमत सत्संग प्रचार (SANTMAT SATSANG PARCHAR) की आधिकारिक वेबसाइट। महर्षि मँही परमहंस जी महाराज के विचारों, स्तुति-विनती, सत्संग प्रवचन एवं भजनों का पावन संगम।"
        canonicalPath="/"
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-amber-50/80 via-white to-amber-50/30 border-b border-stone-200/80 pt-16 pb-20 sm:pt-24 sm:pb-28">
        {/* Subtle background ornamentation */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none flex items-center justify-center">
          <span className="text-[28rem] font-serif select-none">ॐ</span>
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Official Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200 text-xs sm:text-sm font-bold shadow-xs mb-6">
            <ShieldCheck className="w-4 h-4 text-amber-700" />
            <span>आधिकारिक संस्था वेबसाइट • Official Organization Website</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-stone-900 tracking-tight leading-[1.15] mb-6">
            {SITE_CONFIG.orgNameHindi}
          </h1>

          <p className="text-base sm:text-xl text-stone-600 max-w-3xl mx-auto leading-relaxed mb-8 font-medium">
            परम पूज्य संत सद्गुरु महर्षि मँही परमहंस जी महाराज के पावन ज्ञान,
            स्तुति-विनती, सत्संग प्रवचन, संतमत भजन एवं आत्म-कल्याणकारी संदेशों का आधिकारिक मंच।
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-2xl mx-auto">
            <Link
              to="/mobile-app"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-md shadow-amber-600/25 transition-all hover:shadow-lg active:scale-95"
            >
              <Smartphone className="w-5 h-5" />
              <span>आधिकारिक मोबाइल ऐप</span>
              <span className="bg-amber-800/80 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-semibold">
                Coming Soon
              </span>
            </Link>

            <Link
              to="/about"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-stone-50 text-stone-800 font-bold text-sm border border-stone-300 shadow-xs transition-all active:scale-95"
            >
              <span>संस्था के बारे में जानें</span>
              <ArrowRight className="w-4 h-4 text-stone-500" />
            </Link>

            <a
              href={SITE_CONFIG.routes.adminLogin}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-sm shadow-md shadow-stone-900/20 transition-all hover:shadow-lg active:scale-95"
            >
              <Lock className="w-4 h-4 text-amber-400" />
              <span>ADMIN LOGIN</span>
              <span className="bg-stone-700/70 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-semibold text-amber-300">
                प्रशासक
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* Official Business Identity & Hierarchy Block */}
      <section className="py-12 bg-white border-b border-stone-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50/50 border border-amber-200/80 shadow-xs">
            <div className="text-center mb-6">
              <span className="text-xs font-bold text-amber-700 tracking-wider uppercase block mb-1">
                आधिकारिक संस्था संरचना एवं पहचान
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-stone-900">
                Official Business & Organizational Identity
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center items-center">
              {/* Step 1 */}
              <div className="p-5 rounded-xl bg-white border border-stone-200/80 shadow-xs flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold mb-3">
                  1
                </div>
                <h3 className="font-bold text-stone-900 text-sm mb-1">{SITE_CONFIG.orgName}</h3>
                <p className="text-xs text-stone-500">संतमत सत्संग प्रचार (संस्था)</p>
                <div className="mt-2 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md">
                  Official Entity
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-5 rounded-xl bg-white border-2 border-amber-400 shadow-xs flex flex-col items-center relative">
                <div className="w-12 h-12 rounded-full bg-amber-600 flex items-center justify-center text-white font-bold mb-3">
                  2
                </div>
                <h3 className="font-bold text-stone-900 text-sm mb-1">Official Organization Website</h3>
                <p className="text-xs font-mono text-amber-700 font-bold">santmatsatsangparchar.in</p>
                <div className="mt-2 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-emerald-600" />
                  Primary Public Domain
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-5 rounded-xl bg-white border border-stone-200/80 shadow-xs flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold mb-3">
                  3
                </div>
                <h3 className="font-bold text-stone-900 text-sm mb-1">Official Mobile Application</h3>
                <p className="text-xs text-stone-500">{SITE_CONFIG.mobileApp.name}</p>
                <div className="mt-2 text-[11px] font-semibold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-md">
                  Google Play: Coming Soon
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Devotional Offerings / Features Section */}
      <section className="py-16 sm:py-20 bg-[#FDFBF7]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold text-amber-700 tracking-wider uppercase block mb-2">
              आत्म-कल्याण एवं साधना
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-stone-900 tracking-tight mb-4">
              संतमत के पावन स्तंभ
            </h2>
            <p className="text-sm sm:text-base text-stone-600">
              सतगुरु महर्षि मँही परमहंस जी महाराज की अमृतवाणी एवं संतमत की शुद्ध आध्यात्मिक परंपरा को समर्पित।
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: Stuti Vinati */}
            <div className="p-6 rounded-2xl bg-white border border-stone-200/80 shadow-xs hover:border-amber-300 hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                <Sunrise className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-stone-900 mb-2">दैनिक स्तुति-विनती</h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                प्रातःकालीन एवं सांध्यकालीन नियमित स्तुति, पद्य, प्रार्थना एवं गुरु वंदना का पवित्र संकलन।
              </p>
            </div>

            {/* Card 2: Bhajans */}
            <div className="p-6 rounded-2xl bg-white border border-stone-200/80 shadow-xs hover:border-amber-300 hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                <Music className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-stone-900 mb-2">संतमत भजन संग्रह</h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                हृदयस्पर्शी भजन, पद एवं कीर्तन। उच्च गुणवत्ता ऑडियो में निर्बाध सत्संग श्रवण की सुविधा।
              </p>
            </div>

            {/* Card 3: Books */}
            <div className="p-6 rounded-2xl bg-white border border-stone-200/80 shadow-xs hover:border-amber-300 hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-stone-900 mb-2">सत्संग साहित्य एवं ग्रंथ</h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                महर्षि संतसेवी परमहंस जी महाराज एवं महर्षि मँही आश्रम द्वारा प्रकाशित आध्यात्मिक साहित्य।
              </p>
            </div>

            {/* Card 4: Suvichar */}
            <div className="p-6 rounded-2xl bg-white border border-stone-200/80 shadow-xs hover:border-amber-300 hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-stone-900 mb-2">दैनिक सुविचार एवं संदेश</h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                प्रतिदिन आत्मिक चेतना जगाने वाले पावन विचार, सदाचार के नियम एवं सद्गुरु के उपदेश।
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile App Spotlight Section */}
      <section className="py-16 sm:py-20 bg-stone-900 text-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold mb-4">
                <Smartphone className="w-3.5 h-3.5" />
                <span>Google Play Store • Coming Soon</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight mb-4">
                {SITE_CONFIG.mobileApp.name} मोबाइल ऐप
              </h2>

              <p className="text-stone-300 text-sm sm:text-base leading-relaxed mb-6">
                सत्संगियों एवं साधकों के लिए समर्पित आधिकारिक मोबाइल एप्लिकेशन।
                विज्ञापन-मुक्त, पूर्णतः आध्यात्मिक एवं सहज अनुभव के साथ सत्संग से जुड़ें।
              </p>

              <ul className="space-y-3 mb-8 text-xs sm:text-sm text-stone-300">
                <li className="flex items-center gap-2.5">
                  <CheckCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>स्क्रीन लॉक होने पर भी पृष्ठभूमि में निरंतर ऑडियो भजन श्रवण</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>दैनिक प्रातः एवं सांध्य स्तुति पाठ की संपूर्ण पुस्तक</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>शून्य विज्ञापन — 100% नि:शुल्क एवं समर्पित सेवा भाव</span>
                </li>
              </ul>

              <div className="flex flex-wrap items-center gap-4">
                <Link
                  to="/mobile-app"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-md transition-all"
                >
                  <span>मोबाइल ऐप का संपूर्ण विवरण देखें</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <div className="px-4 py-2.5 rounded-xl bg-stone-800 border border-stone-700 text-stone-400 text-xs font-semibold">
                  <span>Google Play Store पर शीघ्र उपलब्ध</span>
                </div>
              </div>
            </div>

            {/* App Preview Mockup Box */}
            <div className="flex justify-center">
              <div className="w-full max-w-sm p-6 rounded-3xl bg-stone-800/90 border border-stone-700 shadow-2xl text-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-600 to-amber-700 text-white font-black text-3xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-600/30">
                  ॐ
                </div>
                <h3 className="text-lg font-bold text-white mb-1">
                  {SITE_CONFIG.mobileApp.name}
                </h3>
                <p className="text-xs text-amber-400 font-semibold mb-4">
                  आधिकारिक मोबाइल ऐप • Android
                </p>
                <div className="p-3.5 rounded-xl bg-stone-900/80 border border-stone-700/60 text-xs text-stone-300 mb-4">
                  <span className="font-semibold text-white block mb-1">प्रकाशन स्थिति (Publication Status):</span>
                  <span className="inline-block bg-amber-500/20 text-amber-300 border border-amber-500/40 px-3 py-1 rounded-full font-bold text-[11px]">
                    Coming Soon on Google Play
                  </span>
                </div>
                <p className="text-[11px] text-stone-400 leading-relaxed">
                  सार्वजनिक रिलीज होते ही आधिकारिक डाउनलोड लिंक सीधे यहाँ उपलब्ध कराया जाएगा।
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Transparency / Legal Badges */}
      <section className="py-14 bg-white border-t border-stone-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <Link
              to="/privacy-policy"
              className="p-5 rounded-xl border border-stone-200 bg-stone-50/60 hover:bg-amber-50/50 hover:border-amber-300 transition-all text-left group"
            >
              <h4 className="font-bold text-stone-900 text-sm mb-1 group-hover:text-amber-700 transition-colors">
                गोपनीयता नीति (Privacy Policy)
              </h4>
              <p className="text-xs text-stone-600">
                उपयोगकर्ता डेटा सुरक्षा, गोपनीयता एवं शून्य-विज्ञापन का स्पष्ट वचन।
              </p>
            </Link>

            <Link
              to="/terms"
              className="p-5 rounded-xl border border-stone-200 bg-stone-50/60 hover:bg-amber-50/50 hover:border-amber-300 transition-all text-left group"
            >
              <h4 className="font-bold text-stone-900 text-sm mb-1 group-hover:text-amber-700 transition-colors">
                नियम एवं शर्तें (Terms & Conditions)
              </h4>
              <p className="text-xs text-stone-600">
                आध्यात्मिक सेवा, उपयोग नियम एवं बौद्धिक संपदा अधिकार।
              </p>
            </Link>

            <Link
              to="/contact"
              className="p-5 rounded-xl border border-stone-200 bg-stone-50/60 hover:bg-amber-50/50 hover:border-amber-300 transition-all text-left group"
            >
              <h4 className="font-bold text-stone-900 text-sm mb-1 group-hover:text-amber-700 transition-colors">
                संपर्क एवं सहायता (Contact & Support)
              </h4>
              <p className="text-xs text-stone-600">
                ईमेल संपर्क, आश्रम का पता एवं सत्संग जिज्ञासा समाधान।
              </p>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};
