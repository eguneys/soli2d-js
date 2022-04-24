import { createRoot, createSignal } from '../../src'
import { For, Show } from '../src'

describe("Testing an only child show control flow", () => {

  let root: Transform

  const [count, setCount] = createSignal(0)
  const Component = () => (<transform>
      <Show when={count() > 5}><transform/></Show>
    </transform>)


  test('create show control flow', () => {
    root = createRoot(dispose => <Component/>)
    
    expect(root._flat.length).toBe(1)
    })


  test('toggle show control flow', () => {
    root = createRoot(dispose => <Component/>)
    setCount(7)
    expect (root._flat.length).toBe(2)
  })


  test('show inside for', () => {
      root = createRoot(dispose => <transform>
          <For each={[1,2,3]}>{ item =>
            <Component/>
          }</For>
          </transform>)

  setCount(7)
  expect(root._flat.length).toBe(7)
  setCount(0)
  expect(root._flat.length).toBe(4)

      })


  test.only('show contains fragment', () => {

    const RevealCard = () => (<>
       <transform></transform>
     </>)

    root = createRoot(dispose => (<transform>
          <For each={[1]}>{item=>
          <transform>
          <Show when={count()<5}
  fallback={<RevealCard/>} >
            <>
         <RevealCard/>
         <RevealCard/>
            </>
          </Show>
          </transform>
          }</For>
      </transform>))

    setCount(7)
    expect(root._flat.length).toBe(3)
    setCount(0)
    expect(root._flat.length).toBe(4)
    setCount(7)
    expect(root._flat.length).toBe(3)
  })
})
