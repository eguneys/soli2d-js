import { createSignal, untrack, createRoot } from './signal'

export function mapArray<T, U>(
  list: Accessor<readonly T[] | undefined | null | false>,
  mapFn: (v: T, i: Accessor<number>) => U,
    options: { fallback?: Accessor<any> } = {}
): () => U[] {
  let items: (T | typeof FALLBACK)[] = [],
    mapped: U[] = [],
    disposers: (() => void)[] = [],
    len = 0,
    indexes: ((v: number) => number)[] | null = mapFn.length > 1 ? [] : null

  //onCleanup(() => dispose(disopsers))
  return () => {
    let newItems = list() || [],
      i: number,
    j: number
    return untrack(() => {
      let newLen = newItems.length,
        newIndices: Map<T | typeof FALLBACK, number>,
      newIndicesNext: number[],
      temp: U[],
      tempdisposers: (() => void)[],
        tempIndexes: ((v: number) => number)[],
        start: number,
      end: number,
      newEnd: number,
      item: T | typeof FALLBACK

      if (newLen === 0) {
        if (len !== 0) {
          dispose(disposers)
          disposers = []
          items = []
          mapped = []
          len = 0
          indexes && (indexes = [])
        }
        if (options.fallback) {
        }
      } else if (len === 0) {
        mapped = new Array(newLen)
        for (j = 0; j < newLen; j++) {
          items[j] = newItems[j]
          mapped[j] = createRoot(mapper)
        }
        len = newLen
      } else {
        temp = new Array(newLen)
        tempdisposers = new Array(newLen)
        indexes  && (tempIndexes = new Array(newLen))

        for (
          start = 0, end = Math.min(len, newLen);
        start < end && items[start] === newItems[start];
        start++
        );


        for(
          end = len - 1, newEnd = newLen - 1;
        end >= start && newEnd >= start && items[end] === newItems[newEnd];
        end--, newEnd--
        ) {
          temp[newEnd] = mapped[end]
          tempdisposers[newEnd] = disposers[end]
          indexes && (tempIndexes![newEnd] = indexes[end])
        }


        newIndices = new Map<T, number>()
        newIndicesNext = new Array(newEnd + 1)
        for (j = newEnd; j>= start; j--) {
          item = newItems[j]
          i = newIndices.get(item)!
          newIndicesNext[j] = i === undefined ? -1 : i
          newIndices.set(item, j)
        }

				for (i = start; i <= end; i++) {
					item = items[i];
					j = newIndices.get(item)!;
					if (j !== undefined && j !== -1) {
						temp[j] = mapped[i];
						tempdisposers[j] = disposers[i];
						indexes && (tempIndexes![j] = indexes[i]);
						j = newIndicesNext[j];
						newIndices.set(item, j);
					} else disposers[i]();
				} 


				for (j = start; j < newLen; j++) {
					if (j in temp) {
						mapped[j] = temp[j];
						disposers[j] = tempdisposers[j];
						if (indexes) {
							indexes[j] = tempIndexes![j];
							indexes[j](j);
						}
					} else mapped[j] = createRoot(mapper);
				}


        mapped = mapped.slice(0, (len = newLen))

        items = newItems.slice(0)
      }

      return mapped
    })


    function mapper(disposer: () => void) {
      disposers[j] = disposer
      if (indexes) {
        const [s, set] = createSignal(j)
        indexes[j] = set
        return mapFn(newItems[j], s)
			}
      return (mapFn as any)(newItems[j])
		}
  }
}
