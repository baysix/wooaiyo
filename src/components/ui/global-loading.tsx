'use client';

import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

interface LoadingContextType {
  isLoading: boolean;
  start: () => void;
  done: () => void;
}

const LoadingContext = createContext<LoadingContextType>({
  isLoading: false,
  start: () => {},
  done: () => {},
});

export function useLoading() {
  return useContext(LoadingContext);
}

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const start = useCallback(() => {
    setIsLoading(true);
  }, []);

  const done = useCallback(() => {
    // Small delay so the bar completes its animation
    timerRef.current = setTimeout(() => setIsLoading(false), 200);
  }, []);

  // Stop loading on route change
  useEffect(() => {
    done();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [pathname, done]);

  // Intercept internal link clicks to trigger loading bar
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const anchor = (e.target as HTMLElement).closest('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href || href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto:')) return;

      // Don't trigger for same-page links
      if (href === pathname) return;

      start();
    }

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [pathname, start]);

  return (
    <LoadingContext.Provider value={{ isLoading, start, done }}>
      <GlobalLoadingBar isLoading={isLoading} />
      {children}
    </LoadingContext.Provider>
  );
}

function GlobalLoadingBar({ isLoading }: { isLoading: boolean }) {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);

  useEffect(() => {
    if (isLoading) {
      setVisible(true);
      setProgress(10);

      // Gradually increase progress
      timerRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(timerRef.current);
            return 90;
          }
          return prev + (90 - prev) * 0.1;
        });
      }, 200);
    } else if (visible) {
      // Complete the bar
      setProgress(100);
      clearInterval(timerRef.current);

      const hideTimer = setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 300);

      return () => clearTimeout(hideTimer);
    }

    return () => clearInterval(timerRef.current);
  }, [isLoading, visible]);

  if (!visible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-[3px]">
      <div
        className="h-full bg-[#20C997] transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
