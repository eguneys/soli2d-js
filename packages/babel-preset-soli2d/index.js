const jsxTransform = require('babel-plugin-jsx-sol-expressions')

module.exports = function(context, options = {}) {
  const plugins = [
    [
      jsxTransform,
      Object.assign(
        {
          moduleName: 'soli2d-js/web',
          builtIns: [
          ],
          wrapConditionals: true
        },
        options
      )
    ]
  ]

  return {
    plugins
  }
}
