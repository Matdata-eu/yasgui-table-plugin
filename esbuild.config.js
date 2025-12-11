import * as esbuild from 'esbuild';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import postcss from 'postcss';
import postcssImport from 'postcss-import';
import cssnano from 'cssnano';

const production = process.env.NODE_ENV === 'production';

// CSS Plugin for esbuild
const cssPlugin = {
  name: 'css',
  setup(build) {
    build.onLoad({ filter: /\.css$/ }, async (args) => {
      const css = readFileSync(args.path, 'utf8');
      
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
const baseConfig = {
  entryPoints: ['src/index.ts'],
  bundle: true,
  external: ['@yasgui/yasr', '@yasgui/utils', 'tabulator-tables'],
  sourcemap: true,
  target: 'es2020',
  plugins: [cssPlugin],
};

async function build() {
  try {
    // Create dist directory
    mkdirSync('dist', { recursive: true });
    mkdirSync('dist/types', { recursive: true });

    // Build UMD format
    await esbuild.build({
      ...baseConfig,
      outfile: 'dist/yasgui-table-plugin.umd.js',
      format: 'iife',
      globalName: 'YasguiTablePlugin',
      footer: {
        js: 'if (typeof module !== "undefined" && module.exports) { module.exports = YasguiTablePlugin; }'
      },
    });

    // Build ESM format
    await esbuild.build({
      ...baseConfig,
      outfile: 'dist/yasgui-table-plugin.esm.js',
      format: 'esm',
    });

    // Build minified version in production
    if (production) {
      await esbuild.build({
        ...baseConfig,
        outfile: 'dist/yasgui-table-plugin.min.js',
        format: 'iife',
        globalName: 'YasguiTablePlugin',
        minify: true,
        footer: {
          js: 'if (typeof module !== "undefined" && module.exports) { module.exports = YasguiTablePlugin; }'
        },
      });
    }

    // Build CSS bundle
    const cssContent = readFileSync('styles/index.css', 'utf8');
    const cssResult = await postcss([
      postcssImport(),
      ...(production ? [cssnano()] : [])
    ]).process(cssContent, { from: 'styles/index.css' });
    
    writeFileSync('dist/yasgui-table-plugin.css', cssResult.css);

    console.log('Build completed successfully!');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

// Watch mode
if (process.argv.includes('--watch')) {
  const ctx = await esbuild.context({
    ...baseConfig,
    outfile: 'dist/yasgui-table-plugin.esm.js',
    format: 'esm',
  });
  
  await ctx.watch();
  console.log('Watching for changes...');
} else {
  build();
}
