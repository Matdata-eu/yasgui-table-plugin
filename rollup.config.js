import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import postcss from 'rollup-plugin-postcss';
import cssnano from 'cssnano';

const production = !process.env.ROLLUP_WATCH;

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/table-plugin.umd.js',
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
      file: 'dist/table-plugin.esm.js',
      format: 'es',
      sourcemap: true
    }
  ],
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
      extract: 'table-plugin.css',
      minimize: production,
      plugins: production ? [cssnano()] : []
    }),
    production && terser({
      output: {
        comments: false
      }
    })
  ]
};
