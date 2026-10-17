import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  UserCheck,
  Database,
  Smartphone,
  Trash2,
  Mail,
  Lock,
  Bell,
  Activity,
} from 'lucide-react';
import { SITE_CONFIG } from '../../../config/siteConfig';
import { SEOHead } from '../../../components/shared/SEOHead';
import { LegalSection } from '../../../components/common/LegalSection';
import { BusinessInformation } from '../../../components/common/BusinessInformation';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <>
      <SEOHead
        title="Privacy Policy | Official Data Practices & Compliance"
        description="Official Privacy Policy of SANTMAT SATSANG PARCHAR. Details on Firebase authentication, profile data, playback analytics, telemetry, and account deletion."
        canonicalPath="/privacy-policy"
      />

      {/* Header */}
      <section className="bg-gradient-to-b from-stone-50 via-white to-stone-50/40 border-b border-stone-200 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-stone-100 border border-stone-200/80 text-xs font-semibold text-stone-700 mb-4 shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-amber-700" />
            <span>Legal Compliance Document</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-stone-900 tracking-tight mb-3">
            Privacy Policy
          </h1>
          <p className="text-xs sm:text-sm font-bold text-amber-800 uppercase tracking-widest mb-3">
            {SITE_CONFIG.legalEntityName} ({SITE_CONFIG.businessStructure})
          </p>

          <p className="text-xs text-stone-500 font-medium">
            Effective Date: October 2026 • Last Reviewed: October 2026
          </p>
        </div>
      </section>

      {/* Main Legal Content */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 text-stone-700 leading-relaxed text-xs sm:text-sm">
          {/* Entity Introduction Box */}
          <div className="p-5 sm:p-6 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
            <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-700" />
              <span>Scope & Business Entity</span>
            </h2>
            <p className="text-stone-600 leading-relaxed">
              This Privacy Policy applies to the official public business website located at{' '}
              <a href={SITE_CONFIG.siteUrl} className="font-mono text-amber-800 font-bold hover:underline">
                https://santmatsatsangparchar.in
              </a>{' '}
              and the official Android mobile application <strong>{SITE_CONFIG.mobileApp.englishName}</strong> (
              <span className="font-mono">{SITE_CONFIG.mobileApp.packageId}</span>), owned and operated by{' '}
              <strong>{SITE_CONFIG.legalEntityName}</strong>, a registered Sole Proprietorship business in Bihar,
              India under the proprietorship of <strong>{SITE_CONFIG.proprietorName}</strong>.
            </p>
          </div>

          {/* Section 1: Information We Collect */}
          <LegalSection title="1. Information We Collect (Actual Implementation Audit)">
            <p>
              To provide media streaming, authentication, personalized preferences, and reliable app
              performance, we collect and process the following categories of information:
            </p>
            <div className="space-y-3 pl-2">
              <div className="p-3.5 rounded-lg bg-stone-50 border border-stone-200/80">
                <strong className="text-stone-900 block mb-1 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-amber-700" />
                  <span>A. Authentication & Account Credentials</span>
                </strong>
                <p className="text-stone-600">
                  When you sign in using Google Sign-In or Firebase Authentication, we receive your basic profile
                  identity including your verified email address, full name, profile photo URL, and unique Firebase
                  User ID (UID). If phone authentication is utilized, your verified mobile number is stored.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-stone-50 border border-stone-200/80">
                <strong className="text-stone-900 block mb-1 flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-amber-700" />
                  <span>B. User Profile & App Preferences</span>
                </strong>
                <p className="text-stone-600">
                  Custom user profile names, profile pictures uploaded to Google Cloud / Firebase Storage,
                  marked favorite tracks, custom playlists, Devanagari font scaling preferences, and dark/light
                  theme selections stored in Cloud Firestore and local secure storage.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-stone-50 border border-stone-200/80">
                <strong className="text-stone-900 block mb-1 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-amber-700" />
                  <span>C. Playback Analytics & Active Heartbeat Telemetry</span>
                </strong>
                <p className="text-stone-600">
                  To power playback continuity and dashboard metrics, the mobile application logs audio playback
                  events (tracks played, seek points, completion state) and emits an periodic{' '}
                  <span className="font-mono text-stone-800 font-semibold">AnalyticsHeartbeat</span> signal during
                  active app sessions to track active user counts.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-stone-50 border border-stone-200/80">
                <strong className="text-stone-900 block mb-1 flex items-center gap-1.5">
                  <Bell className="w-4 h-4 text-amber-700" />
                  <span>D. Notifications & Messaging Tokens</span>
                </strong>
                <p className="text-stone-600">
                  Firebase Cloud Messaging (FCM) registration tokens are registered to transmit announcements,
                  daily stuti reminders, and alerts regarding newly published audio tracks.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-stone-50 border border-stone-200/80">
                <strong className="text-stone-900 block mb-1 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-amber-700" />
                  <span>E. Technical Diagnostics & Crash Telemetry</span>
                </strong>
                <p className="text-stone-600">
                  We collect automated application crash logs and diagnostic stack traces via Firebase Crashlytics
                  along with aggregate app performance telemetry via Firebase Analytics (operating system version,
                  device model, and non-identifying telemetry).
                </p>
              </div>
            </div>
          </LegalSection>

          {/* Section 2: Permissions */}
          <LegalSection title="2. Device Permissions Used by the Mobile Application">
            <p>
              The Android mobile application requests only permissions essential for media functionality:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-stone-600">
              <li>
                <strong>FOREGROUND_SERVICE & MEDIA_PLAYBACK:</strong> Allows the audio service (just_audio /
                AudioService) to maintain playback when the screen is turned off or while other applications are in use.
              </li>
              <li>
                <strong>INTERNET & ACCESS_NETWORK_STATE:</strong> Enables streaming audio assets from Google Cloud
                Storage and fetching real-time database updates from Cloud Firestore.
              </li>
              <li>
                <strong>CAMERA & READ_EXTERNAL_STORAGE (Optional):</strong> Invoked solely if the user voluntarily
                selects a custom profile picture to upload to their devotee account.
              </li>
            </ul>
          </LegalSection>

          {/* Section 3: Third-Party Service Providers */}
          <LegalSection title="3. Third-Party Service Providers">
            <p>
              We rely on trusted Google Cloud and Firebase infrastructure to power backend operations:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-stone-600">
              <li><strong>Google Sign-In & Firebase Authentication:</strong> User identity and secure session management.</li>
              <li><strong>Google Cloud Firestore:</strong> Database storage of user profiles, preferences, and playlists.</li>
              <li><strong>Google Firebase Storage:</strong> Hosting for media catalog audio and user avatars.</li>
              <li><strong>Firebase Cloud Messaging (FCM):</strong> Push notification delivery.</li>
              <li><strong>Firebase Analytics & Crashlytics:</strong> Stability diagnostics and aggregate telemetry.</li>
            </ul>
          </LegalSection>

          {/* Section 4: Commercial Zero-Monetization Pledge */}
          <LegalSection title="4. Advertising & Data Brokerage Policy">
            <p>
              <strong>We do not sell, rent, monetize, or lease your personal information to any third party.</strong>{' '}
              We do not integrate third-party advertising networks or commercial marketing trackers. Your data is used
              strictly to deliver published media and manage your application account.
            </p>
          </LegalSection>

          {/* Section 5: Data Deletion */}
          <LegalSection title="5. Account & Data Deletion Rights">
            <p>
              Users have the absolute right to request permanent deletion of their account and all associated
              personal data at any time:
            </p>
            <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200 text-rose-950 space-y-2">
              <strong className="block text-rose-900 flex items-center gap-1.5">
                <Trash2 className="w-4 h-4 text-rose-600" />
                <span>Account Deletion Process</span>
              </strong>
              <p className="text-xs text-rose-900 leading-relaxed">
                You can delete your account directly inside the mobile app via <strong>Profile &gt; Account &amp; Security &gt; Delete Account</strong>,
                or submit an online deletion request via our public web portal at:{' '}
                <Link
                  to="/delete-account"
                  className="font-mono font-bold underline text-rose-800 hover:text-rose-950"
                >
                  https://santmatsatsangparchar.in/delete-account
                </Link>
              </p>
              <p className="text-xs text-rose-800">
                Upon confirmation, your Firebase Auth record, Firestore user document, profile images, playlists,
                and listening logs are permanently and irreversibly purged from our servers.
              </p>
            </div>
          </LegalSection>

          {/* Section 6: Security */}
          <LegalSection title="6. Data Security Measures">
            <p>
              All communication between our clients and servers is encrypted in transit using industry-standard
              Transport Layer Security (TLS/HTTPS). Database access is safeguarded through declarative Firestore
              and Storage Security Rules that strictly enforce authentication and ownership boundaries.
            </p>
          </LegalSection>

          {/* Section 7: Contact */}
          <LegalSection title="7. Contacting the Business Regarding Privacy">
            <p>
              If you have any questions or concerns regarding this policy or the processing of your data,
              please contact our official support desk:
            </p>
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-700 space-y-1">
              <p>
                <strong>Business:</strong> {SITE_CONFIG.legalEntityName} ({SITE_CONFIG.businessStructure})
              </p>
              <p>
                <strong>Proprietor:</strong> {SITE_CONFIG.proprietorName}
              </p>
              <p>
                <strong>Email:</strong>{' '}
                <a
                  href={`mailto:${SITE_CONFIG.officialEmail}`}
                  className="text-amber-800 font-bold hover:underline font-mono"
                >
                  {SITE_CONFIG.officialEmail}
                </a>
              </p>
              <p>
                <strong>Phone:</strong>{' '}
                <a
                  href={`tel:${SITE_CONFIG.officialPhone}`}
                  className="text-stone-900 font-semibold font-mono"
                >
                  {SITE_CONFIG.officialPhoneFormatted}
                </a>
              </p>
              <p>
                <strong>Address:</strong> {SITE_CONFIG.registeredAddress.full}
              </p>
            </div>
          </LegalSection>
        </div>
      </section>

      {/* Business Information */}
      <BusinessInformation />
    </>
  );
};
