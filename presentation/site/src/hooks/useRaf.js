import { useEffect, useRef } from "react";

/**
 * Single requestAnimationFrame loop. Fires callback(elapsedMs, deltaMs) every
 * frame while `active` is true. Loop is torn down (and elapsed reset) when
 * `active` goes false, so slides that aren't visible don't burn cycles.
 */
export function useRaf(active, callback) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    if (!active) return undefined;
    let frame = null;
    let start = null;
    let prev = null;

    const tick = (timestamp) => {
      if (start === null) start = timestamp;
      const elapsed = timestamp - start;
      const delta = prev === null ? 0 : timestamp - prev;
      prev = timestamp;
      callbackRef.current(elapsed, delta);
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active]);
}
