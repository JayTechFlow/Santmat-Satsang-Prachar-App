import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Sparkles,
  Compass,
  ArrowRight,
} from 'lucide-react';
import { SITE_CONFIG } from '../../../config/siteConfig';
import { SEOHead } from '../../../components/shared/SEOHead';

export const AboutPage: React.FC = () => {
  return (
    <>
      <SEOHead
        title="संस्था परिचय | About Us"
        description="संतमत सत्संग प्रचार (SANTMAT SATSANG PARCHAR) का आधिकारिक परिचय। पूज्य महर्षि मँही परमहंस जी महाराज के आध्यात्मिक विचारों, स्तुति-विनती एवं भजनों का प्रचार-प्रसार।"
        canonicalPath="/about"
      />

      {/* Hero / Header */}
      <section className="bg-gradient-to-b from-amber-50 to-white border-b border-stone-200 py-14 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold mb-4">
            <ShieldCheck className="w-4 h-4 text-amber-700" />
            <span>संस्था परिचय • About The Organization</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-stone-900 tracking-tight mb-4">
            {SITE_CONFIG.orgNameHindi}
          </h1>
          <p className="text-xs sm:text-sm font-bold text-amber-700 uppercase tracking-widest mb-6">
            {SITE_CONFIG.orgName}
          </p>

          <p className="text-base sm:text-lg text-stone-600 leading-relaxed font-medium">
            सद्गुरु महर्षि मँही परमहंस जी महाराज एवं पूज्यपाद महर्षि संतसेवी परमहंस जी महाराज के
            दिव्य आध्यात्मिक संदेश, स्तुति-विनती, और संतमत साहित्य के निस्वार्थ प्रचार-प्रसार के लिए समर्पित।
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-14 sm:py-18 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 text-stone-700 leading-relaxed">
          {/* Mission & Purpose */}
          <div className="space-y-4">
            <h2 className="text-2xl font-black text-stone-900 flex items-center gap-2.5">
              <Compass className="w-6 h-6 text-amber-600" />
              <span>हमारा पावन ध्येय एवं संकल्प (Our Mission)</span>
            </h2>
            <p className="text-sm sm:text-base">
              <strong>{SITE_CONFIG.orgName}</strong> का एकमात्र उद्देश्य मानव समाज में आत्म-कल्याण, सदाचार,
              नैतिकता और शुद्ध आंतरिक ध्यान-साधना का प्रचार करना है। संतमत किसी संप्रदाय या पंथ तक सीमित नहीं है,
              अपितु यह समस्त संतों की सर्वमान्य और सार्वभौमिक आध्यात्मिक विचारधारा है।
            </p>
            <p className="text-sm sm:text-base">
              आज के डिजिटल युग में, जब भ्रामक और अनधिकृत सामग्री का प्रसार बढ़ रहा है, हमारी संस्था ने यह संकल्प लिया है
              कि पूज्य सद्गुरुओं की प्रामाणिक स्तुति, भजन, प्रवचन और पुस्तकों को एक विश्वसनीय, आधिकारिक और विज्ञापन-मुक्त
              माध्यम से जन-जन तक पहुँचाया जाए।
            </p>
          </div>

          {/* Core Values / 4 Pillars */}
          <div className="space-y-4">
            <h2 className="text-2xl font-black text-stone-900 flex items-center gap-2.5">
              <Sparkles className="w-6 h-6 text-amber-600" />
              <span>संतमत के मूल सिद्धांत (Core Pillars of Santmat)</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/70">
                <h3 className="font-bold text-stone-900 text-sm mb-1">1. सदाचार एवं संयम (Righteous Conduct)</h3>
                <p className="text-xs text-stone-600">
                  झूठ, चोरी, नशा, हिंसा और व्यभिचार—इन पंच पापों का त्याग कर पवित्र एवं सात्विक जीवन जीना।
                </p>
              </div>

              <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/70">
                <h3 className="font-bold text-stone-900 text-sm mb-1">2. सत्संग एवं सत्-साहित्य (Holy Association)</h3>
                <p className="text-xs text-stone-600">
                  सतगुरुओं के वचनों, उपदेशों एवं आध्यात्मिक ग्रंथों का नित्य श्रवण, पठन एवं मनन करना।
                </p>
              </div>

              <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/70">
                <h3 className="font-bold text-stone-900 text-sm mb-1">3. स्तुति-विनती एवं गुरु-सेवा (Devotion)</h3>
                <p className="text-xs text-stone-600">
                  प्रातः एवं सांध्य काल में नियमित स्तुति पाठ और निष्काम भाव से सद्गुरु एवं जीवों की सेवा।
                </p>
              </div>

              <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/70">
                <h3 className="font-bold text-stone-900 text-sm mb-1">4. आन्तरिक ध्यान-साधना (Meditation)</h3>
                <p className="text-xs text-stone-600">
                  मानस जप, मानस ध्यान, दृष्टि-योग (प्रकाश साधना) एवं शब्द-योग (नाद साधना) द्वारा प्रभु दर्शन।
                </p>
              </div>
            </div>
          </div>

          {/* Organization Verification & Identity */}
          <div className="p-6 sm:p-8 rounded-2xl bg-stone-50 border border-stone-200 space-y-4">
            <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-600" />
              <span>आधिकारिक संस्था विवरण (Official Organization Details)</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div>
                <span className="font-semibold text-stone-500 block">संस्था का नाम (Entity Name):</span>
                <span className="font-bold text-stone-900">{SITE_CONFIG.orgName}</span>
                <span className="block text-stone-600">({SITE_CONFIG.orgNameHindi})</span>
              </div>

              <div>
                <span className="font-semibold text-stone-500 block">प्राथमिक आधिकारिक वेबसाइट:</span>
                <span className="font-bold text-amber-700 font-mono">
                  https://santmatsatsangparchar.in
                </span>
              </div>

              <div>
                <span className="font-semibold text-stone-500 block">आधिकारिक संपर्क ईमेल:</span>
                <a
                  href={`mailto:${SITE_CONFIG.contactEmail}`}
                  className="font-bold text-stone-900 hover:text-amber-700"
                >
                  {SITE_CONFIG.contactEmail}
                </a>
              </div>

              <div>
                <span className="font-semibold text-stone-500 block">मुख्यालय एवं आश्रम:</span>
                <span className="text-stone-800">{SITE_CONFIG.ashramHeadquarters}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-stone-200 text-xs text-stone-500">
              <p>
                <strong>महत्वपूर्ण सूचना:</strong> यह संस्था पूर्णतः गैर-व्यावसायिक, आध्यात्मिक एवं सेवाभावी है।
                हमारा उद्देश्य किसी भी प्रकार का आर्थिक लाभ प्राप्त करना नहीं है।
              </p>
            </div>
          </div>

          {/* Navigation CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-stone-200">
            <Link
              to="/mobile-app"
              className="inline-flex items-center gap-2 text-sm font-bold text-amber-700 hover:text-amber-800"
            >
              <span>आधिकारिक मोबाइल ऐप के बारे में जानें</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/contact"
              className="inline-flex items-center gap-2 text-sm font-bold text-stone-700 hover:text-stone-900"
            >
              <span>संपर्क करें (Contact Us)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};
