// Only for ts-jest: vue-tsc resolves SFCs natively, Jest needs this fallback.
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<Record<string, never>, Record<string, never>, unknown>
  export default component
}
