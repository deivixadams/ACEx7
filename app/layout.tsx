import type { Metadata } from "next";
import "./globals.css";
import { SidebarProvider } from "./context/SidebarContext";
import LayoutWrapper from "./components/LayoutWrapper";

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
