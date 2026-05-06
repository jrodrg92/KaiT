import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/app/globals.css";
import { QueryProvider } from "@/components/providers/query-provider";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "AgentRail | Infrastructure for AI Agents",
  description: "Programmable payment rails and wallet infrastructure for autonomous agents on Kaspa.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={cn(
        "min-h-screen bg-background font-sans antialiased selection:bg-primary/20 selection:text-primary",
        inter.variable
      )}>
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}


