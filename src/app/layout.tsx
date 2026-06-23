import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "@/components/providers/AuthProvider";

export const metadata: Metadata = {
  title: "TenantFlow — Property Management for Nigerian Landlords",
  description: "Track tenants, log payments, and know exactly who owes you. Built for the way Nigerians actually rent — no lease contracts required.",
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'TenantFlow' },
  other: { 'mobile-web-app-capable': 'yes' },
  openGraph: {
    title: 'TenantFlow — Property Management for Nigerian Landlords',
    description: 'Track tenants, log payments, and know exactly who owes you. Built for the way Nigerians actually rent.',
    images: [{ url: '/logo.png', width: 1080, height: 1080, alt: 'TenantFlow' }],
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'TenantFlow — Property Management for Nigerian Landlords',
    description: 'Track tenants, log payments, and know exactly who owes you. Built for Nigeria.',
    images: ['/logo.png'],
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
