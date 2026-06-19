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
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Cowinmagnet.cl",
    alternateName: ["Cowinmagnet LATAM", "Cowinmagnet Chile and South America"],
    url: "https://cowinmagnet.cl",
    logo: "https://cowinmagnet.cl/assets/logo.jpg",
    email: "davidsha@cowinmagnet.com",
    areaServed: ["Chile", "Peru", "Brazil", "Argentina", "Bolivia", "Colombia", "Ecuador", "Mexico", "Canada", "United States"],
    sameAs: ["https://www.cowinmagnet.com"]
  };

  return (
    <html lang="es-cl">
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
        {children}
      </body>
    </html>
  );
}
