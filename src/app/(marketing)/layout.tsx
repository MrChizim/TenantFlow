import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'TenantFlow — Property Management for Nigerian Landlords',
  description: 'The easiest way for Nigerian landlords to track tenants, collect rent, and manage properties. Free to start, no paperwork needed.',
  alternates: { canonical: 'https://www.tenantflow.com.ng/home' },
  openGraph: {
    title: 'TenantFlow — Property Management for Nigerian Landlords',
    description: 'The easiest way for Nigerian landlords to track tenants, collect rent, and manage properties. Free to start.',
    url: 'https://www.tenantflow.com.ng/home',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'TenantFlow' }],
  },
};

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
