import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'LCI Lucrando com Influenciadores',
  description: 'Dashboard para análise de performance de marketing de influência.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        {children}
      </body>
    </html>
  );
}
