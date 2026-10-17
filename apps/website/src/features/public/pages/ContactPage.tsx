import React, { useState } from 'react';
import {
  Mail,
  Phone,
  Send,
  CheckCircle,
  Building2,
  MessageSquare,
} from 'lucide-react';
import { SITE_CONFIG } from '../../../config/siteConfig';
import { SEOHead } from '../../../components/shared/SEOHead';
import { ContactCard } from '../../../components/common/ContactCard';
import { BusinessInformation } from '../../../components/common/BusinessInformation';

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
        title="Contact Us | Official Business Inquiries & Support"
        description="Contact SANTMAT SATSANG PARCHAR (Sole Proprietorship). Official email: helpsantmatbhajan@gmail.com, Phone: 7050448278, Registered Office in Samastipur, Bihar."
        canonicalPath="/contact"
      />

      {/* Header */}
      <section className="bg-gradient-to-b from-stone-50 via-white to-stone-50/40 border-b border-stone-200 py-14 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-stone-100 border border-stone-200/80 text-xs font-semibold text-stone-700 mb-4 shadow-2xs">
            <Mail className="w-4 h-4 text-amber-700" />
            <span>Official Communications • Sole Proprietorship</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-stone-900 tracking-tight mb-4">
            Contact Us
          </h1>

          <p className="text-base sm:text-lg text-stone-600 leading-relaxed max-w-2xl mx-auto font-normal">
            Reach out to <strong>{SITE_CONFIG.legalEntityName}</strong> for business inquiries,
            media publishing communications, or mobile application support.
          </p>
        </div>
      </section>

      {/* Main Contact Section */}
      <section className="py-14 sm:py-18 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            {/* Left: Contact Details Card */}
            <div>
              <div className="mb-6">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block mb-1">
                  Business Directory
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-stone-900">
                  Official Business Information
                </h2>
                <p className="text-xs text-stone-500 mt-1">
                  Direct channels for correspondence, support, and administrative verification.
                </p>
              </div>

              <ContactCard />
            </div>

            {/* Right: Inquiry Form */}
            <div className="p-6 sm:p-8 rounded-2xl bg-stone-50/70 border border-stone-200/90 shadow-2xs">
              <h2 className="text-lg font-bold text-stone-900 mb-1 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-amber-700" />
                <span>Send a Message</span>
              </h2>
              <p className="text-xs text-stone-500 mb-6">
                Please complete the form below. We will respond directly to your provided email address.
              </p>

              {submitted ? (
                <div className="p-6 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
                  <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
                  <h3 className="font-bold text-emerald-900 text-base">
                    Inquiry Received
                  </h3>
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    Thank you for contacting us. A representative will reach out to{' '}
                    <strong>{email}</strong> regarding your inquiry.
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
                    className="mt-3 px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Rahul Kumar"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="e.g. Media Publishing / App Support"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Message *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Please write your inquiry here..."
                      className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-semibold text-sm shadow-xs transition-all active:scale-[0.98]"
                  >
                    <Send className="w-4 h-4" />
                    <span>Submit Inquiry</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Business Information */}
      <BusinessInformation />
    </>
  );
};
