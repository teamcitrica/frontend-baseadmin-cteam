import "@/styles/globals.scss";
import { Metadata } from "next";

import { Providers } from "../shared/providers";

import { siteConfig } from "@/config/site";
// import { Toaster } from 'react-hot-toast';
import SupabaseProvider from '@/shared/context/supabase-context'
import { AuthContextProvider } from '@/shared/context/auth-context'
import { AvailabilityProvider } from "./api/contexts/AvailabilityContext";

// import Navbar from "@ui/organism/navbar";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s -${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="es">
      <head />
      <body>
        {/* <Toaster/>  SE CAMBIÓ POR HEROUI TOAST*/}
        <SupabaseProvider>
          <AuthContextProvider>
            <AvailabilityProvider>
              <Providers
                themeProps={{ attribute: "data-theme", defaultTheme: "light" }}
              >
                {/* <Navbar /> */}
                {children}
              </Providers>
            </AvailabilityProvider>
          </AuthContextProvider>
        </SupabaseProvider>
      </body>
    </html>
  );
}
