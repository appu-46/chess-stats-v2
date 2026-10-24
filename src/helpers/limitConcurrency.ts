// Runs at most `max` of the tasks given to it at once; the rest wait their
// turn in order. Used where a page would otherwise start many requests to
// one site together (a card per favourite), which the chess sites
// rate-limit.
export function limitConcurrency(max: number) {
  let running = 0
  const queue: Array<() => void> = []

  function next() {
    if (running >= max) return
    const start = queue.shift()
    if (!start) return
    running++
    start()
  }

  return function limit<T>(task: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      queue.push(() => {
        task()
          .then(resolve, reject)
          .finally(() => {
            running--
            next()
          })
      })
      next()
    })
  }
}
