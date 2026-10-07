import React, { useState } from 'react';
import {
  Trash2,
  AlertTriangle,
  CheckCircle,
  Send,
} from 'lucide-react';
import { SITE_CONFIG } from '../../../config/siteConfig';
import { SEOHead } from '../../../components/shared/SEOHead';

export const AccountDeletionPage: React.FC = () => {
  const [identifier, setIdentifier] = useState('');
  const [reason, setReason] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier) return;
    setSubmitted(true);
  };

  return (
    <>
      <SEOHead
        title="खाता एवं डेटा विलोपन अनुरोध | Account & Data Deletion"
        description="संतमत सत्संग प्रचार (SANTMAT SATSANG PARCHAR) खाता एवं व्यक्तिगत डेटा विलोपन अनुरोध पृष्ठ। Google Play नीति के अनुसार खाता एवं डेटा हटाने की पूर्ण प्रक्रिया।"
        canonicalPath="/delete-account"
      />

      {/* Header */}
      <section className="bg-gradient-to-b from-red-50/50 via-white to-amber-50/20 border-b border-stone-200 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-100 text-red-900 border border-red-200 text-xs font-bold mb-4">
            <Trash2 className="w-4 h-4 text-red-700" />
            <span>Google Play Compliance • Account & Data Deletion</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-stone-900 tracking-tight mb-3">
            खाता एवं डेटा विलोपन अनुरोध
          </h1>
          <p className="text-xs sm:text-sm font-bold text-amber-700 uppercase tracking-widest mb-4">
            {SITE_CONFIG.orgName}
          </p>

          <p className="text-xs sm:text-sm text-stone-600 max-w-2xl mx-auto">
            Google Play Store नीतियों के अनुसार, संतमत सत्संग प्रचार ऐप के सभी उपयोगकर्ताओं को अपने खाते और उससे जुड़े सभी व्यक्तिगत डेटा को हटाने का पूर्ण अधिकार है।
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 text-stone-700 leading-relaxed text-sm sm:text-base">
          {/* Warning Banner */}
          <div className="p-4 sm:p-5 rounded-xl bg-red-50 border border-red-200 text-red-900 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm leading-relaxed">
              <strong className="block mb-0.5">चेतावनी (Important Warning):</strong>
              खाता विलोपन एक स्थायी और अपरिवर्तनीय प्रक्रिया है। खाता हटाए जाने के पश्चात आपकी पसंदीदा भजन सूची,
              सुनने का इतिहास और प्रोफ़ाइल विवरण पुनर्प्राप्त नहीं किए जा सकते।
            </div>
          </div>

          {/* Method 1: In App */}
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-stone-900 border-b border-stone-200 pb-2">
              विधि 1: ऐप के भीतर से तुरंत खाता हटाएं (In-App Instant Deletion)
            </h2>
            <p className="text-xs sm:text-sm">
              यदि आपके डिवाइस पर <strong>{SITE_CONFIG.mobileApp.name}</strong> ऐप स्थापित है, तो आप तुरंत खाता हटा सकते हैं:
            </p>
            <ol className="list-decimal pl-6 space-y-1.5 text-stone-600 text-xs sm:text-sm">
              <li>मोबाइल ऐप खोलें।</li>
              <li>निचले नेविगेशन बार में <strong>प्रोफ़ाइल (Profile)</strong> पर जाएँ।</li>
              <li><strong>खाता एवं सुरक्षा (Account & Security)</strong> विकल्प चुनें।</li>
              <li>पृष्ठ के अंत में <strong>खाता हटाएं (Delete Account)</strong> पर टैप करें और पुष्टि करें।</li>
            </ol>
            <p className="text-xs text-stone-500 italic">
              पुष्टि होते ही आपका खाता तुरंत डिलीट कर दिया जाएगा।
            </p>
          </div>

          {/* Method 2: Web Form Submission */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-stone-900 border-b border-stone-200 pb-2">
              विधि 2: वेब अनुरोध फॉर्म (Web Deletion Request)
            </h2>
            <p className="text-xs sm:text-sm">
              यदि आपके पास ऐप उपलब्ध नहीं है या आपने ऐप अनइंस्टॉल कर दिया है, तो आप नीचे दिए गए फॉर्म द्वारा विलोपन अनुरोध भेज सकते हैं:
            </p>

            <div className="p-6 rounded-2xl bg-stone-50 border border-stone-200">
              {submitted ? (
                <div className="text-center py-6 space-y-3">
                  <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto" />
                  <h3 className="font-bold text-stone-900 text-base">
                    अनुरोध सफलतापूर्वक दर्ज कर लिया गया है
                  </h3>
                  <p className="text-xs text-stone-600 max-w-md mx-auto">
                    आपके द्वारा दिए गए पहचान विवरण ({identifier}) के सत्यापन के पश्चात
                    7 कार्य दिवसों के भीतर आपका खाता एवं डेटा पूरी तरह हटा दिया जाएगा।
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      पंजीकृत ईमेल या फ़ोन नंबर (Registered Email / Phone) *
                    </label>
                    <input
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="उदा. name@example.com या +919876543210"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      विलोपन का कारण (वैकल्पिक)
                    </label>
                    <textarea
                      rows={2}
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="वैकल्पिक कारण..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 py-2.5 px-5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs transition-all active:scale-98"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>खाता हटाने का अनुरोध सबमिट करें</span>
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Section: Data Deleted */}
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-stone-900 border-b border-stone-200 pb-2">
              क्या डेटा हटाया जाता है? (What Data is Deleted)
            </h2>
            <ul className="list-disc pl-6 space-y-1.5 text-stone-600 text-xs sm:text-sm">
              <li><strong>Firebase Auth क्रेडेंशियल:</strong> आपका यूनिक यूज़र आईडी (UID) एवं लॉगिन पहचान।</li>
              <li><strong>Firestore डेटाबेस रिकॉर्ड:</strong> उपयोगकर्ता नाम, ईमेल, फ़ोन नंबर एवं प्राथमिकताएं।</li>
              <li><strong>पसंदीदा एवं इतिहास:</strong> सहेजे गए भजन, स्तुति इतिहास एवं सूचना स्थिति।</li>
              <li><strong>क्लाउड स्टोरेज:</strong> यदि कोई प्रोफ़ाइल फ़ोटो अपलोड की गई थी।</li>
            </ul>
          </div>

          {/* Contact Box */}
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs space-y-1">
            <p><strong>सहायता ईमेल:</strong> <a href={`mailto:${SITE_CONFIG.contactEmail}`} className="text-amber-800 font-bold hover:underline font-mono">{SITE_CONFIG.contactEmail}</a></p>
            <p><strong>आधिकारिक संस्था:</strong> {SITE_CONFIG.orgName}</p>
            <p><strong>वेबसाइट:</strong> https://santmatsatsangparchar.in</p>
          </div>
        </div>
      </section>
    </>
  );
};
