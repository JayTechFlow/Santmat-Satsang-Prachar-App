import React from 'react';
import { Outlet } from 'react-router-dom';
import { SiteHeader } from '../../../components/common/SiteHeader';
import { SiteFooter } from '../../../components/common/SiteFooter';

export const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white text-stone-900 font-sans selection:bg-amber-600 selection:text-white overflow-x-hidden">
      {/* Header */}
      <SiteHeader />

      {/* Main Content Render Area */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <SiteFooter />
    </div>
  );
};
