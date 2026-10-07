import React from 'react';
import {
  FileText,
} from 'lucide-react';
import { SITE_CONFIG } from '../../../config/siteConfig';
import { SEOHead } from '../../../components/shared/SEOHead';

export const TermsPage: React.FC = () => {
  return (
    <>
      <SEOHead
        title="नियम एवं शर्तें | Terms & Conditions"
        description="संतमत सत्संग प्रचार (SANTMAT SATSANG PARCHAR) के उपयोग के नियम एवं शर्तें। आध्यात्मिक सेवाओं का सदुपयोग, बौद्धिक संपदा अधिकार एवं आचरण संहिता।"
        canonicalPath="/terms"
      />

      {/* Header */}
      <section className="bg-gradient-to-b from-amber-50 to-white border-b border-stone-200 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold mb-4">
            <FileText className="w-4 h-4 text-amber-700" />
            <span>आधिकारिक नियम व शर्तें • Terms of Service</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-stone-900 tracking-tight mb-3">
            नियम एवं शर्तें (Terms & Conditions)
          </h1>
          <p className="text-xs sm:text-sm font-bold text-amber-700 uppercase tracking-widest mb-4">
            {SITE_CONFIG.orgName}
          </p>

          <p className="text-xs text-stone-500 font-medium">
            अंतिम अद्यतन (Last Updated): October 2026
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 text-stone-700 leading-relaxed text-sm sm:text-base">
          {/* Agreement Notice */}
          <div className="p-5 sm:p-6 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
            <h2 className="text-lg font-bold text-stone-900">
              सेवा स्वीकृति (Acceptance of Terms)
            </h2>
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
              इस आधिकारिक वेबसाइट (<strong>{SITE_CONFIG.siteUrl}</strong>) अथवा हमारे आधिकारिक मोबाइल एप्लिकेशन
              (<strong>{SITE_CONFIG.mobileApp.name}</strong>) का उपयोग करके आप इन नियमों एवं शर्तों से बाध्य होने की सहमति प्रदान करते हैं।
              यदि आप इन शर्तों से सहमत नहीं हैं, तो कृपया सेवाओं का उपयोग न करें।
            </p>
          </div>

          {/* Section 1 */}
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-stone-900 border-b border-stone-200 pb-2">
              1. सेवा का आध्यात्मिक स्वरूप (Devotional & Non-Commercial Nature)
            </h2>
            <p>
              {SITE_CONFIG.orgName} द्वारा प्रदान की जाने वाली समस्त सेवाएं—जिनमें स्तुति-विनती, संतमत भजन,
              सुविचार और आध्यात्मिक पुस्तकें सम्मिलित हैं—पूर्णतः निःशुल्क, आध्यात्मिक और सेवाभाव से प्रेरित हैं।
              इनका उद्देश्य केवल साधकों के आंतरिक आत्म-कल्याण और संतवाणी का प्रचार करना है।
            </p>
          </div>

          {/* Section 2 */}
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-stone-900 border-b border-stone-200 pb-2">
              2. बौद्धिक संपदा एवं सामग्री का उपयोग (Intellectual Property)
            </h2>
            <p>
              वेबसाइट और मोबाइल ऐप पर उपलब्ध सभी स्तुति पाठ, भजन, प्रवचन, ऑडियो ट्रैक और ग्रंथ
              महर्षि मँही आश्रम एवं संबंधित रचनाकारों की आध्यात्मिक और बौद्धिक धरोहर हैं:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-stone-600 text-xs sm:text-sm">
              <li>सामग्री का उपयोग केवल व्यक्तिगत, गैर-व्यावसायिक और भक्ति साधना के लिए किया जा सकता है।</li>
              <li>किसी भी ऑडियो, ग्रंथ या अंश का व्यावसायिक मुद्रीकरण (Commercial Exploitation) पूर्णतः वर्जित है।</li>
              <li>सामग्री को विकृत, अनधिकृत रूप से संपादित या किसी अनैतिक संदर्भ में उपयोग नहीं किया जा सकता।</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-stone-900 border-b border-stone-200 pb-2">
              3. उपयोगकर्ता आचरण संहिता (User Code of Conduct)
            </h2>
            <p>
              उपयोगकर्ता सहमत हैं कि वे सेवा का उपयोग करते समय किसी भी प्रकार के अनधिकृत, अवैध अथवा
              संतमत की मर्यादा के प्रतिकूल कार्य नहीं करेंगे। किसी भी प्रकार के स्पैम, सर्वर पर अवांछित भार डालने,
              अथवा रिवर्स इंजीनियरिंग का प्रयास करने पर उपयोगकर्ता खाते को तुरंत निलंबित या समाप्त किया जा सकता है।
            </p>
          </div>

          {/* Section 4 */}
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-stone-900 border-b border-stone-200 pb-2">
              4. दायित्व की सीमा (Limitation of Liability)
            </h2>
            <p>
              हम सेवाएं "जैसी हैं" (As-Is) और "जैसी उपलब्ध हैं" (As-Available) के आधार पर प्रदान करते हैं।
              यद्यपि हम निर्बाध सेवा सुनिश्चित करने के लिए हर संभव तकनीकी प्रयास करते हैं, तथापि इंटरनेट
              कनेक्टिविटी, थर्ड-पार्टी होस्टिंग रुकावट अथवा डिवाइस अनुकूलता की समस्याओं के लिए संस्था किसी भी
              प्रकार की प्रत्यक्ष या अप्रत्यक्ष क्षति के लिए उत्तरदायी नहीं होगी।
            </p>
          </div>

          {/* Section 5 */}
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-stone-900 border-b border-stone-200 pb-2">
              5. संपर्क एवं न्यायिक क्षेत्राधिकार (Governing Law & Jurisdiction)
            </h2>
            <p>
              ये नियम भारतीय गणराज्य के कानूनों के अनुसार शासित और व्याख्यायित होंगे।
              किसी भी विवाद की स्थिति में न्यायिक क्षेत्राधिकार भागलपुर, बिहार (भारत) के न्यायालयों का होगा।
            </p>
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs space-y-1">
              <p><strong>संस्था:</strong> {SITE_CONFIG.orgName}</p>
              <p><strong>आधिकारिक वेबसाइट:</strong> https://santmatsatsangparchar.in</p>
              <p><strong>ईमेल:</strong> {SITE_CONFIG.contactEmail}</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
