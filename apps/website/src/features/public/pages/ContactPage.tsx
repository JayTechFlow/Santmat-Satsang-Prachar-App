import React, { useState } from 'react';
import {
  Mail,
  MapPin,
  Globe,
  Send,
  CheckCircle,
  ShieldCheck,
  MessageSquare,
} from 'lucide-react';
import { SITE_CONFIG } from '../../../config/siteConfig';
import { SEOHead } from '../../../components/shared/SEOHead';

export const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    setSubmitted(true);
  };

  return (
    <>
      <SEOHead
        title="संपर्क सूत्र | Contact Us"
        description="संतमत सत्संग प्रचार (SANTMAT SATSANG PARCHAR) आधिकारिक संपर्क पृष्ठ। ईमेल: santmatsatsangprachar@gmail.com। सत्संग, मोबाइल ऐप सहायता एवं जिज्ञासा समाधान।"
        canonicalPath="/contact"
      />

      {/* Header */}
      <section className="bg-gradient-to-b from-amber-50 to-white border-b border-stone-200 py-14 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold mb-4">
            <Mail className="w-4 h-4 text-amber-700" />
            <span>संपर्क एवं सेवा केंद्र • Contact & Inquiries</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-stone-900 tracking-tight mb-4">
            संपर्क सूत्र (Contact Us)
          </h1>

          <p className="text-base sm:text-lg text-stone-600 leading-relaxed max-w-2xl mx-auto font-medium">
            {SITE_CONFIG.orgName} के संबंध में किसी भी प्रकार की जानकारी,
            मोबाइल ऐप सहायता अथवा आध्यात्मिक जिज्ञासा के लिए हमसे संपर्क करें।
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-14 sm:py-18 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left Col: Contact Information */}
            <div className="space-y-8">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-stone-900 mb-2">
                  आधिकारिक संपर्क विवरण
                </h2>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  संस्था एवं ऐप संबंधी सभी आधिकारिक संवाद सीधे निम्नलिखित माध्यमों से किए जा सकते हैं:
                </p>
              </div>

              <div className="space-y-4">
                {/* Email Box */}
                <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200 flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-900 text-sm mb-0.5">ईमेल (Official Email)</h3>
                    <p className="text-xs text-stone-500 mb-1">सामान्य एवं ऐप सहायता पूछताछ</p>
                    <a
                      href={`mailto:${SITE_CONFIG.contactEmail}`}
                      className="text-sm font-bold text-amber-800 hover:underline font-mono"
                    >
                      {SITE_CONFIG.contactEmail}
                    </a>
                  </div>
                </div>

                {/* Website Box */}
                <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-xl bg-stone-800 text-white flex items-center justify-center shrink-0">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-900 text-sm mb-0.5">आधिकारिक वेबसाइट</h3>
                    <p className="text-xs text-stone-500 mb-1">Primary Organization Domain</p>
                    <span className="text-sm font-bold text-stone-900 font-mono">
                      https://santmatsatsangparchar.in
                    </span>
                  </div>
                </div>

                {/* Headquarters Box */}
                <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-xl bg-stone-800 text-white flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-900 text-sm mb-0.5">मुख्यालय (Headquarters)</h3>
                    <p className="text-xs text-stone-500 mb-1">आध्यात्मिक केंद्र</p>
                    <p className="text-xs sm:text-sm text-stone-800 leading-relaxed font-medium">
                      {SITE_CONFIG.ashramHeadquarters}
                    </p>
                  </div>
                </div>
              </div>

              {/* Organization Assurance */}
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  हम आपकी निजता का सम्मान करते हैं। आपके द्वारा भेजे गए संदेश एवं संपर्क विवरण
                  का उपयोग केवल आपकी सहायता हेतु किया जाता है।
                </p>
              </div>
            </div>

            {/* Right Col: Inquiry Form */}
            <div className="p-6 sm:p-8 rounded-2xl bg-white border border-stone-200 shadow-xs">
              <h2 className="text-xl font-bold text-stone-900 mb-2 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-amber-600" />
                <span>संदेश भेजें (Send a Message)</span>
              </h2>
              <p className="text-xs text-stone-500 mb-6">
                कृपया अपना संदेश भरें, हमारी सेवा टीम शीघ्र उत्तर देगी।
              </p>

              {submitted ? (
                <div className="p-6 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
                  <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto" />
                  <h3 className="font-bold text-emerald-900 text-base">
                    धन्यवाद! आपका संदेश प्राप्त हो गया है।
                  </h3>
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    जय गुरु! हमारी टीम आपके द्वारा दिए गए ईमेल <strong>{email}</strong> पर
                    शीघ्र संपर्क करेगी।
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setName('');
                      setEmail('');
                      setSubject('');
                      setMessage('');
                    }}
                    className="mt-4 px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700"
                  >
                    नया संदेश भेजें
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      आपका नाम (Full Name) *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="उदा. राहुल शर्मा"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      ईमेल पता (Email Address) *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="उदा. name@example.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      विषय (Subject)
                    </label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="उदा. मोबाइल ऐप सहायता / सत्संग साहित्य"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      संदेश (Message) *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="कृपया अपना संदेश यहाँ लिखें..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-md transition-all active:scale-98"
                  >
                    <Send className="w-4 h-4" />
                    <span>संदेश भेजें (Submit Inquiry)</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
