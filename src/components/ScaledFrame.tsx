"use client";

import { useEffect, useRef, useState } from "react";
import { Skeleton } from "@/components/ui/Skeleton";

type ScaledFrameProps = {
  src: string;
  title: string;
  /** Width the page is laid out at inside the frame, e.g. 1280 for desktop or 390 for a phone. */
  viewportWidth: number;
  /** Visible height as a ratio of the container width. */
  aspect: number;
  className?: string;
  interactive?: boolean;
};

/** A real rendered page, shrunk to fit its container. Sandboxed, with a skeleton while it loads. */
export function ScaledFrame({ src, title, viewportWidth, aspect, className = "", interactive = false }: ScaledFrameProps) {
  const box = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const element = box.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const scale = width ? width / viewportWidth : 0;
  const height = width * aspect;

  return (
    <div ref={box} className={`relative w-full overflow-hidden bg-surface ${className}`} style={{ height: height || undefined, aspectRatio: height ? undefined : `${1 / aspect}` }}>
      {!loaded ? <Skeleton className="absolute inset-0 rounded-none" /> : null}
      {scale ? (
        <iframe
          src={src}
          title={title}
          sandbox="allow-scripts"
          loading="lazy"
          tabIndex={interactive ? 0 : -1}
          aria-hidden={interactive ? undefined : true}
          onLoad={() => setLoaded(true)}
          className={`absolute top-0 left-0 origin-top-left border-0 bg-white transition-opacity duration-200 ease-standard ${loaded ? "opacity-100" : "opacity-0"} ${interactive ? "" : "pointer-events-none"}`}
          style={{ width: viewportWidth, height: height / scale, transform: `scale(${scale})` }}
        />
      ) : null}
    </div>
  );
}
