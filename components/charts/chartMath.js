/**
 * Build an SVG path for a pie slice (center → arc → center).
 * Angles in radians; 0 = right, π/2 = down (SVG coords).
 */
export function pieSlicePath(cx, cy, radius, angleStart, angleEnd) {
  const x0 = cx + radius * Math.cos(angleStart);
  const y0 = cy + radius * Math.sin(angleStart);
  const x1 = cx + radius * Math.cos(angleEnd);
  const y1 = cy + radius * Math.sin(angleEnd);
  const sweep = angleEnd - angleStart;
  const largeArc = Math.abs(sweep) > Math.PI ? 1 : 0;
  const sweepFlag = sweep >= 0 ? 1 : 0;
  return `M ${cx} ${cy} L ${x0} ${y0} A ${radius} ${radius} 0 ${largeArc} ${sweepFlag} ${x1} ${y1} Z`;
}

/** Start pie from top (12 o'clock). */
export const START_ANGLE = -Math.PI / 2;
