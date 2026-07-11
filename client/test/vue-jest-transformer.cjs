/**
 * Minimal Jest transformer for Vue SFCs.
 *
 * Replaces @vue/vue3-jest, whose TypeScript path emits the template render
 * function as ESM under TypeScript >= 6 and breaks Jest's CJS runtime.
 * Compiles with vue/compiler-sfc (inline template) and converts to CJS via
 * Babel. Styles are ignored — irrelevant under jsdom.
 */
const crypto = require('crypto')
const { parse, compileScript, compileTemplate } = require('vue/compiler-sfc')
const { transformSync } = require('@babel/core')

function compileSfc(src, filename) {
  const { descriptor } = parse(src, { filename })
  const id = crypto.createHash('md5').update(filename).digest('hex').slice(0, 8)

  if (descriptor.script || descriptor.scriptSetup) {
    const script = compileScript(descriptor, {
      id,
      inlineTemplate: true,
      genDefaultAs: '__sfc__',
    })
    return `${script.content}\nexport default __sfc__`
  }

  // Template-only components (e.g. AppFooter, LoadingSpinner)
  const template = compileTemplate({
    id,
    source: descriptor.template?.content ?? '<div />',
    filename,
  })
  return `${template.code}\nexport default { render }`
}

module.exports = {
  process(src, filename) {
    const compiled = compileSfc(src, filename)
    const result = transformSync(compiled, {
      filename: `${filename}.ts`,
      presets: [
        [require.resolve('@babel/preset-env'), { targets: { node: 'current' } }],
        [require.resolve('@babel/preset-typescript'), { allExtensions: true }],
      ],
      babelrc: false,
      configFile: false,
      sourceMaps: 'inline',
    })
    return { code: result.code }
  },

  getCacheKey(src, filename) {
    return crypto.createHash('md5').update(src).update(filename).digest('hex')
  },
}
