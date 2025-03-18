import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GTA Song of the Day",
  description: "Daily challenge: Guess which GTA game featured today's song!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${inter.className} bg-[#0f0f0f] text-white min-h-screen`}
      >
        {/* Adjust container to be more fluid with responsive padding */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-6xl">
          {children}
        </div>
      </body>
    </html>
  );
}
