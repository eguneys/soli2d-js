import { createRoot, createSignal } from '../../src'

describe("Basic element attributes", () => {
  test("ternary expression triggered", done => {
    let transform: Transform

    createRoot(() => {
      const [s, setS] = createSignal(0)

      transform = (<transform x={s() > 5 ? 500: 100}/>) as Transform

      expect(transform.x).toBe(100)

      setTimeout(() => {
        setS(7)
        try {
          expect(transform.x).toBe(500)
        } finally {
          done()
        }
      })
    })
  })
})
