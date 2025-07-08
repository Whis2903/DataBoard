import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from 'react-hot-toast';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Global Happiness Analytics | Data Dashboard",
  description: "Advanced interactive dashboard for exploring world happiness trends, correlations, and insights across countries and regions with beautiful data visualizations",
  keywords: ["happiness", "data", "analytics", "dashboard", "world bank", "visualization"],
  authors: [{ name: "Global Happiness Analytics Team" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-900 text-slate-100 min-h-screen`}
      >
        <div className="relative">
          <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 -z-10" />
          
          <div className="fixed inset-0 -z-10">
            <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse-slow" />
            <div className="absolute top-40 right-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
            <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
          </div>
          
          {children}
          
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'rgba(30, 41, 59, 0.9)',
                color: '#f8fafc',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                backdropFilter: 'blur(20px)',
              },
            }}
          />
        </div>
      </body>
    </html>
  );
}
