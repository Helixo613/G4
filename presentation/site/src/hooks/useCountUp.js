import { useEffect, useState } from "react";
import { easeOutCubic } from "../sim/motion.js";

/**
 * Animates a number from 0 -> target whenever `active` flips true, easing
 * out over `duration` ms. Used anywhere a stat should "count up" instead of
 * snapping in (BLEU scores, softmax percentages).
 */
export function useCountUp(target, active, duration = 900) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) {
      setValue(0);
      return undefined;
    }
    let frame = null;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      setValue(target * easeOutCubic(t));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, active, duration]);

  return value;
}
