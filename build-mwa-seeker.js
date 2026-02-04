/**
 * Build script for Seeker Mobile Wallet Adapter bundle
 * Creates a single IIFE bundle for WebView injection
 */
const esbuild = require('esbuild');
const path = require('path');

esbuild.build({
  entryPoints: [path.join(__dirname, 'app', 'mwa-seeker.js')],
  bundle: true,
  format: 'iife',
  platform: 'browser',
  outfile: path.join(__dirname, 'app', 'mwa-seeker-bundle.js'),
  minify: true,
  sourcemap: false,
  target: ['es2020'],
  define: {
    'process.env.NODE_ENV': '"production"',
  },
  external: [], // Bundle everything
  globalName: 'SeekerMWA',
}).then(() => {
  console.log('✅ Seeker MWA bundle written to app/mwa-seeker-bundle.js');
}).catch((e) => {
  console.error('❌ Seeker MWA build failed:', e);
  process.exit(1);
});
