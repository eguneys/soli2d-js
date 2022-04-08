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
    root = createRoot(dispose => <Component />)
    expect(root._flat.length).toBe(5)
  })

  const Tile = (props: string) => (<transform name={props.name}/>)

  const Component2 = () => (<>
     <Tile name={'first'}/>
     <For each={list()}>{ (_, i) =><Tile name={"infor"+i()}/>}</For>
     <Tile name={'last'}/>
   </>)

  test('more elements', () => {
    root = createRoot(dispose => <transform><Component2/></transform>)
    expect(root._flat.map(_ => _.name).join('')).toBe('firstinfor0infor1infor2infor3last')
  })


  test('set list', () => {
    root = createRoot(() => <transform><Component2/></transform>)

    setList([1])

    expect(root._flat.length).toBe(4)
    expect(root._flat.map(_ => _.name).join('')).toBe('firstinfor0last')
  })

})
