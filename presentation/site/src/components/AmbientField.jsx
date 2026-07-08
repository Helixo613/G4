import { useEffect, useRef } from "react";
import { useRaf } from "../hooks/useRaf.js";
import { createField, drawField, stepField } from "../sim/field.js";

/**
 * Always-alive canvas background. Low-contrast, never blocks reading —
 * the "ambient" half of the hybrid motion model: every slide feels alive
 * even between clicks.
 */
export function AmbientField({ density = 46, color = "85, 183, 255", speed = 1, className = "" }) {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const sizeRef = useRef({ width: 0, height: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const resize = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.getContext("2d").setTransform(dpr, 0, 0, dpr, 0, 0);
      sizeRef.current = { width: rect.width, height: rect.height };
      particlesRef.current = createField(density, rect.width, rect.height, speed);
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [density, speed]);

  useRaf(true, (elapsed, delta) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { width, height } = sizeRef.current;
    if (!width) return;
    stepField(particlesRef.current, width, height, delta || 16);
    drawField(canvas.getContext("2d"), particlesRef.current, width, height, { color });
  });

  return <canvas ref={canvasRef} className={`ambient-field ${className}`} aria-hidden="true" />;
}
