/**
 * Procedural gradients from the DevFlix prototype — used for the auth poster
 * wall and as fallback art when a title has no image.
 */
export function posterGradient(hue: number): string {
  const h2 = (hue + 35) % 360
  const h3 = (hue + 70) % 360
  return [
    'repeating-linear-gradient(115deg, rgba(255,255,255,.04) 0px, rgba(255,255,255,.04) 2px, transparent 2px, transparent 9px)',
    `radial-gradient(120% 80% at 20% 0%, oklch(0.55 0.17 ${hue}) 0%, transparent 55%)`,
    `linear-gradient(165deg, oklch(0.45 0.15 ${hue}) 0%, oklch(0.24 0.1 ${h2}) 55%, oklch(0.13 0.05 ${h3}) 100%)`,
  ].join(', ')
}

export function heroGradient(hue: number): string {
  const h2 = (hue + 40) % 360
  return `radial-gradient(110% 130% at 78% 8%, oklch(0.5 0.16 ${hue}) 0%, oklch(0.28 0.11 ${h2}) 45%, #0b0a09 92%)`
}

/** 24 hues spread around the wheel for the animated auth wall. */
export const WALL_HUES = Array.from({ length: 24 }, (_, index) => (index * 47 + 30) % 360)
