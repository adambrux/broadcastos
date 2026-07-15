import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { AppSplashScreen } from "@/components/app-splash-screen";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "BroadcastOS",
    template: "%s · BroadcastOS",
  },
  description: "A premium radio production suite for Premier.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">
        <TooltipProvider>
          <AppSplashScreen />
          <AppShell>{children}</AppShell>
        </TooltipProvider>
      </body>
    </html>
  );
}
