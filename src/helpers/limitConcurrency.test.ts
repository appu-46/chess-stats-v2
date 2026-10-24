import { describe, expect, it } from 'vitest'
import { limitConcurrency } from './limitConcurrency'

function deferred() {
  let resolve!: () => void
  let reject!: (error: Error) => void
  const promise = new Promise<void>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

describe('limitConcurrency', () => {
  it('runs no more than the limit at once, in order', async () => {
    const limit = limitConcurrency(2)
    const tasks = [deferred(), deferred(), deferred()]
    const started: Array<number> = []

    const results = tasks.map((task, i) =>
      limit(() => {
        started.push(i)
        return task.promise.then(() => i)
      }),
    )

    expect(started).toEqual([0, 1])
    tasks[0].resolve()
    await results[0]
    // Let the queue start the next task.
    await Promise.resolve()
    expect(started).toEqual([0, 1, 2])

    tasks[1].resolve()
    tasks[2].resolve()
    expect(await Promise.all(results)).toEqual([0, 1, 2])
  })

  it('frees the slot when a task fails', async () => {
    const limit = limitConcurrency(1)
    const failing = deferred()
    const first = limit(() => failing.promise)
    const second = limit(() => Promise.resolve('ok'))

    failing.reject(new Error('boom'))
    await expect(first).rejects.toThrow('boom')
    expect(await second).toBe('ok')
  })
})
