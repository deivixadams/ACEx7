import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import StatusBar from "./components/StatusBar";
import { ThemeProvider } from "./components/ThemeProvider";
import { SidebarProvider } from "./context/SidebarContext";
import LayoutWrapper from "./components/LayoutWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ACEx7 Dashboard",
  description: "Sistema de Auditoría AML/FT",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <SidebarProvider>
        <LayoutWrapper>{children}</LayoutWrapper>
      </SidebarProvider>
    </html>
  );
}
