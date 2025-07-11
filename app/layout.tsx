import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Navigation } from '@/components/ui/navigation';
import { Footer } from '@/components/ui/footer';
import CartProvider from '@/components/panier/cart-provider';
import { ChatSupportWidget } from '@/components/chat/chat-support-widget';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'SiteAris - Services informatiques et cybersécurité',
    template: '%s | SiteAris'
  },
  description: 'SiteAris propose des services informatiques et de cybersécurité sur mesure pour les entreprises, avec une expertise reconnue et des tarifs transparents.',
  keywords: 'services informatiques, cybersécurité, audit sécurité, maintenance informatique, sécurisation réseau',
  authors: [{ name: 'SiteAris' }],
  creator: 'SiteAris',
  publisher: 'SiteAris',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <CartProvider>
          <div className="flex flex-col min-h-screen">
            <Navigation />
            <main className="flex-1">{children}</main>
            <Footer />
            {/* Widget de chat support */}
            <ChatSupportWidget />
          </div>
        </CartProvider>
      </body>
    </html>
  );
} 