import {
  untrack
} from '../reactive/signal'

export function createComponent<T>(Comp: (props: T) => JSX.Element, props: T): JSX.Element {
  return untrack(() => Comp(props as T))
}
