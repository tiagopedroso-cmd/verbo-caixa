import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://verbo-caixa.vercel.app'),

  title: 'Verbo Caixa | Igreja Verbo da Vida Arujá',

  description:
    'Sistema de gestão de caixa da Igreja Verbo da Vida Arujá.',

  openGraph: {
    title: 'Verbo Caixa | Igreja Verbo da Vida Arujá',
    description:
      'Sistema de gestão de caixa da Igreja Verbo da Vida Arujá.',
    url: 'https://verbo-caixa.vercel.app',
    siteName: 'Verbo Caixa',
    locale: 'pt_BR',
    type: 'website',

    images: [
      {
        url: '/verbo-caixa-og-v2.png',
        width: 1200,
        height: 630,
        alt: 'Verbo Caixa - Igreja Verbo da Vida Arujá',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Verbo Caixa | Igreja Verbo da Vida Arujá',
    description:
      'Sistema de gestão de caixa da Igreja Verbo da Vida Arujá.',
    images: ['/verbo-caixa-og-v2.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}