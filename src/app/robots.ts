import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/dashboard', '/tenants', '/properties', '/expenses', '/roi', '/reports', '/renewals', '/reminders', '/settings', '/api/'] },
    sitemap: 'https://www.tenantflow.com.ng/sitemap.xml',
  };
}
