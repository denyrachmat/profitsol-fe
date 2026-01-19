/* eslint-env node */

import { configure } from 'quasar/wrappers'
import path from 'node:path'

// OPTIONAL ESLint plugin for Vite (boleh dihapus kalau nggak perlu)
// yarn add -D vite-plugin-eslint
let eslintPlugin
try {
  eslintPlugin = (await import('vite-plugin-eslint')).default
} catch {
  eslintPlugin = null
}

export default configure((ctx) => {
  return {
    supportTS: true,

    boot: ['axios', 'prismBoot', 'pinia', 'msalBoot'],

    css: ['app.scss'],

    extras: [
      'ionicons-v4',
      'fontawesome-v6',
      'line-awesome',
      'roboto-font',
      'material-icons'
    ],

    build: {
      vueRouterMode: 'history',

      env: {
        API: !ctx.dev
          ? 'http://stx-api.test/api/'
          : 'https://api.sumitronics-indonesia.com/api/',
        API_DOWNLOAD: !ctx.dev
          ? 'http://stx-api.test'
          : 'https://api.sumitronics-indonesia.com',
        API_DMS: !ctx.dev
          ? 'http://stx-api.test/api/dms/documentsRoots/getSharedFilesFolder'
          : 'https://api.sumitronics-indonesia.com/api/dms/documentsRoots/getSharedFilesFolder',
        MS_CLIENTID: 'fad753b2-465c-4663-b44b-50aabeb3a4ed',
        MS_AUTHORITY:
          'https://login.microsoftonline.com/0891bc2a-866c-4709-950d-c2d0ef23bbe7',
        GRAPH_API: 'https://graph.microsoft.com/v1.0/',
        SHAREPOINT_URL:
          'https://graph.microsoft.com/v1.0/sites/root?select=id,drive',
        VAPID_KEY: "BM0tMAVJecCe_wr3jM-A7i5Vo7X6wUSMpUGV6AmNnfnDNBZRR5_kP3jgseT4NxrpeTk5ipsXuxbEdmBCkPc6-l8"
      },

      transpile: true,
      transpileDependencies: [
        /[\\/]node_modules[\\/]@microsoft[\\/]mgt-components.*/
      ],

      alias: {
        '@': path.resolve(process.cwd(), 'src'),
        'roughjs/bin/rough': 'roughjs/bin/rough.js',
        'roughjs/bin/generator': 'roughjs/bin/generator.js',
        'roughjs/bin/math': 'roughjs/bin/math.js'
      },

      extendViteConf(viteConf) {
        // pastikan alias merged
        viteConf.resolve = viteConf.resolve || {}
        viteConf.resolve.alias = {
          ...(viteConf.resolve.alias || {}),
          '@': path.resolve(process.cwd(), 'src'),
          'roughjs/bin/rough': 'roughjs/bin/rough.js',
          'roughjs/bin/generator': 'roughjs/bin/generator.js',
          'roughjs/bin/math': 'roughjs/bin/math.js'
        }

        // OPTIONAL: eslint saat dev
        if (eslintPlugin) {
          viteConf.plugins = viteConf.plugins || []
          viteConf.plugins.push(
            eslintPlugin({
              include: ['src/**/*.js', 'src/**/*.vue', 'src/**/*.ts'],
              exclude: ['node_modules', 'dist', '.quasar']
            })
          )
        }

        viteConf.optimizeDeps = viteConf.optimizeDeps || {}
        viteConf.optimizeDeps.include = [
          ...(viteConf.optimizeDeps.include || []),
          'prismjs',
          'prismjs/components/prism-sql'
        ]
      }
    },

    devServer: {
      port: 8080,
      open: true
    },

    framework: {
      config: {},
      plugins: ['LocalStorage', 'Dialog', 'Notify', 'Loading']
    },

    animations: 'all',

    ssr: {
      pwa: false,
      prodPort: 3000,
      maxAge: 1000 * 60 * 60 * 24 * 30,
      middlewares: [ctx.prod ? 'compression' : '', 'render']
    },

    pwa: {
      workboxMode: 'InjectManifest',
      workboxOptions: {},

      manifest: {
        name: 'STX-I Portal v2',
        short_name: 'STX-I Portal v2',
        description: 'STX-I Portal Application',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#ffffff',
        theme_color: '#027be3',
        icons: [
          { src: 'icons/icon-128x128.png', sizes: '128x128', type: 'image/png' },
          { src: 'icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-256x256.png', sizes: '256x256', type: 'image/png' },
          { src: 'icons/icon-384x384.png', sizes: '384x384', type: 'image/png' },
          { src: 'icons/icon-512x512.png', sizes: '512x512', type: 'image/png' }
        ]
      }
    },

    cordova: {},

    capacitor: { hideSplashscreen: true },

    electron: {
      bundler: 'packager',
      packager: {},
      builder: { appId: 'stxi-portal-v2' }
    }
  }
})
