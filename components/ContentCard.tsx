import Image from "next/image";
import Link from "next/link";

export function ContentCard({ title, summary, image, href }: { title: string; summary: string; image: string; href: string }) {
  const detailLabel = href.startsWith("/en/") ? "View details" : href.startsWith("/pt-br/") ? "Ver detalhes" : "Ver detalle";
  return (
    <article className="content-card">
      <Image src={image} alt={title} width={720} height={540} />
      <div className="content-card-body">
        <h3>{title}</h3>
        <p>{summary}</p>
        <Link href={href}>{detailLabel}</Link>
      </div>
    </article>
  );
}
