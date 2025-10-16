
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/auth-context';
import { Toaster } from '@/components/ui/toaster';
import { LoaderProvider, Loader } from '@/contexts/loader-context';
import { ptBR } from 'date-fns/locale';
import { setDefaultOptions } from 'date-fns';
import { ThemeProvider } from '@/components/theme-provider';

setDefaultOptions({ locale: ptBR });

const inter = Inter({ subsets: ['latin'] });

const APP_NAME = "LCI";
const APP_DEFAULT_TITLE = "LCI - Lucrando com Influenciadores";
const APP_TITLE_TEMPLATE = "%s - LCI";
const APP_DESCRIPTION = "Dashboard para análise de performance de marketing de influência.";

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE,
  },
  description: APP_DESCRIPTION,
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_DEFAULT_TITLE,
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: 'https://i.imgur.com/avLJ3iN.png',
    shortcut: 'https://i.imgur.com/avLJ3iN.png',
    apple: 'https://i.imgur.com/avLJ3iN.png',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FF9E4D" },
    { media: "(prefers-color-scheme: dark)", color: "#0A0A10" },
  ],
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LoaderProvider>
              <AuthProvider>
                  {children}
                  <Toaster />
                  <Loader />
              </AuthProvider>
          </LoaderProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
