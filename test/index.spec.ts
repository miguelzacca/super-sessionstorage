import { test, describe, expect } from '@jest/globals'
import { SuperSessionStorage } from '../src/index'

const wait = (ms: number) => {
  return new Promise((res, rej) => {
    setTimeout(res, ms)
  })
}

describe('super-sessionstorage', () => {
  test('simple storage', () => {
    const s = new SuperSessionStorage()
    s.setItem('item', 10)
    expect(s.getItem('item')).toStrictEqual(10)
  })

  test('strict type storage', () => {
    const s = new SuperSessionStorage<number[]>()
    s.setItem('item', [1, 2, 3])
    expect(s.getItem('item')).toStrictEqual([1, 2, 3])
  })

  test('stdTTL and customTTL storage', async () => {
    const s = new SuperSessionStorage({ stdTTL: 2 })
    s.setItem('std', 10)
    s.setItem('custom', 10, 1)

    const getValues = () => [s.getItem('std'), s.getItem('custom')]

    expect(getValues()).toStrictEqual([10, 10])

    await wait(1000)

    expect(getValues()).toStrictEqual([10, undefined])

    await wait(1000)

    expect(getValues()).toStrictEqual([undefined, undefined])
  })

  test('storage methods', () => {
    const s = new SuperSessionStorage()

    s.setItem('item', 10)
    s.setItem('example', [1, 2, 3])

    const testLst = [
      s.length,
      s.has('item'),
      s.includes(10),
      s.key(0),
      s.removeItem('item'),
      s.length,
      s.clear(),
      s.length,
    ]

    const expectLst = [2, true, true, 'item', undefined, 1, undefined, 0]

    expect(testLst).toStrictEqual(expectLst)
  })
})
