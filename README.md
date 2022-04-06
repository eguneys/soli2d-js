## Quick Start

To use Soli2d run:

> yarn add soli2d-js babel-preset-soli2d

The easiest way to get setup is add babel-preset-soli2d to your .babelrc

```
"presets": ["soli2d"]
```

For TypeScript, set your TSConfig to handle Soli2d's JSX by:
```
"compilerOptions": {
  "jsx": "preserve",
  "jsxImportSource": "soli2d-js"
}
```
