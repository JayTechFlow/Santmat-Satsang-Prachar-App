import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  EyeOff,
} from 'lucide-react';
import { SITE_CONFIG } from '../../../config/siteConfig';
import { SEOHead } from '../../../components/shared/SEOHead';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <>
      <SEOHead
        title="गोपनीयता नीति | Privacy Policy"
        description="संतमत सत्संग प्रचार (SANTMAT SATSANG PARCHAR) की आधिकारिक गोपनीयता नीति। उपयोगकर्ता डेटा सुरक्षा, शून्य विज्ञापन नीति, एवं खाता विलोपन अधिकार।"
        canonicalPath="/privacy-policy"
      />

      {/* Header */}
      <section className="bg-gradient-to-b from-amber-50 to-white border-b border-stone-200 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold mb-4">
            <ShieldCheck className="w-4 h-4 text-amber-700" />
            <span>आधिकारिक वैधानिक नीति • Legal Document</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-stone-900 tracking-tight mb-3">
            गोपनीयता नीति (Privacy Policy)
          </h1>
          <p className="text-xs sm:text-sm font-bold text-amber-700 uppercase tracking-widest mb-4">
            {SITE_CONFIG.orgName}
          </p>

          <p className="text-xs text-stone-500 font-medium">
            अंतिम अद्यतन (Last Updated): October 2026 • प्रभावी तिथि (Effective Date): October 2026
          </p>
        </div>
      </section>

      {/* Main Legal Content */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 text-stone-700 leading-relaxed text-sm sm:text-base">
          {/* Intro Box */}
          <div className="p-5 sm:p-6 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
            <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <EyeOff className="w-5 h-5 text-amber-700" />
              <span>मुख्य सिद्धांत (Zero-Monetization Pledge)</span>
            </h2>
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
              <strong>{SITE_CONFIG.orgName}</strong> ("हम", "हमारी संस्था", या "ऐप") के अंतर्गत संचालित
              आधिकारिक वेबसाइट <a href={SITE_CONFIG.siteUrl} className="font-mono text-amber-800 font-bold hover:underline">https://santmatsatsangparchar.in</a> एवं
              मोबाइल एप्लिकेशन <strong>{SITE_CONFIG.mobileApp.name}</strong> पूर्णतः आध्यात्मिक, निःशुल्क एवं धार्मिक सेवा के लिए समर्पित हैं।
              हम किसी भी तीसरे पक्ष के विज्ञापन नेटवर्क (Third-party Ad Networks) का उपयोग नहीं करते हैं,
              और न ही आपका व्यक्तिगत डेटा किसी को बेचते अथवा साझा करते हैं।
            </p>
          </div>

          {/* Section 1 */}
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-stone-900 border-b border-stone-200 pb-2">
              1. एकत्र की जाने वाली जानकारी (Information We Collect)
            </h2>
            <p>
              जब आप हमारे मोबाइल ऐप या वेबसाइट सेवाओं का उपयोग करते हैं, तो हम सेवा संचालन एवं बेहतर अनुभव हेतु निम्नलिखित सीमित जानकारी एकत्र कर सकते हैं:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-stone-600 text-xs sm:text-sm">
              <li>
                <strong>प्रमाणीकरण जानकारी (Authentication Data):</strong> Google साइन-इन या फ़ोन नंबर (Firebase Authentication) के माध्यम से आपका नाम, ईमेल पता अथवा फ़ोन नंबर।
              </li>
              <li>
                <strong>उपयोगकर्ता प्रोफ़ाइल (User Profile):</strong> आपके द्वारा निर्धारित नाम और यदि आप चाहें तो स्वेच्छा से अपलोड की गई प्रोफ़ाइल फ़ोटो।
              </li>
              <li>
                <strong>साधना एवं प्राथमिकताएं (Preferences & History):</strong> आपकी पसंदीदा भजन सूची (Favorites), सुनने का इतिहास (Audio Listening History), और ऐप भाषा प्राथमिकताएं।
              </li>
              <li>
                <strong>तकनीकी एवं त्रुटि रिपोर्ट (Diagnostics & Crash Reports):</strong> ऐप की स्थिरता बनाए रखने हेतु अनाम क्रैश लॉग (Firebase Crashlytics) तथा मूलभूत उपयोग मेट्रिक्स (Firebase Analytics)।
              </li>
            </ul>
          </div>

          {/* Section 2 */}
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-stone-900 border-b border-stone-200 pb-2">
              2. डिवाइस अनुमतियों का उपयोग (Device Permissions Rationale)
            </h2>
            <p>
              हमारा ऐप केवल उन्हीं अनुमतियों का अनुरोध करता है जो इसके मुख्य आध्यात्मिक कार्यों के लिए नितांत आवश्यक हैं:
            </p>
            <div className="space-y-3 text-xs sm:text-sm">
              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200">
                <strong className="text-stone-900 block mb-0.5">
                  फ़ोरग्राउंड सेवा एवं मीडिया प्लेबैक (Foreground Service - Media Playback):
                </strong>
                <span>
                  स्क्रीन लॉक होने अथवा अन्य ऐप का उपयोग करते समय निर्बाध रूप से सत्संग प्रवचन एवं भजन सुनाने के लिए आवश्यक है।
                  यह अनुमति केवल सक्रिय प्लेबैक के दौरान ही उपयोग की जाती है।
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200">
                <strong className="text-stone-900 block mb-0.5">
                  कैमरा एवं फोटो लाइब्रेरी (Camera & Gallery):
                </strong>
                <span>
                  केवल तभी अनुरोध किया जाता है जब उपयोगकर्ता अपनी प्रोफ़ाइल फोटो स्वयं बदलना चाहे। यह पूर्णतः वैकल्पिक है।
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200">
                <strong className="text-stone-900 block mb-0.5">
                  सूचनाएं (Push Notifications):
                </strong>
                <span>
                  दैनिक सुविचार, महत्वपूर्ण सत्संग तिथियों एवं नए भजनों के संबंध में पावन संदेश प्रेषित करने के लिए।
                </span>
              </div>
            </div>
          </div>

          {/* Section 3 */}
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-stone-900 border-b border-stone-200 pb-2">
              3. डेटा सुरक्षा एवं भंडारण (Data Security & Infrastructure)
            </h2>
            <p>
              हम Google Cloud एवं Firebase के विश्वस्तरीय सुरक्षित सर्वर अवसंरचना का उपयोग करते हैं।
              सभी नेटवर्क संचार TLS 1.3 एन्क्रिप्शन द्वारा सुरक्षित होते हैं और डेटाबेस में संग्रहीत डेटा AES-256
              एन्क्रिप्शन मानकों के अनुसार सुरक्षित रहता है।
            </p>
          </div>

          {/* Section 4 */}
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-stone-900 border-b border-stone-200 pb-2">
              4. खाता एवं डेटा विलोपन अधिकार (Account & Data Deletion)
            </h2>
            <p>
              Google Play डेवलपर नीतियों एवं भारतीय सूचना प्रौद्योगिकी नियमों के अनुपालन में,
              प्रत्येक उपयोगकर्ता को अपने खाते और उससे जुड़े सभी व्यक्तिगत डेटा को स्थायी रूप से हटाने का पूर्ण अधिकार है:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
                <strong className="text-stone-900 block mb-1">विधि 1: ऐप के भीतर से</strong>
                <p className="text-xs text-stone-600">
                  प्रोफ़ाइल (Profile) &gt; खाता एवं सुरक्षा (Account & Security) &gt; <strong>खाता हटाएं (Delete Account)</strong> पर टैप करें। खाता तुरंत हट जाएगा।
                </p>
              </div>

              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
                <strong className="text-stone-900 block mb-1">विधि 2: समर्पित वेब पृष्ठ द्वारा</strong>
                <p className="text-xs text-stone-600">
                  आप हमारे वेब विलोपन पृष्ठ <Link to="/delete-account" className="text-amber-700 font-bold hover:underline">Account Deletion Page</Link> पर जाकर भी विलोपन अनुरोध सबमिट कर सकते हैं।
                </p>
              </div>
            </div>
          </div>

          {/* Section 5 */}
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-stone-900 border-b border-stone-200 pb-2">
              5. संपर्क सूत्र एवं शिकायत निवारण (Grievance & Contact)
            </h2>
            <p>
              यदि इस गोपनीयता नीति अथवा अपने डेटा से संबंधित कोई भी प्रश्न या जिज्ञासा है,
              तो आप हमारी संस्था से सीधे संपर्क कर सकते हैं:
            </p>
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm space-y-1">
              <p><strong>संस्था:</strong> {SITE_CONFIG.orgName} ({SITE_CONFIG.orgNameHindi})</p>
              <p>
                <strong>आधिकारिक ईमेल:</strong>{' '}
                <a href={`mailto:${SITE_CONFIG.contactEmail}`} className="text-amber-800 font-bold hover:underline font-mono">
                  {SITE_CONFIG.contactEmail}
                </a>
              </p>
              <p>
                <strong>आधिकारिक वेबसाइट:</strong>{' '}
                <span className="font-mono text-stone-900">https://santmatsatsangparchar.in</span>
              </p>
              <p><strong>मुख्यालय:</strong> {SITE_CONFIG.ashramHeadquarters}</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
