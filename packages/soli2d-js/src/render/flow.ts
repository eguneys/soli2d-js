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
