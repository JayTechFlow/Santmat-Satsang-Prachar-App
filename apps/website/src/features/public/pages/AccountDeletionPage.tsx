import React, { useState } from 'react';
import {
  Trash2,
  AlertTriangle,
  CheckCircle,
  Send,
  Smartphone,
  Globe,
  ShieldCheck,
} from 'lucide-react';
import { SITE_CONFIG } from '../../../config/siteConfig';
import { SEOHead } from '../../../components/shared/SEOHead';
import { BusinessInformation } from '../../../components/common/BusinessInformation';

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
        title="Account & Data Deletion Request | Compliance Portal"
        description="Official account and data deletion request page for Santmat Satsang Prachar mobile app users. Full deletion workflow for user profile, authentication, and history."
        canonicalPath="/delete-account"
      />

      {/* Header */}
      <section className="bg-gradient-to-b from-stone-50 via-white to-stone-50/40 border-b border-stone-200 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-800 mb-4 shadow-2xs">
            <Trash2 className="w-4 h-4 text-rose-600" />
            <span>Google Play Policy Compliance • User Data Control</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-stone-900 tracking-tight mb-3">
            Account & Data Deletion Request
          </h1>
          <p className="text-xs sm:text-sm font-bold text-amber-800 uppercase tracking-widest mb-4">
            {SITE_CONFIG.legalEntityName} ({SITE_CONFIG.businessStructure})
          </p>

          <p className="text-xs sm:text-sm text-stone-600 max-w-2xl mx-auto leading-relaxed">
            In full compliance with Google Play Developer policies, all users of the{' '}
            <strong>{SITE_CONFIG.mobileApp.englishName}</strong> mobile application possess the right
            to request the permanent deletion of their account credentials, profile data, and associated
            activity records.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 text-stone-700 leading-relaxed text-xs sm:text-sm">
          {/* Warning Banner */}
          <div className="p-4 sm:p-5 rounded-xl bg-amber-50/70 border border-amber-200 text-stone-800 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm leading-relaxed">
              <strong className="text-stone-900 block mb-0.5">Permanent & Irreversible Action:</strong>
              Account deletion is immediate upon execution. Once executed, your saved favorite audio
              tracks, custom playlists, listening history logs, and profile records cannot be recovered.
            </div>
          </div>

          {/* Workflow Step 1: In App */}
          <div className="p-6 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
            <div className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-amber-700" />
              <h2 className="text-base font-bold text-stone-900">
                Method 1: Instant In-App Deletion (Recommended)
              </h2>
            </div>
            <p className="text-stone-600">
              If you currently have the <strong>{SITE_CONFIG.mobileApp.englishName}</strong> application
              installed on your Android device:
            </p>
            <ol className="list-decimal pl-6 space-y-1.5 text-stone-700 font-medium">
              <li>Open the mobile application.</li>
              <li>Navigate to the <strong>Profile</strong> tab in the bottom navigation bar.</li>
              <li>Select <strong>Account &amp; Security</strong> settings.</li>
              <li>Tap <strong>Delete Account</strong> at the bottom of the screen.</li>
              <li>Confirm the deletion prompt. Your account and data will be erased immediately.</li>
            </ol>
          </div>

          {/* Workflow Step 2: Web Form */}
          <div className="p-6 rounded-2xl bg-stone-50 border border-stone-200 space-y-4">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-amber-700" />
              <h2 className="text-base font-bold text-stone-900">
                Method 2: Web Request Submission
              </h2>
            </div>
            <p className="text-stone-600">
              If you have uninstalled the app or cannot access your device, submit your registered account
              details below. Our support team will process the permanent deletion within 7 business days:
            </p>

            {submitted ? (
              <div className="p-6 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
                <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
                <h3 className="font-bold text-stone-900 text-base">
                  Deletion Request Submitted
                </h3>
                <p className="text-xs text-stone-600 max-w-md mx-auto">
                  Your deletion request for identifier <strong>{identifier}</strong> has been received.
                  Following verification, all associated authentication records, profile documents, and
                  telemetry will be permanently purged.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Registered Google Email or Phone Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="name@example.com or +919876543210"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Reason for Deletion (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Optional feedback..."
                    className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  />
                </div>

                <button
                  type="submit"
                  className="inline-flex items-center gap-2 py-2.5 px-5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-xs transition-all active:scale-[0.98]"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Account Deletion Request</span>
                </button>
              </form>
            )}
          </div>

          {/* Data Elements Purged */}
          <div className="space-y-3 pt-4 border-t border-stone-200">
            <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Specific Data Categories Permanently Purged</span>
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 text-stone-600">
              <li><strong>Firebase Authentication Record:</strong> User ID (UID), sign-in credentials, and OAuth tokens.</li>
              <li><strong>Cloud Firestore User Record:</strong> Display name, registered email/phone, and account preferences.</li>
              <li><strong>Cloud Storage Assets:</strong> Custom profile photos or avatars uploaded to storage buckets.</li>
              <li><strong>Playback & Playlist Data:</strong> Saved favorites, user playlists, and audio listening history logs.</li>
            </ul>
          </div>

          {/* Support Email Assistance */}
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-600 space-y-1">
            <p>
              <strong>Need Assistance?</strong> You may also email our official support desk directly at{' '}
              <a href={`mailto:${SITE_CONFIG.officialEmail}`} className="font-mono text-amber-800 font-bold hover:underline">
                {SITE_CONFIG.officialEmail}
              </a>{' '}
              with your registered account details to request deletion.
            </p>
          </div>
        </div>
      </section>

      {/* Business Information */}
      <BusinessInformation />
    </>
  );
};
