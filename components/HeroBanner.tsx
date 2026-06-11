import Image from "next/image";

export function HeroBanner({ eyebrow, title, summary, image = "/assets/markets/chile-copper-ore.jpg" }: { eyebrow: string; title: string; summary: string; image?: string }) {
  return (
    <section className="page-hero">
      <Image src={image} alt={title} fill priority sizes="100vw" />
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{summary}</p>
      </div>
    </section>
  );
}
