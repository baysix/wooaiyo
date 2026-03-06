'use client';

import { useImageViewer } from '@/components/ui/image-viewer';

export default function ClickableImages({ images, className }: { images: string[]; className?: string }) {
  const { open, viewer } = useImageViewer();

  return (
    <>
      {images.map((img, i) => (
        <img
          key={i}
          src={img}
          alt={`첨부 ${i + 1}`}
          className={`cursor-pointer ${className ?? 'w-full rounded-lg object-cover'}`}
          onClick={() => open(images, i)}
        />
      ))}
      {viewer}
    </>
  );
}
