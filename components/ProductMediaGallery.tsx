"use client";

import Image from "next/image";
import { useState } from "react";

export function ProductMediaGallery({ images, alt }: { images: string[]; alt: string }) {
  const validImages = images.filter(Boolean);
  const [activeImage, setActiveImage] = useState(validImages[0]);
  const remote = activeImage?.startsWith("http://") || activeImage?.startsWith("https://") || activeImage?.startsWith("data:");

  if (!activeImage) return null;

  return <div className="product-media-gallery">
    <div className="product-media-main">
      <Image src={activeImage} alt={alt} width={980} height={760} priority sizes="(max-width: 960px) 100vw, 50vw" unoptimized={remote} />
    </div>
    {validImages.length > 1 ? <div className="product-media-thumbnails" aria-label="Product image gallery">
      {validImages.map((image, index) => <button type="button" className={image === activeImage ? "is-active" : ""} onClick={() => setActiveImage(image)} key={image} aria-label={`${alt} ${index + 1}`} aria-pressed={image === activeImage}>
        <Image src={image} alt="" width={96} height={72} sizes="96px" unoptimized={image.startsWith("http://") || image.startsWith("https://") || image.startsWith("data:")} />
      </button>)}
    </div> : null}
  </div>;
}
