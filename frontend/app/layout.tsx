import { ThemeProvider } from "next-themes";
import "./globals.css";
import type { Metadata } from "next";
import NavbarShell from "@/components/shared/page/navbar/NavbarShell";

export const metadata: Metadata = {
  title: "Alpha Queue",
  description: "Next.js app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          {/* <NavbarShell>{children}</NavbarShell> */}
        </ThemeProvider>
      </body>
    </html>
  );
}
