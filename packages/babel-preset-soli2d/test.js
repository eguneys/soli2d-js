const babel = require('@babel/core')
const preset = require('.')
const assert = require('assert')

const { code } = babel.transformSync('const v = <transform b={2} />;', {
  presets: [preset],
  babelrc: false,
  compact: true
})

assert.equal(
  code,
  'import{template as _$template}from"soli2d-js/web";import{setAttribute as _$setAttribute}from"soli2d-js/web";const _tmpl$=/*#__PURE__*/_$template(`<transform></transform>`,2);const v=(()=>{const _el$=_tmpl$.clone;_$setAttribute(_el$,"b",2);return _el$;})();')
