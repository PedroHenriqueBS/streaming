/** Hues offered by the profile editor, mirroring the DevFlix design palette. */
export const AVATAR_HUES = [40, 300, 210, 140, 20, 260, 90, 330] as const

export function avatarGradient(hue: number): string {
  const secondaryHue = (hue + 40) % 360
  return `linear-gradient(150deg, oklch(0.62 0.16 ${hue}) 0%, oklch(0.34 0.12 ${secondaryHue}) 100%)`
}

export function initialOf(name: string): string {
  return name.trim().charAt(0).toUpperCase() || '?'
}
