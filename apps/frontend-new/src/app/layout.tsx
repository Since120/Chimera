// apps/frontend-new/src/app/layout.tsx
import type { Metadata } from "next";
// Inter-Schriftart entfernt, da wir Lufga verwenden
import "./globals.css";
import { Provider } from "@/components/ui/provider";

// Inter-Schriftart entfernt, da wir Lufga verwenden

export const metadata: Metadata = {
  title: "Project Chimera Dashboard",
  description: "Dashboard for Project Chimera",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link href="https://fonts.cdnfonts.com/css/lufga" rel="stylesheet" />
      </head>
      <body suppressHydrationWarning>
        <Provider>
          {children}
        </Provider>
      </body>
    </html>
  );
}