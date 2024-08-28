import { middleware } from 'func-middleware'

interface SuperSessionStorageProperties<T = any> {
  setItem(key: string, value: T, customTTL?: number): void
  getItem(key: string): T | undefined
  key(index: number): string | undefined
  has(key: string): boolean
  includes(value: T): boolean
  removeItem(key: string): void
  clear(): void
  get length(): number
}

interface SuperSessionStorageConstructor<T> {
  stdTTL: number
  checkperiod?: number
}

type MapEntry<T = any> = {
  value: T
  expiresIn: number | undefined
}

export class SuperSessionStorage<T = any>
  implements SuperSessionStorageProperties
{
  private map: Map<string, MapEntry<T>>

  private stdTTL?: number
  private cleanupInterval?: NodeJS.Timeout | number

  constructor(options?: SuperSessionStorageConstructor<T>) {
    if (options?.stdTTL) {
      this.stdTTL = options.stdTTL

      this.cleanupInterval = setInterval(
        () => this.cleanupExpiredEntries(),
        (options.checkperiod || 60) * 1000,
      )
    }

    this.map = new Map<string, MapEntry<T>>()
  }

  private getCurrentTime = () => {
    return new Date().getTime() / 1000
  }

  private getUnexpiredItem = (key: string) => {
    const entry = this.map.get(key)

    if (entry?.expiresIn && this.getCurrentTime() > entry.expiresIn) {
      this.map.delete(key)
      return
    }
    return entry
  }

  private cleanupExpiredEntries = () => {
    const currentTime = this.getCurrentTime()

    for (const [key, entry] of this.map) {
      if (entry.expiresIn && currentTime > entry.expiresIn) {
        this.map.delete(key)
      }
    }
  }

  private isEqual = (obj1: any, obj2: any) => {
    if (typeof obj1 !== 'object') {
      return obj1 === obj2
    }

    const keys1 = Object.keys(obj1)
    const keys2 = Object.keys(obj2)

    if (keys1.length !== keys2.length) {
      return false
    }

    for (const key of keys1) {
      if (!keys2.includes(key) || !this.isEqual(obj1[key], obj2[key])) {
        return false
      }
    }

    return true
  }

  private setItemDTO = (key: string, value: T, customTTL?: number) => {
    if (customTTL && !this.stdTTL) {
      throw new Error(
        'ERROR: To use customTTL you need to activate the default stdTTL on the instance',
      )
    }
  }

  public setItem = middleware(
    (key: string, value: T, customTTL?: number): void => {
      const definitiveTTL = customTTL || this.stdTTL
      const expiresIn = definitiveTTL && this.getCurrentTime() + definitiveTTL
      this.map.set(key, { value, expiresIn })
    },
    this.setItemDTO,
  )

  public getItem = (key: string): T | undefined => {
    return this.getUnexpiredItem(key)?.value
  }

  public key = middleware((index: number): string | undefined => {
    const entries = Array.from(this.map.entries())
    return entries[index] ? entries[index][0] : undefined
  }, this.cleanupExpiredEntries)

  public has = (key: string): boolean => {
    const entry = this.getUnexpiredItem(key)
    return !!entry
  }

  public includes = middleware((value: T): boolean => {
    const entries = Array.from(this.map.values())

    for (const entry of entries) {
      if (this.isEqual(value, entry.value)) {
        return true
      }
    }
    return false
  }, this.cleanupExpiredEntries)

  public removeItem = (key: string): void => {
    this.map.delete(key)
  }

  public clear = (): void => {
    this.map.clear()
    clearInterval(this.cleanupInterval)
    this.cleanupInterval = undefined
  }

  public get length(): number {
    this.cleanupExpiredEntries()
    return this.map.size
  }
}
