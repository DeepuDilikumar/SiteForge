"use client";

import { useEffect, useRef, useState } from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import type { Device } from "./types";

const PHONE_WIDTH = 390;
const PHONE_HEIGHT = 844;

/**
 * Sandboxed preview of the server-rendered site. Two iframes are double-buffered so a refresh
 * after an edit swaps in the new render only once it has loaded, without a blank flash.
 */
export function PreviewPane({ siteId, version, device, title }: { siteId: string; version: number; device: Device; title: string }) {
  const [frames, setFrames] = useState<Array<{ version: number; loaded: boolean }>>([{ version, loaded: false }]);
  const area = useRef<HTMLDivElement>(null);
  const [areaSize, setAreaSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- queue a new buffer when the version changes
    setFrames((current) => (current.some((frame) => frame.version === version) ? current : [...current.slice(-1), { version, loaded: false }]));
  }, [version]);

  useEffect(() => {
    const element = area.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setAreaSize({ width: entry.contentRect.width, height: entry.contentRect.height }));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const visible = [...frames].reverse().find((frame) => frame.loaded)?.version;
  const phoneScale = Math.min(1, (areaSize.height - 48) / PHONE_HEIGHT, (areaSize.width - 32) / PHONE_WIDTH);

  const iframes = frames.map((frame) => (
    <iframe
      key={frame.version}
      src={`/api/sites/${siteId}/preview?v=${frame.version}`}
      title={title}
      sandbox="allow-scripts"
      onLoad={() =>
        setFrames((current) => {
          const marked = current.map((item) => (item.version === frame.version ? { ...item, loaded: true } : item));
          const newestLoaded = Math.max(...marked.filter((item) => item.loaded).map((item) => item.version));
          return marked.filter((item) => item.version >= newestLoaded);
        })
      }
      className={`absolute inset-0 h-full w-full border-0 bg-white ${frame.version === visible ? "visible" : "invisible"}`}
    />
  ));

  return (
    <div ref={area} className="relative flex h-full w-full items-start justify-center overflow-hidden bg-surface">
      {device === "desktop" ? (
        <div className="absolute inset-0 sm:inset-4 sm:overflow-hidden sm:rounded-lg sm:border sm:border-border sm:shadow-1">
          {visible === undefined ? <Skeleton className="absolute inset-0 rounded-none" /> : null}
          {iframes}
        </div>
      ) : (
        <div
          className="mt-6 origin-top"
          style={{ transform: phoneScale > 0 && phoneScale < 1 ? `scale(${phoneScale})` : undefined }}
        >
          <div className="rounded-[48px] bg-[#1f1f1f] p-3 shadow-2">
            <div className="relative overflow-hidden rounded-[38px] bg-white" style={{ width: PHONE_WIDTH, height: PHONE_HEIGHT }}>
              {visible === undefined ? <Skeleton className="absolute inset-0 rounded-none" /> : null}
              {iframes}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
