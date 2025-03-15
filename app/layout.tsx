import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Outfit } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "./components/layout/site-header";
import { AuthProvider } from "@/components/auth/AuthContext";
import { ToastProvider } from "@/components/ui/use-toast";
import { ensureTournamentSettings } from "@/lib/tournamentHelpers";

if (typeof window !== 'undefined') {
  setTimeout(() => {
    ensureTournamentSettings().catch(error => {
      console.error('Failed to initialize tournament settings:', error);
    });
  }, 1000);
}

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Govindo Tea Stall",
  description: "Track daily attendance for Adda and Carrom sections",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script src="/share-modal.js" async></script>
      </head>
      <body className={`${jakarta.variable} ${outfit.variable} font-sans antialiased`}>
        <AuthProvider>
          <ToastProvider>
            <div className="relative flex min-h-screen flex-col">
              <SiteHeader />
              <main className="flex-1 pt-16">{children}</main>
            </div>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
