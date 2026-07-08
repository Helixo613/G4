// Shared easing + geometry helpers. No animation library — everything the
// simulations need (moving arcs, traveling pulses, quadratic curves) is a
// few lines of math, so a dependency isn't justified for this scope.

export const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
export const lerp = (a, b, t) => a + (b - a) * t;

export const easeOutCubic = (t) => 1 - (1 - t) ** 3;
export const easeInOutCubic = (t) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2);
export const easeOutBack = (t) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2;
};

/** Control point for a quadratic arc between two x positions on a baseline. */
export function arcControl(x1, x2, baseline, bow) {
  return { cx: (x1 + x2) / 2, cy: baseline - bow };
}

/** Point at parameter t (0..1) along a quadratic bezier. */
export function quadPoint(t, x1, y1, cx, cy, x2, y2) {
  const mt = 1 - t;
  return {
    x: mt * mt * x1 + 2 * mt * t * cx + t * t * x2,
    y: mt * mt * y1 + 2 * mt * t * cy + t * t * y2,
  };
}

export function quadPath(x1, y1, cx, cy, x2, y2) {
  return `M${x1},${y1} Q${cx},${cy} ${x2},${y2}`;
}

/** Loops elapsed ms into a repeating 0..1 ramp at the given period. */
export function cycle(elapsed, periodMs) {
  return (elapsed % periodMs) / periodMs;
}
