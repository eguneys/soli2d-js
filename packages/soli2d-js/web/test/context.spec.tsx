import { createContext, useContext } from '../../src/'
import { render } from '../src'
import { Transform } from 'soli2d'

describe('Testing Context', () => {

  const ThemeContext = createContext(10)

  const Component = () => {
    const theme = useContext(ThemeContext)
    return (<transform x={theme}/>)
  }

  it('should work with single provider child', () => {
      let root = new Transform()

    render(
        () => (
        <ThemeContext.Provider value={20}>
          <Component/>
        </ThemeContext.Provider>), root)

    expect(root._children[0].x).toBe(20)
  })
    
    
})
