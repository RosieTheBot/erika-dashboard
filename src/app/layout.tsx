import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "Erika's Home Base Dashboard",
  description: "Real estate business management dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <div className="flex min-h-screen bg-primary-900 flex-col md:flex-row">
          <Sidebar />
          <main className="flex-1 overflow-auto pt-16 md:pt-0 w-full">{children}</main>
        </div>
      </body>
    </html>
  );
}
