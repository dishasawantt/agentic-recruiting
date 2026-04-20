import type { Metadata } from "next";
import { AppNav } from "@/components/AppNav";
import { JourneyBar } from "@/components/JourneyBar";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Agentic Recruiting",
    template: "%s | Agentic Recruiting",
  },
  description:
    "Browse roles, AI resume screening, simulated voice interview, and scorecard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans">
        <AppNav />
        <JourneyBar />
        {children}
      </body>
    </html>
  );
}
