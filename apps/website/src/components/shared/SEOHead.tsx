import React, { useEffect } from 'react';
import { SITE_CONFIG, getCanonicalUrl } from '../../config/siteConfig';

export interface SEOHeadProps {
  title: string;
  description: string;
  canonicalPath?: string;
  type?: 'website' | 'article';
  structuredData?: Record<string, unknown>;
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  canonicalPath = '/',
  type = 'website',
  structuredData,
}) => {
  const canonicalUrl = getCanonicalUrl(canonicalPath);
  const fullTitle = title.includes(SITE_CONFIG.orgName)
    ? title
    : `${title} | ${SITE_CONFIG.orgName}`;

  useEffect(() => {
    // 1. Update Title
    document.title = fullTitle;

    // Helper to create or update meta tag
    const setMetaTag = (attr: 'name' | 'property', key: string, content: string) => {
      let meta = document.querySelector(`meta[${attr}="${key}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attr, key);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // 2. Meta description
    setMetaTag('name', 'description', description);

    // 3. Canonical Link Tag
    let linkCanonical = document.querySelector('link[rel="canonical"]');
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.setAttribute('rel', 'canonical');
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute('href', canonicalUrl);

    // 4. Open Graph Tags
    setMetaTag('property', 'og:title', fullTitle);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:url', canonicalUrl);
    setMetaTag('property', 'og:type', type);
    setMetaTag('property', 'og:site_name', SITE_CONFIG.orgName);

    // 5. Twitter Card Tags
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', fullTitle);
    setMetaTag('name', 'twitter:description', description);

    // 6. JSON-LD Structured Data
    const defaultStructuredData = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Organization',
          '@id': `${SITE_CONFIG.siteUrl}/#organization`,
          name: SITE_CONFIG.orgName,
          alternateName: SITE_CONFIG.orgNameHindi,
          url: `${SITE_CONFIG.siteUrl}/`,
          email: SITE_CONFIG.contactEmail,
        },
        {
          '@type': 'WebSite',
          '@id': `${SITE_CONFIG.siteUrl}/#website`,
          url: `${SITE_CONFIG.siteUrl}/`,
          name: SITE_CONFIG.orgName,
          publisher: {
            '@id': `${SITE_CONFIG.siteUrl}/#organization`,
          },
        },
        ...(structuredData ? [structuredData] : []),
      ],
    };

    let scriptTag = document.getElementById('json-ld-structured-data');
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = 'json-ld-structured-data';
      scriptTag.setAttribute('type', 'application/ld+json');
      document.head.appendChild(scriptTag);
    }
    scriptTag.textContent = JSON.stringify(defaultStructuredData, null, 2);
  }, [fullTitle, description, canonicalUrl, type, structuredData]);

  return null;
};
