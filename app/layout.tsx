import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EliseAI Lead Enrichment",
  description: "Automate and augment the inbound lead process with public APIs",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <header className="border-b bg-white">
          <div className="container mx-auto px-4 py-4 max-w-5xl flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight">Elise</span>
              <span className="text-xl font-bold tracking-tight text-blue-600">AI</span>
            </div>
            <div className="h-5 w-px bg-border" />
            <span className="text-sm text-muted-foreground">Lead Enrichment Tool</span>
          </div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
