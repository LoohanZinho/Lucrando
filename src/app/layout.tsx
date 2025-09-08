import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/auth-context';
import { Toaster } from '@/components/ui/toaster';
import { LoaderProvider, Loader } from '@/contexts/loader-context';

const inter = Inter({ subsets: ['latin'] });

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
      <body className={inter.className}>
        <LoaderProvider>
            <AuthProvider>
                {children}
                <Toaster />
                <Loader />
            </AuthProvider>
        </LoaderProvider>
      </body>
    </html>
  );
}
