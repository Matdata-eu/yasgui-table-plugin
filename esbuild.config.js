
const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

const postcss = require('postcss');
const postcssImport = require('postcss-import');
const cssnano = require('cssnano');

const production = process.env.NODE_ENV === 'production';

// CSS Plugin for esbuild
const cssPlugin = {
  name: 'css',
  setup(build) {
    build.onLoad({ filter: /\.css$/ }, async (args) => {
      const css = fs.readFileSync(args.path, 'utf8');
      
      // Process CSS with PostCSS
      const result = await postcss([
        postcssImport(),
        ...(production ? [cssnano()] : [])
      ]).process(css, { from: args.path });
      
      return {
        contents: result.css,
        loader: 'css',
      };
    });
  },
};

// Build configuration
const buildConfigs = [
  // ES Module (for bundlers like webpack, vite, rollup)
  {
    entryPoints: ['src/index.ts'],
    bundle: true,
    minify: false,
    sourcemap: true,
    target: ['es2018'],
    format: 'esm',
    outfile: 'dist/yasgui-table-plugin.esm.js',
    external: [], 
    loader: {
      '.js': 'js',
    },
    plugins: [cssPlugin],
  },
  // CommonJS (for Node.js)
  {
    entryPoints: ['src/index.ts'],
    bundle: true,
    minify: false,
    sourcemap: true,
    target: ['es2018'],
    format: 'cjs',
    outfile: 'dist/yasgui-table-plugin.cjs.js',
    external: [], 
    loader: {
      '.js': 'js',
    },
    plugins: [cssPlugin],
  },
  // IIFE (for browsers via unpkg.com and script tags)
  {
    entryPoints: ['src/index.ts'],
    bundle: true,
    minify: true,
    sourcemap: true,
    target: ['es2018'],
    format: 'iife',
    globalName: 'TablePlugin',
    outfile: 'dist/yasgui-table-plugin.min.js',
    external: [],
    loader: {
      '.js': 'js',
    },
    plugins: [cssPlugin],
  },
];

// TypeScript declaration content
const typeDeclaration = `declare module '@matdata/yasgui-table-plugin';
`;

// Build all formats
Promise.all(buildConfigs.map(config => esbuild.build(config)))
  .then(() => {
    // Create TypeScript declaration file
    const distDir = path.join(__dirname, 'dist');
    if (!fs.existsSync(distDir)) {
      fs.mkdirSync(distDir, { recursive: true });
    }

    // Build CSS bundle
    const cssContent = fs.readFileSync('styles/index.css', 'utf8');
    return postcss([
      postcssImport(),
      ...(production ? [cssnano()] : [])
    ]).process(cssContent, { from: 'styles/index.css' })
      .then((cssResult) => {
        fs.writeFileSync('dist/yasgui-table-plugin.css', cssResult.css);
        fs.writeFileSync(path.join(distDir, 'index.d.ts'), typeDeclaration);

        console.log('✅ Build complete:');
        console.log('   - dist/yasgui-table-plugin.esm.js (ES Module for bundlers)');
        console.log('   - dist/yasgui-table-plugin.cjs.js (CommonJS for Node.js)');
        console.log('   - dist/yasgui-table-plugin.min.js (IIFE for browsers/unpkg)');
        console.log('   - dist/yasgui-table-plugin.css (Bundled CSS)');
        console.log('   - dist/index.d.ts (TypeScript declarations)');
      });
  })
  .catch((err) => {
    console.error('❌ Build failed:', err);
    process.exit(1);
  });

