"use client";

import { ChevronsDown, ChevronsUp } from "lucide-react";
import { ReactNode, useEffect, useRef, useState } from "react";

interface ScrollFadeProps {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  maxHeight?: string;
}

export function ScrollFade({
  children,
  className = "",
  contentClassName = "",
  maxHeight = "max-h-80",
}: ScrollFadeProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [showTop, setShowTop] = useState(false);
  const [showBottom, setShowBottom] = useState(false);

  const checkScroll = () => {
    const el = ref.current;
    if (!el) return;

    const { scrollTop, scrollHeight, clientHeight } = el;
    setShowTop(scrollTop > 0);
    setShowBottom(scrollTop + clientHeight < scrollHeight - 1);
  };

  useEffect(() => {
    checkScroll();
  }, [children]);

  useEffect(() => {
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, []);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {showTop && (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex h-10 items-start justify-center bg-linear-to-b from-white via-white/80 to-transparent">
          <ChevronsUp className="mt-1 h-4 w-4 animate-bounce text-gray-400" />
        </div>
      )}

      <div
        ref={ref}
        onScroll={checkScroll}
        className={`overflow-y-auto pr-2 ${maxHeight} ${contentClassName}`}
      >
        {children}
      </div>

      {showBottom && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex h-10 items-end justify-center bg-linear-to-t from-white via-white/80 to-transparent pb-1">
          <ChevronsDown className="mb-1 h-4 w-4 animate-bounce text-gray-400" />
        </div>
      )}
    </div>
  );
}