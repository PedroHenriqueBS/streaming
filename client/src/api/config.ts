/** Isolated so tests can mock it — `import.meta` is Vite-only syntax. */
export const API_URL: string = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'
