import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import 'driver.js/dist/driver.css';
import QueryProvider from '@/components/providers/QueryProvider';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-plus-jakarta',
});

export const metadata = {
  title: {
    default: 'Medora AI — Your Healthcare Copilot',
    template: '%s | Medora AI',
  },
  description:
    'AI-powered healthcare navigation. Understand your symptoms, find the right specialist, and manage your health — all in one place.',
  keywords: ['healthcare AI', 'symptom checker', 'health copilot', 'specialist finder'],
  openGraph: {
    title: 'Medora AI — Your Healthcare Copilot',
    description: 'AI-powered healthcare navigation platform',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${plusJakarta.variable}`}>
      <body className="min-h-screen bg-background antialiased">
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
