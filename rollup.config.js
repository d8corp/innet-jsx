import typescript from 'rollup-plugin-typescript2'
import {preserveShebangs} from 'rollup-plugin-preserve-shebangs'
import json from '@rollup/plugin-json'
import pkg from './package.json'

export default [{
  input: 'src/index.ts',
  external: ['tslib'],
  output: {
    dir: 'lib',
    entryFileNames: '[name]' + pkg.main.replace('index', ''),
    format: 'cjs'
  },
  plugins: [
    typescript(),
  ]
}, {
  input: 'src/index.ts',
  output: {
    dir: 'lib',
    entryFileNames: '[name]' + pkg.module.replace('index', ''),
    format: 'es'
  },
  plugins: [
    typescript({
      tsconfigOverride: {
        compilerOptions: {
          target: 'es6',
        }
      }
    }),
  ]
}, {
  input: 'src/bin/innet-jsx.ts',
  output: {
    file: 'lib/bin/innet-jsx',
    format: 'cjs'
  },
  plugins: [
    json(),
    typescript({
      rollupCommonJSResolveHack: false,
      clean: true,
      tsconfigOverride: {
        compilerOptions: {
          declaration: false
        }
      }
    }),
    preserveShebangs()
  ]
}]
