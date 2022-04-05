import copy from 'rollup-plugin-copy'
import nodeResolve from '@rollup/plugin-node-resolve'
import babel from '@rollup/plugin-babel'
import cleanup from 'rollup-plugin-cleanup'
import replace from '@rollup/plugin-replace'

const plugins = [
  nodeResolve({
    extensions: ['.js', '.ts']
  }),
  babel({
    extensions: ['.js', '.ts'],
    exclude: 'node_modules/**',
    babelrc: false,
    babelHelpers: 'bundled',
    presets: ['@babel/preset-typescript'],
    plugins: [
      [
        'babel-plugin-transform-rename-import',
        {
          original: 'rxcore',
          replacement: __dirname + 'web/src/core'
        }
      ]
    ]
  }),

  cleanup({
    comments: ['some', /PURE/],
    extensions: ['.js', '.ts']
  })
]


export default [
  {
    input: 'src/index.ts',
    output: [{
      file: 'dist/solid.js',
      format: 'es'
    }],
    plugins: [
      replace({
        '"_SOLI2D_DEV_"': false,
        preventAssignment: true,
        delimiters: ["", ""]
      }),
      copy({
        targets: [
          {
            src: './src/jsx.d.ts',
            dest: './types/'
          }
        ]
      })
    ].concat(plugins)
  },
  {
    input: 'web/src/index.ts',
    output: [
      {
        file: 'web/dist/web.js',
        format: 'es'
      }
    ],
    external: ['soli2d-js'],
    plugins: [
      replace({
        '"_DX_DEV_"': false,
        preventAssignment: true,
        delimiters: ["", ""]
      }),
      copy({
        targets: [
          {
            src: ['../../node_modules/sol-expressions/src/client.d.ts'],
            dest: './web/src/'
          },
          { src: '../../node_modules/sol-expressions/src/client.d.ts', dest: './web/types/' }
        ]
      })
    ].concat(plugins)
  }
]
