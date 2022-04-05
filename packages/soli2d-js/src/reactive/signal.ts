export type Accessor<T> = () => T;
export type Setter<T> = <U extends T>(v?: (U extends Function ? never : U>) | ((prev?: U) => U)) => U

export const equalFn = <T>(a: T, b: T) => a === b

const signalOptions = { equals: equalFn }

let ERROR: symbol | null = null
let runEffects = runQueue
export const NOTPENDING = {}
const STALE = 1
const PENDING = 2

const [transPending, setTransPending] = createSignal(false)
let Scheduler: ((fn: () => void) => any) | null = null
let Listener: Computation<any> | null = null
let Pending: Signal<any>[] | null = null
let Updates: Computation<any>[] | null = null
let Effects: Computation<any>[] | null = null
let ExecCount = 0
let rootCount = 0



export function createRoot<T>(fn: (dispose: () => void) => T): T {

  try {
    runUpdates(() => (result = fn(() => cleanNode(root))), true)
  } finally {

  }
  return result
}


export function createSignal<T>(
  value?: T,
  options?: { equals?: false | ((prev: T, next: T) => boolean); name?: string; }
): [get: Accessor<T>, set: Setter<T>] {
  const s: Signal<T> = {
    value,
    observers: null,
    observerSlots: null,
    pending: NOTPENDING,
    comparator: options.equals || undefined
  }

  return [
    readSignal.bind(s),
    ((value: T extends Function ? never : T | ((p?: T) => T)) => {
      if (typeof value === 'function') {
        value = value(s.pending !== NOTPENDING ? s.pending : s.value)
      }
      return writeSignal(s, value)
    }) as Setter<T>
  ]
}



export function createRenderEffect<T>(
  fn: (v?: T) => T,
  value?: T,
  options?: { name?: string }
): void {
  updateComputation(
    createComputation(fn, value, false, STALE, undefined)
  )
}


export function createEffect<T>(fn: (v?: T) => T, value?: T, options?: { name?: string}): void {
  runEffects = runUserEffects

  const c = createComputation(fn, value, false, STALE, undefined)
  c.user = true

  Effects && Effects.push(c)
}


export function createMemo<T>(
  fn: (v?: T) => T,
  value?: T,
  options?: { equals?: false | ((prev: T, next: T) => boolean); name?: string }
): Accessor<T> {
  const c: Partial<Memo<T>> = createComputation<T>(
    fn,
    value,
    true,
    0,
    undefined
  )

  c.pending = NOTPENDING
  c.observers = null
  c.comparator = options.equals || undefined
  updateComputation(c as Memo<T>)
  return readSignal.bind(c as Memo<T>)
}





