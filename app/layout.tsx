import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  metadataBase: new URL("https://cowinmagnet.cl"),
  title: {
    default: "Cowinmagnet LATAM",
    template: "%s | Cowinmagnet LATAM"
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es-cl">
      <body>{children}</body>
    </html>
  );
}
