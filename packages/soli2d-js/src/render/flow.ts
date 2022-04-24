import { createMemo, untrack } from '../reactive/signal'
import { mapArray } from '../reactive/array'

export function For<T, U extends JSX.Element>(props: {
  each: readonly T[] | undefined | null | false;
  children: (item: T, index: Accessor<number>) => U;
}) {
  return createMemo(
    mapArray<T, U>(() => props.each, props.children)
  )
}


export function Show<T>(props: {
  when: T | undefined | null | false;
  fallback?: JSX.Element;
  children: JSX.Element | ((item: NonNullable<T>) => JSX.Element);
}) {
  let strictEqual = false
  const condition = createMemo<T | undefined | null | boolean>(() => props.when, undefined, {
    equals: (a, b) => (strictEqual ? a === b : !a === !b)
  })

  return createMemo(() => {
    const c = condition()
    if (c === 0 || !!c) {
      const child = props.children
      return (strictEqual = typeof child === 'function' && child.length > 0)
        ? untrack(() => (child as any)(c as T))
        : child
    }
    return props.fallback
  }) as () => JSX.Element
}
