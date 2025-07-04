import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Navigation } from '@/components/ui/navigation';
import { Footer } from '@/components/ui/footer';
import CartProvider from '@/components/panier/cart-provider';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    template: '%s | SiteAris',
    default: 'SiteAris - Services Informatiques et Cybersécurité',
  },
  description: 'Solutions informatiques et de cybersécurité pour les entreprises, avec tarifs transparents et expertise reconnue.',
  keywords: ['informatique', 'cybersécurité', 'services IT', 'audit sécurité', 'maintenance informatique'],
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <CartProvider>
          <Navigation />
          <div className="flex-grow">
            {children}
          </div>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
} 