"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type Props = {
  images: string[];
  alt: string;
};

function isRemoteImage(src: string) {
  return src.startsWith("http://") || src.startsWith("https://") || src.startsWith("data:");
}

export function ProductMediaGallery({ images, alt }: Props) {
  const validImages = [...new Set(images.filter(Boolean))];
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const activeImage = validImages[activeIndex];

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightboxOpen(false);
      if (event.key === "ArrowRight") setActiveIndex((index) => (index + 1) % validImages.length);
      if (event.key === "ArrowLeft") setActiveIndex((index) => (index - 1 + validImages.length) % validImages.length);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [lightboxOpen, validImages.length]);

  if (!activeImage) {
    return <div className="pd-gallery-empty" aria-label="Imagen de producto disponible bajo solicitud"><span /></div>;
  }

  return <div className="pd-gallery">
    <button className="pd-gallery-main" type="button" onClick={() => setLightboxOpen(true)} aria-label={`Ampliar imagen de ${alt}`}>
      <Image src={activeImage} alt={alt} width={1200} height={900} priority sizes="(max-width: 960px) 100vw, 58vw" unoptimized={isRemoteImage(activeImage)} />
      <span className="pd-gallery-zoom-label">Ver imagen</span>
    </button>
    {validImages.length > 1 ? <div className="pd-gallery-thumbnails" aria-label="Galería de producto">
      {validImages.map((image, index) => <button type="button" className={index === activeIndex ? "is-active" : ""} onClick={() => setActiveIndex(index)} key={image} aria-label={`${alt}, vista ${index + 1}`} aria-pressed={index === activeIndex}>
        <Image src={image} alt="" width={72} height={72} sizes="72px" unoptimized={isRemoteImage(image)} />
      </button>)}
    </div> : null}
    {lightboxOpen ? <div className="pd-lightbox" role="dialog" aria-modal="true" aria-label={`Galería ampliada: ${alt}`} onMouseDown={() => setLightboxOpen(false)}>
      <div className="pd-lightbox-content" onMouseDown={(event) => event.stopPropagation()}>
        <button className="pd-lightbox-close" type="button" onClick={() => setLightboxOpen(false)} aria-label="Cerrar imagen">×</button>
        <Image src={activeImage} alt={alt} width={1600} height={1200} sizes="96vw" unoptimized={isRemoteImage(activeImage)} />
        {validImages.length > 1 ? <div className="pd-lightbox-controls" aria-label="Controles de galería">
          <button type="button" onClick={() => setActiveIndex((index) => (index - 1 + validImages.length) % validImages.length)} aria-label="Imagen anterior">Anterior</button>
          <span>{activeIndex + 1} / {validImages.length}</span>
          <button type="button" onClick={() => setActiveIndex((index) => (index + 1) % validImages.length)} aria-label="Imagen siguiente">Siguiente</button>
        </div> : null}
      </div>
    </div> : null}
  </div>;
}

export const ProductGallery = ProductMediaGallery;
