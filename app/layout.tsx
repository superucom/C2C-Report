import type { Metadata } from "next";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/hooks/use-auth";
import { C2CDataProvider } from "@/hooks/use-c2c-data";
import "./globals.css";

export const metadata: Metadata = {
  title: "ระบบสรุปรายงาน C2C",
  description: "สรุปยอดฝาก C2C และสรุปยอดโบนัส C2C อัตโนมัติจากไฟล์ Excel",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider>
          <AuthProvider>
            <C2CDataProvider>
              {children}
              <Toaster richColors position="top-right" />
            </C2CDataProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
