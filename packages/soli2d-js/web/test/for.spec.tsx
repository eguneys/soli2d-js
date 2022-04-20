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

  const Tile = (props: string) => (<transform name={props.name} x={props.x}/>)

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

  test('empty list', () => {
    root = createRoot(() => <transform><Component2/></transform>)

    setList([])
    
    expect(root._flat.length).toBe(3)
  })

  const [x, setX] = createSignal(0)

  test('double for', () => {

    const Game = () => (<>
        <Tile name={'first'}/>
        <ParentBox list={list()}/>
        <Tile name={'last'} x={x()}/>
        </>)
  
    const ParentBox = (props) => (<>
       <transform>
         <Tile/>
       </transform>
       <For each={props.list}>{(_, i) => 
         <For each={props.list}>{(_, i) => 
           <Tile name={'dfor'+_}/>
         }</For>
       }</For>
     </>)
  

    root = createRoot(() => <transform><Game/></transform>)
    
    setList([1])
    setList([1])

    expect(root._flat.length).toBe(6)
    expect(root._flat.find(_ => _.name === 'last').x).toBe(0)
    setX(7)
    expect(root._flat.find(_ => _.name === 'last').x).toBe(7)
  })


  test('for update', () => {

    let Comp = () => (<transform>
       <Tile name={"side"}/>
       <For each={list()}>{(_, i) => 
         <Tile name={'dfor'+ i()} x={_.x}/>
       }</For>
        </transform>)

     
    setList([{x: 0}])
    root = createRoot(() => <transform><Comp/></transform>)

    setList([{x: 7}])

    expect(root._flat.find(_ => _.name === 'dfor0').x).toBe(7)

    setList([{x: 6}])
    expect(root._flat.find(_ => _.name === 'dfor0').x).toBe(6)

    expect(root._flat.length).toBe(3)
  })

})
