module.exports = {
  env: {
    test: {
      presets: [
        ["@babel/preset-env", { targets: { node: "current" } }],
        "@babel/preset-typescript"
      ],
      plugins: [
        [
          "babel-plugin-transform-rename-import",
          {
            replacements: [
              {
                original: "rxcore",
                replacement: __dirname + "/web/src/core"
              },
              {
                original: 'ex/soli2d',
                replacement: __dirname + "/web/src/soli2d"
              },
              {
                original: "^soli2d-js$",
                replacement: "../../src"
              }
            ]
          }
        ],
        [
          "babel-plugin-jsx-sol-expressions",
          {
            moduleName: "../../web/src/index",
            wrapConditionals: true
          }
        ]
      ]
    }
  }
}
