import { createRoot,
  createRenderEffect,
  createMemo,
  createComponent
} from 'soli2d-js'

function memo<T>(fn: () => T, equals: boolean) {
  return createMemo(fn, undefined, !equals ? { equals } : undefined)
}


export {
  createComponent,
  createRoot as root,
  createRenderEffect as effect,
  memo
}
