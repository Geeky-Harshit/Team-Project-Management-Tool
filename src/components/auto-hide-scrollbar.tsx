"use client";

import { cn } from "@/lib/utils";
import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
  type UIEvent,
} from "react";

interface AutoHideScrollbarProps {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  onScroll?: (event: UIEvent<HTMLDivElement>) => void;
}

export const AutoHideScrollbar = forwardRef<HTMLDivElement, AutoHideScrollbarProps>(
  function AutoHideScrollbar(
    { children, className, contentClassName, onScroll },
    forwardedRef,
  ) {
    const containerRef = useRef<HTMLDivElement>(null);
    const hideTimer = useRef<number | null>(null);
    const thumbRef = useRef<HTMLDivElement>(null);
    const trackNeeded = useRef(false);

    const setContainerRef = useCallback(
      (node: HTMLDivElement | null) => {
        containerRef.current = node;
        if (typeof forwardedRef === "function") {
          forwardedRef(node);
        } else if (forwardedRef) {
          forwardedRef.current = node;
        }
      },
      [forwardedRef],
    );

    const updateThumb = useCallback(() => {
      const el = containerRef.current;
      const thumb = thumbRef.current;
      if (!el || !thumb) return;

      const { scrollTop, scrollHeight, clientHeight } = el;
      const needed = scrollHeight > clientHeight + 1;
      trackNeeded.current = needed;
      thumb.style.display = needed ? "block" : "none";
      if (!needed) return;

      const height = Math.max(20, (clientHeight / scrollHeight) * clientHeight);
      const maxTop = clientHeight - height;
      const top =
        scrollHeight === clientHeight
          ? 0
          : (scrollTop / (scrollHeight - clientHeight)) * maxTop;

      thumb.style.height = `${height}px`;
      thumb.style.transform = `translateY(${top}px)`;
    }, []);

    const showThumb = useCallback(() => {
      const thumb = thumbRef.current;
      if (!thumb || !trackNeeded.current) return;

      thumb.style.opacity = "1";
      if (hideTimer.current) window.clearTimeout(hideTimer.current);
      hideTimer.current = window.setTimeout(() => {
        if (thumbRef.current) thumbRef.current.style.opacity = "0";
      }, 900);
    }, []);

    const handleScroll = useCallback(
      (event: UIEvent<HTMLDivElement>) => {
        updateThumb();
        showThumb();
        onScroll?.(event);
      },
      [onScroll, showThumb, updateThumb],
    );

    useEffect(() => {
      updateThumb();
      const el = containerRef.current;
      if (!el) return;

      const observer = new ResizeObserver(updateThumb);
      observer.observe(el);
      if (el.firstElementChild) observer.observe(el.firstElementChild);

      return () => {
        observer.disconnect();
        if (hideTimer.current) window.clearTimeout(hideTimer.current);
      };
    }, [updateThumb, children]);

    return (
      <div className={cn("relative min-h-0", className)}>
        <div
          ref={setContainerRef}
          onScroll={handleScroll}
          className={cn(
            "h-full min-h-0 max-h-[inherit] overflow-y-auto overscroll-y-contain scrollbar-none",
            contentClassName,
          )}
        >
          {children}
        </div>
        <div
          ref={thumbRef}
          aria-hidden
          className="pointer-events-none absolute top-0 right-0.5 hidden w-0.75 rounded-full bg-gray-400/70 opacity-0 transition-opacity duration-300"
        />
      </div>
    );
  },
);
