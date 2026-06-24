import Image from "next/image";

export function HeroBanner({ eyebrow, title, summary, image = "/assets/home-hero-cowinmagnet-ai.jpg", imageMode = "scene" }: { eyebrow: string; title: string; summary: string; image?: string; imageMode?: "scene" | "product" }) {
  return (
    <section className={`page-hero ${imageMode === "product" ? "page-hero-product" : ""}`}>
      <Image src={image} alt={title} fill priority sizes="100vw" />
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{summary}</p>
      </div>
    </section>
  );
}
