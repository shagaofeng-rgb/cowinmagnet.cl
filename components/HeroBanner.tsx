import Image from "next/image";

export function HeroBanner({ eyebrow, title, summary, image = "/assets/home-hero-cowinmagnet-ai.jpg", imageMode = "scene" }: { eyebrow: string; title: string; summary: string; image?: string; imageMode?: "scene" | "product" }) {
  const remoteImage = /^https?:\/\//i.test(image);
  return (
    <section className={`page-hero ${imageMode === "product" ? "page-hero-product" : ""}`}>
      {remoteImage ? <img src={image} alt={title} fetchPriority="high" /> : <Image src={image} alt={title} fill priority sizes="100vw" />}
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{summary}</p>
      </div>
    </section>
  );
}
