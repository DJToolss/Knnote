import type { Metadata } from "next";
import { IBM_Plex_Mono, Inter } from "next/font/google";
import "aos/dist/aos.css"; // AOS styles
import "./globals.css";
import AOSInitializer from "@/components/AOSInitializer";
import AuthProvider from "@/components/AuthProvider";
import Header from "@/components/Header";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Knnote",
  description: "A quiet place for projects, notes, and status",
};

const themeInitScript = `(function(){try{var t=localStorage.getItem('knnote-theme');if(t!=='dark'&&t!=='light')t='light';document.documentElement.setAttribute('data-theme',t);document.documentElement.style.colorScheme=t;}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${plexMono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="antialiased min-h-screen">
        <AuthProvider>
          <AOSInitializer>
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-grow">
                {children}
              </main>
            </div>
          </AOSInitializer>
        </AuthProvider>
      </body>
    </html>
  );
}
