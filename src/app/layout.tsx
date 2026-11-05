import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';

export const metadata: Metadata = {
  title: 'EnglishMiami | Learn English From Zero to Fluent (A0 to C2)',
  description:
    'Your AI-powered English coach for vocabulary, grammar, speaking, listening, reading, writing, and real-world conversation.',
  keywords: [
    'Learn English',
    'English from zero',
    'CEFR English',
    'AI English tutor',
    'Speaking practice',
    'ESL learning platform',
    'EnglishMiami',
    'IELTS preparation',
  ],
  authors: [{ name: 'EnglishMiami Education Team' }],
  openGraph: {
    title: 'EnglishMiami | Learn English From Zero to Fluent',
    description:
      'Master English with personalized AI coaching, speaking lab, interactive lessons from A0 to C2, and spaced repetition.',
    url: 'https://englishmiami.com',
    siteName: 'EnglishMiami',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased selection:bg-teal-500 selection:text-white">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
