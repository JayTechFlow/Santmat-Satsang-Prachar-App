/**
 * ============================================================================
 * SANTMAT SATSANG PARCHAR — Official Business Website Router
 * ============================================================================
 * CANONICAL PUBLIC ORIGIN: https://santmatsatsangparchar.in
 *
 * This application owns ONLY the public website pages.
 * The Admin Dashboard lives in apps/web and is served under /admin/**.
 *
 * Public Routes:
 * - /               -> Home (Sole Proprietorship Business Presentation)
 * - /about          -> About Us
 * - /services       -> Services / Business Activities
 * - /mobile-app     -> Mobile Application (Digital Product)
 * - /contact        -> Contact Us
 * - /privacy-policy -> Privacy Policy
 * - /terms          -> Terms & Conditions
 * - /delete-account -> Account & Data Deletion
 *
 * Unknown public paths fall back cleanly to the homepage (SPA).
 * The public website contains ZERO admin links or login CTAs.
 */
import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from '../components/ui/ErrorBoundary';
import { PublicLayout } from '../features/public/layout/PublicLayout';
import { HomePage } from '../features/public/pages/HomePage';
import { AboutPage } from '../features/public/pages/AboutPage';
import { ServicesPage } from '../features/public/pages/ServicesPage';
import { MobileAppPage } from '../features/public/pages/MobileAppPage';
import { ContactPage } from '../features/public/pages/ContactPage';
import { PrivacyPolicyPage } from '../features/public/pages/PrivacyPolicyPage';
import { TermsPage } from '../features/public/pages/TermsPage';
import { AccountDeletionPage } from '../features/public/pages/AccountDeletionPage';
import { getFirebaseRootAdminRedirect } from '../config/siteConfig';

export default function App() {
  useEffect(() => {
    const redirectTarget = getFirebaseRootAdminRedirect();
    if (redirectTarget) {
      window.location.replace(redirectTarget);
    }
  }, []);

  return (
    <ErrorBoundary>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/services" element={<ServicesPage />} />
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