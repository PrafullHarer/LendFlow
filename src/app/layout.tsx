import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LendFlow - Smart Loan Manager",
  description: "Professional money lending management system for tracking loans, borrowers, and payments",
  keywords: ["loan management", "money lending", "borrower tracking", "payment schedule"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Text:ital@0;1&family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
