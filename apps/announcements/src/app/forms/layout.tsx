/**
 * Forms layout
 * 
 * Provides consistent layout and metadata for all form pages
 */

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Forms - Announcements',
  description: 'Complete and submit announcement forms for ASX compliance',
};

export default function FormsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a href="#main-content" className="skip-to-main">
        Skip to main content
      </a>
      <main id="main-content" role="main">
        {children}
      </main>
    </>
  );
}
