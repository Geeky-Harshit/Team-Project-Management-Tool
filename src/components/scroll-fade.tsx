"use client";

import { AutoHideScrollbar } from "@/components/auto-hide-scrollbar";
import { ChevronsDown, ChevronsUp } from "lucide-react";
import { ReactNode, useEffect, useRef, useState } from "react";

interface ScrollFadeProps {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  maxHeight?: string;
  fadeColor?: string;
  showChevrons?: boolean;
}

export function ScrollFade({
  children,
  className = "",
  contentClassName = "",
  maxHeight = "h-full",
  fadeColor = "from-white via-white/80 to-transparent",
  showChevrons = true,
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
    const el = ref.current;
    if (!el) return;

    const observer = new ResizeObserver(checkScroll);
    observer.observe(el);
    if (el.firstElementChild) observer.observe(el.firstElementChild);

    window.addEventListener("resize", checkScroll);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", checkScroll);
    };
  }, [children]);

  return (
    <div className={`relative min-h-0 overflow-hidden ${maxHeight} ${className}`}>
      {showTop && (
        <div className={`pointer-events-none absolute inset-x-0 top-0 z-10 flex h-8 items-start justify-center bg-linear-to-b ${fadeColor}`}>
          {showChevrons && (
            <ChevronsUp className="mt-0.5 h-3.5 w-3.5 animate-bounce text-gray-400" />
          )}
        </div>
      )}

      <AutoHideScrollbar
        ref={ref}
        className={`${maxHeight} h-full min-h-0`}
        contentClassName={`${maxHeight} ${contentClassName}`}
        onScroll={checkScroll}
      >
        {children}
      </AutoHideScrollbar>

      {showBottom && (
        <div className={`pointer-events-none absolute inset-x-0 bottom-0 z-10 flex h-8 items-end justify-center bg-linear-to-t ${fadeColor} pb-0.5`}>
          {showChevrons && (
            <ChevronsDown className="mb-0.5 h-3.5 w-3.5 animate-bounce text-gray-400" />
          )}
        </div>
      )}
    </div>
  );
}
