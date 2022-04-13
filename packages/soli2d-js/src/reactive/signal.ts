export const equalFn = <T>(a: T, b: T) => a === b

const signalOptions = { equals: equalFn }

let ERROR: symbol | null = null
let runEffects = runQueue
export const NOTPENDING = {}
const STALE = 1
const PENDING = 2
const UNOWNED: Owner = {
  owned: null,
  cleanups: null,
  context: null,
  owner: null
}

const [transPending, setTransPending] = createSignal(false)
export var Owner: Owner | null = null
let Scheduler: ((fn: () => void) => any) | null = null
let Listener: Computation<any> | null = null
let Pending: Signal<any>[] | null = null
let Updates: Computation<any>[] | null = null
let Effects: Computation<any>[] | null = null
let ExecCount = 0
let rootCount = 0



export function createRoot<T>(fn: (dispose: () => void) => T): T {

  const listener = Listener,
    owner = Owner,
    root: Owner =
    fn.length === 0 ? UNOWNED : { owned: null, cleanups: null, context: null, owner: owner }
  
  Owner = root
  Listener = null

  try {
    return runUpdates(() => (fn(() => cleanNode(root))), true)
  } finally {
    Listener = listener
    Owner = owner
  }
}


export function createSignal<T>(
  value?: T,
  options?: { equals?: false | ((prev: T, next: T) => boolean); name?: string; }
): [get: Accessor<T>, set: Setter<T>] {
  options = options ? Object.assign({}, signalOptions, options) : signalOptions
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
  const c = createComputation(fn, value, false, STALE, undefined)
  updateComputation(c)
}


export function createEffect<T>(fn: (v?: T) => T, value?: T, options?: { name?: string}): void {
  runEffects = runUserEffects

  const c = createComputation(fn, value, false, STALE, undefined)
  c.user = true

  Effects ? Effects.push(c) : queueMicrotask(() => updateComputation(c))
}


export function createMemo<T>(
  fn: (v?: T) => T,
  value?: T,
  options?: { equals?: false | ((prev: T, next: T) => boolean); name?: string }
): Accessor<T> {

  options = options ? Object.assign({}, signalOptions, options): signalOptions
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



export function readSignal(this: SignalState<any> | Memo<any>) {

  if ((this as Memo<any>).sources &&
      ((this as Memo<any>).state)) {
    const updates = Updates

  Updates = null;

  ((this as Memo<any>).state === STALE) ? updateComputation(this as Memo<any>)
  : lookUpstream(this as Memo<any>)
  Updates = updates
  }

  if (Listener) {
    const sSlot = this.observers ? this.observers.length : 0

    if (!Listener.sources) {
      Listener.sources = [this]
      Listener.sourceSlots = [sSlot]
    } else {
      Listener.sources.push(this)
      Listener.sourceSlots!.push(sSlot)
    }
    if (!this.observers) {
      this.observers = [Listener]
      this.observerSlots = [Listener.sources.length - 1]
    } else {
      this.observers.push(Listener)
      this.observerSlots!.push(Listener.sources.length - 1)
    }
  }
  return this.value
}

export function writeSignal(node: SignalState<any> | Memo<any>, value: any, isComp?: boolean) {
  if (Pending) {
    if (node.pending === NOTPENDING) {
      Pending.push(node)
    }
    node.pending = value
    return value
  }

  if (node.comparator) {
    if (node.comparator(node.value, value)) return value
  }

  node.value = value

  if (node.observers && node.observers.length) {
    runUpdates(() => {
      for (let i = 0; i < node.observers!.length; i+= 1) {
        const o = node.observers![i]
        if (!o.state) {
          if (o.pure) {
            Updates!.push(o)
          } else {
            Effects!.push(o)
          }
          if ((o as Memo<any>).observers) markDownstream(o as Memo<any>)
        }
        o.state = STALE
      }
      if (Updates!.length > 10e5) {
        Updates = []
        throw new Error()
      }
    }, false)
  }
  return value
}

function updateComputation(node: Computation<any>) {
  if (!node.fn) {
    return
  }
  cleanNode(node)
  const owner = Owner,
    listener = Listener,
    time = ExecCount
  Listener = Owner = node

  runComputation(
    node,
    node.value,
    time)

  Listener = listener
  Owner = owner
}


function runComputation(node: Computation<any>, value: any, time: number) {
  let nextValue
  try {
    nextValue = node.fn(value)
  } catch (err) {
    handleError(err)
  }
  if (!node.updatedAt || node.updatedAt <= time) {
    if ((node as Memo<any>).observers && (node as Memo<any>).observers!.length) {
      writeSignal(node as Memo<any>, nextValue, true)
    } else {
      node.value = nextValue
    }
    node.updatedAt = time
  }
}


function createComputation<Next, Init = unknown>(
  fn: EffectFunction<Init | Next, Next>,
  init: Init,
  pure: boolean,
  state: number = STALE,
  options?: EffectOptions): Computation<Init | Next, Next> {

    const c: Computation<Init | Next, Next>= {
      fn,
      state: state,
      updatedAt: null,
      owned: null,
      sources: null,
      sourceSlots: null,
      cleanups: null,
      value: init,
      owner: Owner,
      context: null,
      pure
    }

    if (Owner === null) {

    } else if (Owner !== UNOWNED) {
      if (!Owner.owned) {
        Owner.owned = [c]
      } else {
        Owner.owned.push(c)
      }
    }
    return c
  }


function runUpdates<T>(fn: () => T, init: boolean) {
  if (Updates) { return fn() }
  let wait = false

  if (!init) { Updates = [] }
  if (Effects) { wait = true }
  else { Effects = [] }
  ExecCount++;
  try {
    return fn()
  } catch (err) {
    handleError(err)
  } finally {
    completeUpdates(wait)
  }
}


function completeUpdates(wait: boolean) {
  if (Updates) {
    runQueue(Updates)
    Updates = null
  }
  if (wait) return
    let res
  if (Effects!.length) {
    batch(() => {
      runEffects(Effects!)
      Effects = null
    })
  } else {
    Effects = null
  }
  if (res) res()
}



export function batch<T>(fn: Accessor<T>): T {
  if (Pending) return fn()
  let result
  const q: SignalState<any>[] = (Pending = [])

  try {
    result = fn()
  } finally {
    Pending = null
  }

  runUpdates(() => {
    for (let i = 0; i < q.length; i+=1) {
      const data = q[i]
      if (data.pending !== NOTPENDING) {
        const pending = data.pending
        data.pending = NOTPENDING
        writeSignal(data, pending)
      }
    }
  }, false)

  return result
}


function runTop(node: Computation<any>) {
  if (node.state === 0) return
  if (node.state === PENDING) {
    return lookUpstream(node)
  }
  const ancestors = [node]
  while (
    (node = node.owner as Computation<any>) &&
      (!node.updatedAt || node.updatedAt < ExecCount)) {
      if (node.state) {
        ancestors.push(node)
      }
    }
  for (let i = ancestors.length - 1; i >= 0; i--) {
    node = ancestors[i]
    if (node.state === STALE) {
      updateComputation(node)
    } else if (node.state === PENDING) {
      const updates = Updates
      lookUpstream(node, ancestors[0])
      Updates = updates
    }
  }
}


function runQueue(queue: Computation<any>[]) {
  for (let i = 0; i < queue.length; i++) runTop(queue[i])
}

function lookUpstream(node: Computation<any>, ignore?: Computation<any>) {
  node.state = 0
  for (let i = 0; i < node.sources!.length; i += 1) {
    const source = node.sources![i] as Memo<any>
    if (source.sources) {
      if (source.state === STALE) {
        if (source !== ignore) runTop(source)
      } else if (source.state === PENDING) {
        lookUpstream(source, ignore)
      }
    }
  }
}


function cleanNode(node: Owner) {
  let i
  if ((node as Computation<any>).sources) {
    while((node as Computation<any>).sources!.length) {
      const source = (node as Computation<any>).sources!.pop()!,
        index = (node as Computation<any>).sourceSlots!.pop()!,
        obs = source.observers
      if (obs && obs.length) {
        const n = obs.pop()!,
          s = source.observerSlots!.pop()!
        if (index < obs.length) {
          n.sourceSlots![s] = index
          obs[index] = n
          source.observerSlots![index] = s
        }
      }
    }
  }

  if (node.owned) {
    for (i = 0; i < node.owned.length; i++) cleanNode(node.owned[i])
    node.owned = null
  }

  if (node.cleanups) {
    for (i = 0; i < node.cleanups.length; i++) node.cleanups[i]()
    node.cleanups = null
  }

  (node as Computation<any>).state = 0
  node.context = null
}


function handleError(err: any) {
  const fns = ERROR && lookup(Owner, ERROR)
  if (!fns) throw err
  fns.forEach((f: (err: any) => void) => f(err))
}



export function createContext<T>(defaultValue?: T): Context<T | undefined> {

  const id = Symbol('context')
  return {id, Provider: createProvider(id), defaultValue }
}


export function useContext<T>(context: Context<T>): T {
  let ctx
  return (ctx = lookup(Owner, context.id)) !== undefined ? ctx : context.defaultValue
}


export function lookup(owner: Owner | null, key: symbol| string): any {
  return owner
  ? owner.context && owner.context[key] !== undefined
    ? owner.context[key]
    :lookup(owner.owner, key)
  :undefined
}


function createProvider(id: symbol) {
  return function provider(props: { value: unknown; children: JSX.Element }) {
    let res
    createComputed(
      () =>
      (res = untrack(() => {
        Owner!.context = { [id]: props.value }
        return children(() => props.children)
      }))
    )
    return res as JSX.Element
  }
}

export function children(fn: Accessor<JSX.Element>): Accessor<ResolvedChildren> {
  const children = createMemo(fn)
  return createMemo(() => resolveChildren(children()))
}


function resolveChildren(children: JSX.Element): ResolvedChildren {
  if (typeof children === 'function' && !children.length) return resolveChildren(children())
    if (Array.isArray(children)) {
      const results: any[] = []
      for (let i = 0; i < children.length; i++) {
        const result = resolveChildren(children[i])
        Array.isArray(result) ? results.push.apply(results, result): results.push(result)
      }
      return results
    }
    return children as ResolvedChildren
}

export function createComputed<T>(fn: (v?: T) => T, value?: T, options?: { name?: string}): void {
  updateComputation(createComputation(fn, value, true, undefined))
}


export function untrack<T>(fn: Accessor<T>) {
  let result: T,
  listener = Listener

  Listener = null
  result = fn()
  Listener = listener

  return result
}


export function runUserEffects(queue: Computation<any>[]) {
  let i,
  userLength = 0
  for (i = 0; i < queue.length; i++) {
    const e = queue[i]
    if (!e.user) {
      runTop(e)
    } else {
      queue[userLength++] = e
    }
  }
  const resume = queue.length
  for (i = 0; i < userLength; i++) runTop(queue[i])
  for (i = resume; i < queue.length; i++) runTop(queue[i])
}


export function on<S extends Accessor<unknown> | Accessor<unknown>[] | [], Next, init = unknown>(
  deps: S,
  fn: OnEffectFunction<S, Init | Next, Next>,
  options?: OnOptions
): EffectFunction<NoInfer<Init> | NoInfer<Next>, NoInfer<Next>> {
  const isArray = Array.isArray(deps)
  let prevInput: ReturnTypes<S>
  return (prevValue: Init | Next) => {
    let input: ReturnTypes<S>
    let defer = options && options.defer
    if (isArray) {
      input = [] as TODO
      for (let i = 0; i < deps.length; i++) (input as TODO[]).push((deps as Array<() => S>)[i]())
    } else {
      input = (deps as () => s)() as TODO
    }
    if (defer) {
      defer = false
      return undefined as unknown as Next
    }
    const result = untrack<Next>(() => fn(input, prevInput, prevValue))
    prevInput = input
    return result
  }
}


function markDownstream(node: Memo<any>) {
  for (let i = 0; i < node.observers!.length; i += 1) {
    const o = node.observers![i]
    
    if (!o.state) {
      o.state = PENDING
      if (o.pure) {
        Updates!.push(o)
      } else {
        Effects!.push(o)
      }
      (o as Memo<any>).observers && markDownstream(o as Memo<any>)
    }
  }
}
