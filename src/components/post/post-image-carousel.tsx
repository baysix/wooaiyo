'use client';

import { useImageViewer } from '@/components/ui/image-viewer';

export default function PostImageCarousel({ images, title }: { images: string[]; title: string }) {
  const { open, viewer } = useImageViewer();

  if (!images || images.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center bg-gray-100 text-gray-300">
        <svg className="h-16 w-16" fill="currentColor" viewBox="0 0 24 24">
          <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex snap-x snap-mandatory overflow-x-auto hide-scrollbar">
        {images.map((img, i) => (
          <div
            key={i}
            className="h-80 w-full flex-shrink-0 snap-center cursor-pointer"
            onClick={() => open(images, i)}
          >
            <img src={img} alt={`${title} ${i + 1}`} className="h-full w-full object-cover" />
          </div>
        ))}
      </div>
      {images.length > 1 && (
        <div className="absolute bottom-3 right-3 rounded-full bg-black/50 px-2.5 py-1 text-xs text-white">
          1/{images.length}
        </div>
      )}
      {viewer}
    </div>
  );
}
