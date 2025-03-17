import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GTA San Andreas Radio Song Quiz",
  description:
    "Test your knowledge of Grand Theft Auto: San Andreas radio songs",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} bg-zinc-900 text-white min-h-screen`}
      >
        <div className="container mx-auto px-4 py-8">{children}</div>
      </body>
    </html>
  );
}
