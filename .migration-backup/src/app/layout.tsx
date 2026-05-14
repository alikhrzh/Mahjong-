import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mahjong Solitaire",
  description: "Premium casual Mahjong Solitaire prototype",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-dvh font-sans antialiased">
        <Script id="theme-boot" strategy="beforeInteractive">
          {`(function(){try{var v=localStorage.getItem("theme"),d=v==="dark"||(v!=="light"&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d);}catch(e){}})();`}
        </Script>
        {children}
      </body>
    </html>
  );
}
