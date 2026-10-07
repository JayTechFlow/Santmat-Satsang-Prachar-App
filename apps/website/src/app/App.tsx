/**
 * ============================================================================
 * संतमत सत्संग प्रचार — सार्वजनिक संस्था वेबसाइट रूटर
 * ============================================================================
 * PUBLIC ORGANIZATION WEBSITE: https://santmatsatsangparchar.in
 *
 * This application owns ONLY the public pages. The admin dashboard lives in
 * apps/web and is served by Firebase Hosting under /admin/**.
 *
 * Routes:
 * - /               -> Home
 * - /about          -> About
 * - /mobile-app     -> Mobile App
 * - /contact        -> Contact
 * - /privacy-policy -> Privacy Policy
 * - /terms          -> Terms
 * - /delete-account -> Account Deletion
 *
 * Unknown public paths return to the homepage (SPA). Admin navigation is
 * performed with full-page anchors to /admin/login so the browser loads the
 * admin application bundle on the SAME origin.
 */
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from '../components/ui/ErrorBoundary';
import { PublicLayout } from '../features/public/layout/PublicLayout';
import { HomePage } from '../features/public/pages/HomePage';
import { AboutPage } from '../features/public/pages/AboutPage';
import { MobileAppPage } from '../features/public/pages/MobileAppPage';
import { ContactPage } from '../features/public/pages/ContactPage';
import { PrivacyPolicyPage } from '../features/public/pages/PrivacyPolicyPage';
import { TermsPage } from '../features/public/pages/TermsPage';
import { AccountDeletionPage } from '../features/public/pages/AccountDeletionPage';

export default function App() {
  return (
    <ErrorBoundary>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/mobile-app" element={<MobileAppPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/delete-account" element={<AccountDeletionPage />} />
            {/* Unknown public paths fall back to the homepage */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}