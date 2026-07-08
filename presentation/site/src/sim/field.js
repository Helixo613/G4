// Ambient particle-field engine (framework-agnostic). Draws a slow drifting
// constellation of nodes with proximity links — a visual echo of "tokens
// attending to tokens" that stays alive in the background of every slide.
// Pure canvas + rAF math, no dependency.

const rand = (min, max) => min + Math.random() * (max - min);

export function createField(count, width, height, speed = 1) {
  return Array.from({ length: count }, () => ({
    x: rand(0, width),
    y: rand(0, height),
    vx: rand(-0.014, 0.014) * speed,
    vy: rand(-0.01, 0.01) * speed,
    r: rand(1, 2.6),
  }));
}

export function stepField(particles, width, height, dt) {
  const dtClamped = Math.min(dt, 48);
  for (const p of particles) {
    p.x += p.vx * dtClamped;
    p.y += p.vy * dtClamped;
    if (p.x < -20) p.x = width + 20;
    if (p.x > width + 20) p.x = -20;
    if (p.y < -20) p.y = height + 20;
    if (p.y > height + 20) p.y = -20;
  }
}

export function drawField(ctx, particles, width, height, options) {
  const { linkDistance = 150, color = "85, 183, 255", lineAlpha = 0.16, dotAlpha = 0.55 } = options || {};
  ctx.clearRect(0, 0, width, height);
  ctx.lineWidth = 1;
  for (let i = 0; i < particles.length; i += 1) {
    const a = particles[i];
    for (let j = i + 1; j < particles.length; j += 1) {
      const b = particles[j];
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < linkDistance) {
        ctx.strokeStyle = `rgba(${color}, ${lineAlpha * (1 - dist / linkDistance)})`;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
  }
  ctx.fillStyle = `rgba(${color}, ${dotAlpha})`;
  for (const p of particles) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  }
}
