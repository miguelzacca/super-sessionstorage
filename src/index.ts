interface SuperSessionStorageProperties<ItemType = any> {
  setItem(key: string, value: ItemType): void
  getItem(key: string): ItemType | undefined
  key(index: number): string | undefined
  has(key: string): boolean
  includes(value: ItemType): boolean
  removeItem(key: string): void
  clear(): void
  get length(): number
}

interface SuperSessionStorageConstructor<ItemType = any> {
  ttl: number
  checkperiod?: number
}

type MapEntry<ItemType = any> = {
  value: ItemType
  expiresIn: number | undefined
}

export class SuperSessionStorage<ItemType = any>
  implements SuperSessionStorageProperties
{
  private map: Map<string, MapEntry<ItemType>>

  private ttl?: number
  private cleanupInterval?: number

  constructor(options?: SuperSessionStorageConstructor<ItemType>) {
    if (options?.ttl) {
      this.ttl = options.ttl

      this.cleanupInterval = setInterval(
        () => this.cleanupExpiredEntries(),
        (options.checkperiod || 60) * 1000,
      )
    }

    this.map = new Map<string, MapEntry<ItemType>>()
  }

  private getCurrentTime() {
    return new Date().getTime() / 1000
  }

  private getUnexpiredItem(key: string) {
    const entry = this.map.get(key)

    if (entry?.expiresIn && this.getCurrentTime() > entry.expiresIn) {
      this.map.delete(key)
      return
    }
    return entry
  }

  private cleanupExpiredEntries() {
    const currentTime = this.getCurrentTime()

    for (const [key, entry] of this.map) {
      if (entry.expiresIn && currentTime > entry.expiresIn) {
        this.map.delete(key)
      }
    }
  }

  private isEqual(obj1: any, obj2: any) {
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

  setItem(key: string, value: ItemType): void {
    const expiresIn = this.ttl && this.getCurrentTime() + this.ttl
    this.map.set(key, { value, expiresIn })
  }

  getItem(key: string): ItemType | undefined {
    return this.getUnexpiredItem(key)?.value
  }

  key(index: number): string | undefined {
    this.cleanupExpiredEntries()
    const entries = Array.from(this.map.entries())
    return entries[index] ? entries[index][0] : undefined
  }

  has(key: string): boolean {
    const entry = this.getUnexpiredItem(key)
    return !!entry
  }

  includes(value: ItemType): boolean {
    this.cleanupExpiredEntries()
    const entries = Array.from(this.map.values())

    for (const entry of entries) {
      if (this.isEqual(value, entry.value)) {
        return true
      }
    }
    return false
  }

  removeItem(key: string): void {
    this.map.delete(key)
  }

  clear(): void {
    this.map.clear()
    clearInterval(this.cleanupInterval)
    this.cleanupInterval = undefined
  }

  get length(): number {
    this.cleanupExpiredEntries()
    return this.map.size
  }
}
