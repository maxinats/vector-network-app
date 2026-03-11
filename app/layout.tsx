import type { Metadata } from "next";
import { LanguageProvider } from "@/components/providers/language-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vector Network",
  description: "Curated network of builders and early adopters.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
