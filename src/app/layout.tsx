import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BBD Fee Payment & Student Details",
  description: "Search and view student fee payment and academic details from BBD portal.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-white text-gray-900">
      <body className="min-h-full bg-gray-50 text-gray-900 antialiased">{children}</body>
    </html>
  );
}
