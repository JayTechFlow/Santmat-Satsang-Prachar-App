import React from 'react';
import { Link } from 'react-router-dom';
import {
  Smartphone,
  ShieldCheck,
  Lock,
  Headphones,
  BookOpen,
  Trash2,
  FileText,
  Clock,
  ArrowLeft,
} from 'lucide-react';
import { SITE_CONFIG } from '../../../config/siteConfig';
import { SEOHead } from '../../../components/shared/SEOHead';

export const MobileAppPage: React.FC = () => {
  return (
    <>
      <SEOHead
        title="आधिकारिक मोबाइल ऐप | Official Mobile Application"
        description="संतमत सत्संग प्रचार (Santmat Satsang Prachar) का आधिकारिक एंड्रॉइड मोबाइल ऐप। दैनिक स्तुति-विनती, संतमत भजन, एवं आध्यात्मिक पुस्तकें। Google Play Store पर शीघ्र उपलब्ध।"
        canonicalPath="/mobile-app"
        structuredData={{
          '@type': 'MobileApplication',
          name: SITE_CONFIG.mobileApp.name,
          operatingSystem: 'Android',
          applicationCategory: 'LifestyleApplication',
          publisher: {
            '@type': 'Organization',
            name: SITE_CONFIG.orgName,
            url: SITE_CONFIG.siteUrl,
          },
        }}
      />

      {/* Header / Hero */}
      <section className="bg-gradient-to-b from-amber-50 via-white to-amber-50/40 border-b border-stone-200 py-14 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Back to Homepage Link */}
          <div className="mb-6">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 hover:text-amber-950 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>आधिकारिक वेबसाइट मुख्य पृष्ठ पर वापस जाएँ (Back to Home)</span>
            </Link>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold mb-4">
            <Smartphone className="w-4 h-4 text-amber-700" />
            <span>Official Mobile Application • Android</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-stone-900 tracking-tight mb-3">
            {SITE_CONFIG.mobileApp.name}
          </h1>
          <p className="text-xs sm:text-sm font-bold text-amber-700 uppercase tracking-widest mb-6">
            {SITE_CONFIG.mobileApp.englishName}
          </p>

          <p className="text-base sm:text-lg text-stone-600 leading-relaxed font-medium max-w-2xl mx-auto mb-8">
            सत्संगियों, ध्यानियों एवं साधकों के लिए निर्मित आधिकारिक मोबाइल ऐप्लिकेशन।
            भजन, स्तुति-विनती एवं आध्यात्मिक साहित्य का समग्र संग्रह।
          </p>

          {/* Official Hierarchy & Relationship Block */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white border border-stone-200/90 shadow-xs max-w-xl mx-auto text-left">
            <div className="flex items-center gap-2 font-bold text-stone-900 text-xs uppercase tracking-wider mb-3">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>आधिकारिक संस्था एवं ऐप संबंध (Business Hierarchy)</span>
            </div>
            <div className="space-y-2 text-xs text-stone-700">
              <div className="flex items-center gap-2">
                <span className="font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded text-[11px]">
                  1. संस्था
                </span>
                <span className="font-semibold">{SITE_CONFIG.orgName}</span>
              </div>
              <div className="text-stone-400 pl-4">↓</div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded text-[11px]">
                  2. आधिकारिक वेबसाइट
                </span>
                <a
                  href={SITE_CONFIG.siteUrl}
                  className="font-mono text-amber-700 font-bold hover:underline"
                >
                  https://santmatsatsangparchar.in
                </a>
              </div>
              <div className="text-stone-400 pl-4">↓</div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded text-[11px]">
                  3. आधिकारिक मोबाइल ऐप
                </span>
                <span className="font-semibold text-emerald-800">
                  {SITE_CONFIG.mobileApp.name} (Android App)
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Play Store Status & Download Notice */}
      <section className="py-12 bg-white border-b border-stone-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 rounded-2xl bg-stone-900 text-white shadow-xl text-center relative overflow-hidden">
            <div className="w-16 h-16 rounded-2xl bg-amber-600 flex items-center justify-center text-white text-3xl font-black mx-auto mb-4 shadow-lg shadow-amber-600/30">
              ॐ
            </div>

            <h2 className="text-xl sm:text-2xl font-bold mb-2">
              Google Play Store प्रकाशन स्थिति
            </h2>

            {/* Strict Notice: NO fake URLs. "Coming Soon" only. */}
            <div className="my-5 inline-block">
              <div className="px-6 py-3 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-sm font-black tracking-wide flex items-center gap-2">
                <Clock className="w-4 h-4 animate-pulse" />
                <span>COMING SOON • गूगल प्ले स्टोर पर शीघ्र उपलब्ध</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-stone-300 max-w-md mx-auto leading-relaxed mb-6">
              हमारा ऐप वर्तमान में Google Play Store की अंतिम समीक्षा एवं विमोचन प्रक्रिया में है।
              सत्यापित होने के पश्चात आधिकारिक Play Store लिंक तुरंत यहाँ प्रकाशित किया जाएगा।
            </p>

            <div className="p-3.5 rounded-xl bg-stone-800/80 border border-stone-700/80 text-[11px] text-stone-400 max-w-lg mx-auto">
              <span className="text-amber-400 font-semibold block mb-0.5">सावधानी एवं प्रमाणिकता:</span>
              कृपया किसी भी अनाधिकृत तृतीय-पक्ष वेबसाइट या अज्ञात स्रोत से कोई APK फाइल डाउनलोड न करें।
              केवल इस आधिकारिक डोमेन पर जारी Play Store लिंक ही प्रामाणिक होगा।
            </div>
          </div>
        </div>
      </section>

      {/* Mobile App Core Features */}
      <section className="py-16 sm:py-20 bg-[#FDFBF7]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900 mb-3">
              मोबाइल ऐप की प्रमुख विशेषताएं
            </h2>
            <p className="text-xs sm:text-sm text-stone-600">
              साधक की आवश्यकताओं को ध्यान में रखकर पूर्णतः एकाग्रता एवं सुविधा के साथ निर्मित।
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-stone-200/80 shadow-xs flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <Headphones className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-stone-900 text-base mb-1">
                  बैकग्राउंड ऑडियो प्लेबैक (Background Playback)
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  स्क्रीन बंद होने या अन्य एप्लिकेशन का उपयोग करते हुए भी ऑडियो निर्बाध रूप से चलता है।
                  लॉक स्क्रीन पर नोटिफिकेशन प्लेयर नियंत्रण उपलब्ध है।
                </p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-stone-200/80 shadow-xs flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-stone-900 text-base mb-1">
                  प्रातः एवं सांध्य स्तुति-विनती
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  स्तुति-विनती, पद्य एवं गुरु वंदना का स्पष्ट देवनागरी पाठ।
                  फ़ॉन्ट आकार बदलने एवं ऑडियो के साथ पढ़ने की सुविधा।
                </p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-stone-200/80 shadow-xs flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-stone-900 text-base mb-1">
                  100% विज्ञापन-मुक्त (Completely Ad-Free)
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  कोई पॉप-अप, बैनर या वीडियो विज्ञापन नहीं। शुद्ध साधना एवं ध्यान के लिए पूर्णतः
                  शांत एवं आध्यात्मिक वातावरण।
                </p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-stone-200/80 shadow-xs flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-stone-900 text-base mb-1">
                  सुरक्षित प्रमाणीकरण एवं डेटा निजता
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  Google साइन-इन या फ़ोन नंबर से सुरक्षित लॉगिन। आपकी पसंदीदा सूची और इतिहास
                  क्लाउड पर सुरक्षित रहता है।
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mandatory Canonical Legal Links for Google Play Compliance */}
      <section className="py-14 bg-white border-t border-stone-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-6 sm:p-8 rounded-2xl bg-amber-50/60 border border-amber-200">
            <h3 className="text-lg font-bold text-stone-900 mb-2 flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-700" />
              <span>Google Play नीति एवं वैधानिक दस्तावेज (Policy & Legal Compliance)</span>
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 mb-6 leading-relaxed">
              Google Play डेवलपर नीतियों के अनुसार, ऐप से संबंधित सभी वैधानिक नीतियां,
              डेटा सुरक्षा मानक, एवं खाता विलोपन प्रक्रिया आधिकारिक सार्वजनिक वेबसाइट पर उपलब्ध हैं:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link
                to="/privacy-policy"
                className="p-4 rounded-xl bg-white border border-stone-200 hover:border-amber-400 hover:shadow-xs transition-all"
              >
                <div className="flex items-center gap-2 font-bold text-stone-900 text-xs mb-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>गोपनीयता नीति</span>
                </div>
                <p className="text-[11px] text-stone-500 font-mono">
                  https://santmatsatsangparchar.in/privacy-policy
                </p>
              </Link>

              <Link
                to="/terms"
                className="p-4 rounded-xl bg-white border border-stone-200 hover:border-amber-400 hover:shadow-xs transition-all"
              >
                <div className="flex items-center gap-2 font-bold text-stone-900 text-xs mb-1">
                  <FileText className="w-4 h-4 text-amber-600" />
                  <span>नियम एवं शर्तें</span>
                </div>
                <p className="text-[11px] text-stone-500 font-mono">
                  https://santmatsatsangparchar.in/terms
                </p>
              </Link>

              <Link
                to="/delete-account"
                className="p-4 rounded-xl bg-white border border-stone-200 hover:border-amber-400 hover:shadow-xs transition-all"
              >
                <div className="flex items-center gap-2 font-bold text-stone-900 text-xs mb-1">
                  <Trash2 className="w-4 h-4 text-red-600" />
                  <span>खाता एवं डेटा विलोपन</span>
                </div>
                <p className="text-[11px] text-stone-500 font-mono">
                  https://santmatsatsangparchar.in/delete-account
                </p>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
