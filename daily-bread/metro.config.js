// https://docs.expo.dev/guides/customizing-metro/
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// expo-sqlite on web ships a wasm build (wa-sqlite). Without these, web
// bundling fails with "Unable to resolve module ./wa-sqlite/wa-sqlite.wasm".
config.resolver.assetExts.push('wasm');

// wa-sqlite needs SharedArrayBuffer → cross-origin isolation headers.
config.server.enhanceMiddleware = (middleware) => {
  return (req, res, next) => {
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    return middleware(req, res, next);
  };
};

module.exports = config;
