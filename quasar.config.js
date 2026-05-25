/* eslint-env node */

import { defineConfig } from '#q-app/wrappers'
import 'dotenv/config'
import pkg from './package.json' with { type: 'json' }

export default defineConfig(async () => {
  return {
    boot: ['axios', 'firebase'],

    css: ['app.scss'],

    extras: ['roboto-font', 'material-icons'],

    build: {
  target: {
    browser: ['es2022', 'edge89', 'firefox89', 'chrome89', 'safari15'],
    node: 'node20',
  },

  vueRouterMode: 'history',

  env: {
    APP_VERSION: process.env.APP_VERSION || pkg.version,
    FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
    FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN,
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
    FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
    FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID,
    FIREBASE_APP_ID: process.env.FIREBASE_APP_ID,
  },

  vitePlugins: [
    [
      'vite-plugin-checker',
      {
        eslint: {
          lintCommand:
            'eslint -c ./eslint.config.js "./src*/**/*.{js,mjs,cjs,vue}"',
          useFlatConfig: true,
        },
      },
      { server: false },
    ],
  ],
},
    vite: {
      server: {
        host: true,
        allowedHosts: true,
        origin: 'http://localhost:9000',
      },
    },

    devServer: {
      open: true,
      host: '0.0.0.0',
      port: 9000,
    },

    framework: {
      config: {},

      plugins: ['Notify', 'Dialog', 'Loading', 'LocalStorage', 'SessionStorage'],
    },

    animations: [],

    ssr: {
      prodPort: 3000,
      middlewares: ['render'],
      pwa: false,
    },

    pwa: {
      workboxMode: 'GenerateSW',
      injectPwaMetaTags: false,
      swFilename: 'sw.js',
      manifestFilename: 'manifest.json',
      useCredentialsForManifestTag: false,
    },

    cordova: {},

    capacitor: {
      hideSplashscreen: true,
    },

    electron: {
      inspectPort: 5858,
      bundler: 'packager',

      packager: {},

      builder: {
        appId: 'agra-erp',
      },
    },

    bex: {
      extraScripts: [],
    },
  }
})
