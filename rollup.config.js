import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import postcss from 'rollup-plugin-postcss';
import postcssImport from 'postcss-import';
import cssnano from 'cssnano';

const production = !process.env.ROLLUP_WATCH;

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/yasgui-table-plugin.umd.js',
      format: 'umd',
      name: 'YasguiTablePlugin',
      sourcemap: true,
      exports: 'named',
      globals: {
        '@yasgui/yasr': 'Yasr',
        '@yasgui/utils': 'YasguiUtils',
        'tabulator-tables': 'Tabulator'
      }
    },
    {
      file: 'dist/yasgui-table-plugin.esm.js',
      format: 'es',
      sourcemap: true
    },
    production && {
      file: 'dist/yasgui-table-plugin.min.js',
      format: 'umd',
      name: 'YasguiTablePlugin',
      sourcemap: true,
      exports: 'named',
      plugins: [terser({
        output: {
          comments: false
        }
      })],
      globals: {
        '@yasgui/yasr': 'Yasr',
        '@yasgui/utils': 'YasguiUtils',
        'tabulator-tables': 'Tabulator'
      }
    }
  ].filter(Boolean),
  external: ['@yasgui/yasr', '@yasgui/utils', 'tabulator-tables'],
  plugins: [
    resolve({ browser: true }),
    commonjs(),
    typescript({
      tsconfig: './tsconfig.json',
      declaration: true,
      declarationDir: './dist/types'
    }),
    postcss({
      extract: 'yasgui-table-plugin.css',
      minimize: production,
      plugins: [
        postcssImport(), // Process @import statements
        ...(production ? [cssnano()] : [])
      ]
    })
  ]
};
