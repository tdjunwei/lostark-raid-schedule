import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { ModeToggle } from "@/components/mode-toggle";
import { UserMenu } from "@/components/user-menu";
import { CustomSidebar, SidebarProvider, SidebarTrigger, MainContent } from "@/components/custom-sidebar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lost Ark 出團管理系統",
  description: "Lost Ark raid schedule management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          <SidebarProvider>
            <div className="flex min-h-screen">
              <CustomSidebar />
              <MainContent>
                <div className="flex items-center justify-between px-6 py-3 border-b">
                  <div className="flex items-center gap-4">
                    <SidebarTrigger />
                  </div>
                  <div className="flex items-center gap-4">
                    <ModeToggle />
                    <UserMenu />
                  </div>
                </div>
                {children}
              </MainContent>
            </div>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
