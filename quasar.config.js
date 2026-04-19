/* eslint-env node */

import { defineConfig } from '#q-app/wrappers'
import 'dotenv/config'

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

      vueRouterMode: 'hash',

      env: {
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
              lintCommand: 'eslint -c ./eslint.config.js "./src*/**/*.{js,mjs,cjs,vue}"',
              useFlatConfig: true,
            },
          },
          { server: false },
        ],
      ],

      // 🔥 FIX NGROK + VITE
      vite: {
        server: {
          host: true,
          allowedHosts: true, // ⬅️ ini fix utama
          origin: 'http://localhost:9000', // ⬅️ tambahan biar gak ke-block
        },
      },
    },

    // 🔥 FIX DEV SERVER
    devServer: {
      open: true,
      host: '0.0.0.0',
      port: 9000,
      allowedHosts: true, // ⬅️ ganti dari 'all'
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
      injectPwaMetaTags: true,
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
