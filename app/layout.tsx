import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  metadataBase: new URL("https://cowinmagnet.cl"),
  applicationName: "Cowinmagnet.cl",
  title: {
    default: "Cowinmagnet LATAM",
    template: "%s | Cowinmagnet LATAM"
  },
  description: "Cowinmagnet.cl provides magnetic separation equipment, conveyor tramp iron protection, metal detection and recycling sorting support for mining and bulk handling projects in Chile and Latin America.",
  keywords: [
    "magnetic separator Chile",
    "separador magnetico Chile",
    "tramp iron removal",
    "conveyor metal detector",
    "mining magnetic separation",
    "South America mining equipment"
  ],
  robots: {
    index: true,
    follow: true
  },
  openGraph: {
    type: "website",
    siteName: "Cowinmagnet.cl",
    title: "Cowinmagnet LATAM",
    description: "Magnetic separation equipment and technical quotation support for Chile and Latin America.",
    url: "https://cowinmagnet.cl",
    images: [{ url: "/assets/markets/chile-copper-ore.jpg", width: 1200, height: 630, alt: "Cowinmagnet magnetic separation equipment for Chile mining" }]
  },
  twitter: {
    card: "summary_large_image",
    title: "Cowinmagnet LATAM",
    description: "Magnetic separation equipment and technical quotation support for Chile and Latin America.",
    images: ["/assets/markets/chile-copper-ore.jpg"]
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
