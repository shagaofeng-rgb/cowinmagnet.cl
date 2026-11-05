"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import type { Locale } from "@/data/site";
import { InteriorIcon } from "@/components/InteriorIcon";

type Props = {
  images: string[];
  alt: string;
  locale: Locale;
};

function isRemoteImage(src: string) {
  return src.startsWith("http://") || src.startsWith("https://") || src.startsWith("data:");
}

export function ProductMediaGallery({ images, alt, locale }: Props) {
  const copy = locale === "en"
    ? { unavailable: "Product image available on request", enlarge: "Enlarge image of", view: "View image", gallery: "Product gallery", viewNumber: "view", expanded: "Expanded gallery", close: "Close image", controls: "Gallery controls", previous: "Previous image", next: "Next image" }
    : locale === "pt-br"
      ? { unavailable: "Imagem do produto disponível sob solicitação", enlarge: "Ampliar imagem de", view: "Ver imagem", gallery: "Galeria de produto", viewNumber: "vista", expanded: "Galeria ampliada", close: "Fechar imagem", controls: "Controles da galeria", previous: "Imagem anterior", next: "Próxima imagem" }
      : { unavailable: "Imagen de producto disponible bajo solicitud", enlarge: "Ampliar imagen de", view: "Ver imagen", gallery: "Galería de producto", viewNumber: "vista", expanded: "Galería ampliada", close: "Cerrar imagen", controls: "Controles de galería", previous: "Imagen anterior", next: "Imagen siguiente" };
  const validImages = [...new Set(images.filter(Boolean))];
  const [activeIndex, setActiveIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const activeImage = validImages[activeIndex] ?? validImages[0];
  const move = (direction: number) => setActiveIndex((index) => (index + direction + validImages.length) % validImages.length);

  if (!activeImage) {
    return <div className="notice">{copy.unavailable}</div>;
  }

  return <div>
    <button className="product-figure" type="button" onClick={() => { setExpanded(true); dialog.current?.showModal(); }} aria-label={copy.enlarge + " " + alt}>
      <Image src={activeImage} alt={alt} width={1200} height={900} preload={activeIndex === 0} sizes="(max-width: 760px) 100vw, 50vw" unoptimized={isRemoteImage(activeImage)} />
    </button>
    {validImages.length > 1 ? <div className="thumbs" aria-label={copy.gallery}>
      {validImages.map((image, index) => <button type="button" onClick={() => setActiveIndex(index)} key={image} aria-label={alt + ", " + copy.viewNumber + " " + (index + 1)} aria-pressed={index === activeIndex}>
        <Image src={image} alt="" width={72} height={72} sizes="72px" unoptimized={isRemoteImage(image)} />
      </button>)}
    </div> : null}
    <dialog ref={dialog} aria-label={copy.expanded + ": " + alt} onClose={() => setExpanded(false)} onKeyDown={(event) => {
      if (event.key === "ArrowLeft") move(-1);
      if (event.key === "ArrowRight") move(1);
    }}>
        <button className="btn alt gallery-close" type="button" onClick={() => dialog.current?.close()} aria-label={copy.close}><InteriorIcon name="x" /></button>
        {expanded ? <Image src={activeImage} alt={alt} width={1600} height={1200} sizes="96vw" unoptimized={isRemoteImage(activeImage)} /> : null}
        {validImages.length > 1 ? <div className="gallery-controls" aria-label={copy.controls}>
          <button className="btn alt" type="button" onClick={() => move(-1)}>{copy.previous}</button>
          <span>{activeIndex + 1} / {validImages.length}</span>
          <button className="btn alt" type="button" onClick={() => move(1)}>{copy.next}</button>
        </div> : null}
    </dialog>
  </div>;
}

export const ProductGallery = ProductMediaGallery;
