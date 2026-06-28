import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "@/components/providers/AuthProvider";

export const metadata: Metadata = {
  title: {
    default: 'TenantFlow — Property Management for Nigerian Landlords',
    template: '%s | TenantFlow',
  },
  description: "Track tenants, log payments, and know exactly who owes you. Built for the way Nigerians actually rent — no lease contracts required.",
  keywords: [
    'property management Nigeria', 'landlord app Nigeria', 'tenant management software',
    'rent tracking Nigeria', 'Nigerian landlord app', 'property management Lagos',
    'rent collection app', 'tenant tracker', 'property manager Nigeria',
    'landlord software Nigeria', 'real estate management Nigeria',
  ],
  authors: [{ name: 'TenantFlow' }],
  creator: 'TenantFlow',
  metadataBase: new URL('https://www.tenantflow.com.ng'),
  alternates: { canonical: '/' },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'TenantFlow' },
  other: { 'mobile-web-app-capable': 'yes' },
  openGraph: {
    title: 'TenantFlow — Property Management for Nigerian Landlords',
    description: 'Track tenants, log payments, and know exactly who owes you. Built for the way Nigerians actually rent.',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'TenantFlow' }],
    type: 'website',
    siteName: 'TenantFlow',
    locale: 'en_NG',
    url: 'https://www.tenantflow.com.ng',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TenantFlow — Property Management for Nigerian Landlords',
    description: 'Track tenants, log payments, and know exactly who owes you. Built for Nigeria.',
    images: ['/og.png'],
    site: '@tenantflow',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:opsz,wght@14..32,300;14..32,400;14..32,500;14..32,600;14..32,700&display=swap" rel="stylesheet" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1C1B18" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body className="h-full"><AuthProvider>{children}</AuthProvider></body>
    </html>
  );
}
