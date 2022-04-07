import { createRoot, createSignal } from '../../src'
import { insert, For } from '../src'
import { Transform } from 'soli2d'


describe("Testing an only child each control flow", () => {
  let root: Transform

  const n1 = new Transform(),
        n2 = new Transform(),
        n3 = new Transform(),
        n4 = new Transform()

  const [list, setList] = createSignal([n1, n2, n3, n4])

  const Component = () => (
    <transform>
      <For each={list()}>{item => item}
      </For>
    </transform>
      )

  test('create each control flow', () => {
    let root = createRoot(dispose => <Component />)
    expect(root._flat.length).toBe(5)
  })

  const Tile = () => (<transform/>)

  const Component2 = () => (<transform>
     <Tile/>
     <For each={list()}>{ _ => <Tile/>}</For>
     <Tile/>
   </transform>)

  test.only('more elements', () => {
    let root = createRoot(dispose => <Component2/>)
    expect(root._flat.length).toBe(7)
  })
})
