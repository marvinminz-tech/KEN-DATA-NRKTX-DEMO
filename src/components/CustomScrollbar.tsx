import React, { useRef, useState, useEffect, useCallback } from "react";

interface CustomScrollbarProps {
  gridScrollId: string;
  totalWidth: number;
}

export default function CustomScrollbar({ gridScrollId, totalWidth }: CustomScrollbarProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const [thumbWidth, setThumbWidth] = useState(100);
  const [thumbLeft, setThumbLeft] = useState(0);
  const dragging = useRef(false);
  const dragStartX = useRef(0);
  const dragStartLeft = useRef(0);

  const updateThumb = useCallback(() => {
    const grid = document.getElementById(gridScrollId);
    const track = trackRef.current;
    if (!grid || !track) return;
    const visibleRatio = grid.clientWidth / totalWidth;
    const tw = Math.max(40, track.clientWidth * visibleRatio);
    const maxScroll = totalWidth - grid.clientWidth;
    const scrollRatio = maxScroll > 0 ? grid.scrollLeft / maxScroll : 0;
    const maxThumbLeft = track.clientWidth - tw;
    setThumbWidth(tw);
    setThumbLeft(scrollRatio * maxThumbLeft);
  }, [gridScrollId, totalWidth]);

  useEffect(() => {
    const grid = document.getElementById(gridScrollId);
    if (!grid) return;
    const handler = () => updateThumb();
    grid.addEventListener("scroll", handler);
    updateThumb();
    const ro = new ResizeObserver(handler);
    ro.observe(grid);
    return () => {
      grid.removeEventListener("scroll", handler);
      ro.disconnect();
    };
  }, [gridScrollId, updateThumb]);

  const handleTrackClick = (e: React.MouseEvent) => {
    if (e.target === thumbRef.current) return;
    const track = trackRef.current;
    const grid = document.getElementById(gridScrollId);
    if (!track || !grid) return;
    const rect = track.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = clickX / track.clientWidth;
    grid.scrollLeft = ratio * (totalWidth - grid.clientWidth);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    dragging.current = true;
    dragStartX.current = e.clientX;
    dragStartLeft.current = thumbLeft;
    document.body.style.userSelect = "none";
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      const track = trackRef.current;
      const grid = document.getElementById(gridScrollId);
      if (!track || !grid) return;
      const delta = e.clientX - dragStartX.current;
      const maxThumbLeft = track.clientWidth - thumbWidth;
      const newLeft = Math.max(0, Math.min(maxThumbLeft, dragStartLeft.current + delta));
      const ratio = maxThumbLeft > 0 ? newLeft / maxThumbLeft : 0;
      grid.scrollLeft = ratio * (totalWidth - grid.clientWidth);
    };
    const handleMouseUp = () => {
      dragging.current = false;
      document.body.style.userSelect = "";
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [gridScrollId, totalWidth, thumbWidth]);

  return (
    <div
      ref={trackRef}
      className="shrink-0 h-4 bg-muted/50 cursor-pointer relative mx-1 my-1 rounded-full"
      onClick={handleTrackClick}
    >
      <div
        ref={thumbRef}
        className="absolute top-0.5 h-3 rounded-full bg-muted-foreground/35 hover:bg-muted-foreground/50 active:bg-muted-foreground/60 cursor-grab active:cursor-grabbing transition-colors"
        style={{ width: thumbWidth, left: thumbLeft }}
        onMouseDown={handleMouseDown}
      />
    </div>
  );
}
