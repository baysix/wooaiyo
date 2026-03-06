'use client';

import { useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function ScrollArea({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    ref.current?.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div ref={ref} className="flex-1 overflow-y-auto pb-20">
      {children}
    </div>
  );
}
