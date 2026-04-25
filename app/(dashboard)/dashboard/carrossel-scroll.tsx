"use client";

import { useRef, useState, useEffect } from "react";

export function CarrosselScroll({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [arrastando, setArrastando] = useState(false);
  const estado = useRef({ startX: 0, scrollLeft: 0, moveu: false });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onClickCapture = (e: MouseEvent) => {
      if (estado.current.moveu) {
        e.preventDefault();
        e.stopPropagation();
        estado.current.moveu = false;
      }
    };
    el.addEventListener("click", onClickCapture, true);
    return () => el.removeEventListener("click", onClickCapture, true);
  }, []);

  function onMouseDown(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    setArrastando(true);
    estado.current.startX = e.pageX - el.offsetLeft;
    estado.current.scrollLeft = el.scrollLeft;
    estado.current.moveu = false;
  }

  function onMouseLeave() {
    setArrastando(false);
  }

  function onMouseUp() {
    setArrastando(false);
  }

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!arrastando) return;
    const el = ref.current;
    if (!el) return;
    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const dist = x - estado.current.startX;
    if (Math.abs(dist) > 5) estado.current.moveu = true;
    el.scrollLeft = estado.current.scrollLeft - dist;
  }

  return (
    <div
      ref={ref}
      onMouseDown={onMouseDown}
      onMouseLeave={onMouseLeave}
      onMouseUp={onMouseUp}
      onMouseMove={onMouseMove}
      className={`-mx-4 sm:mx-0 overflow-x-auto snap-x snap-mandatory carrossel-hide-scrollbar select-none ${
        arrastando ? "cursor-grabbing" : "cursor-grab"
      }`}
    >
      <div className="flex gap-4 px-4 sm:px-0 pb-2">{children}</div>
    </div>
  );
}
