// @ts-check
import antfu from '@antfu/eslint-config'

export default antfu(
  {
    formatters: true,
    pnpm: true,
    ignores: [
      // Native platform projects — bundled assets copied by `cap sync`,
      // auto-generated config, and platform-managed files.
      'android/**',
      'ios/**',
      // PWA service worker + workbox + sitemaps generated at build time.
      'dist/**',
      'public/sw.js',
      'public/workbox-*.js',
      'public/manifest.webmanifest',
    ],
  },
  {
    files: ['README.md', 'README.zh-CN.md'],
    rules: {
      'markdown/heading-increment': 'off',
    },
  },
)
