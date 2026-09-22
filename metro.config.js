// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Configuración requerida por expo-sqlite para funcionar en la versión web:
// 1) permite que Metro empaquete archivos .wasm (el motor de SQLite compilado a WebAssembly)
config.resolver.assetExts.push('wasm');

// 2) agrega los headers COOP/COEP que el navegador exige para poder usar SharedArrayBuffer
config.server.enhanceMiddleware = (middleware) => {
  return (req, res, next) => {
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    return middleware(req, res, next);
  };
};

module.exports = config;
