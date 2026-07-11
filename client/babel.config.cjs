/** Used only by Jest (@vue/vue3-jest + babel-jest); Vite builds don't touch Babel. */
module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    ['@babel/preset-typescript', { allExtensions: true }],
  ],
}
