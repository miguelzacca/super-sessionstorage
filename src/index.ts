interface SuperSessionStorageProperties {
  setItem(key: string, value: any): void
  getItem(key: string): any
  key(index: number): string | undefined
  has(key: string): boolean
  includes(value: any): boolean
  removeItem(key: string): void
  clear(): void
  get length(): number
}

interface SuperSessionStorageConstructor {
  ttl: number
  checkperiod?: number
}

type MapEntry = { value: any; expiresIn: number | undefined }

export class SuperSessionStorage implements SuperSessionStorageProperties {
  private map = new Map<string, MapEntry>()

  private ttl?: number
  private cleanupInterval?: number

  constructor(options?: SuperSessionStorageConstructor) {
    if (options?.ttl) {
      this.ttl = options.ttl
      this.cleanupInterval = setInterval(
        () => this.cleanupExpiredEntries(),
        (options.checkperiod || 60) * 1000,
      )
    }
  }

  private get getCurrentTime() {
    return new Date().getTime() / 1000
  }

  private getUnexpiredItem(key: string) {
    const entry = this.map.get(key)

    if (entry?.expiresIn && this.getCurrentTime > entry.expiresIn) {
      this.map.delete(key)
      return
    }
    return entry
  }

  private cleanupExpiredEntries() {
    const currentTime = this.getCurrentTime

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

  setItem(key: string, value: any): void {
    const expiresIn = this.ttl && this.getCurrentTime + this.ttl
    this.map.set(key, { value, expiresIn })
  }

  getItem(key: string) {
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

  includes(value: any): boolean {
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
  }

  get length(): number {
    this.cleanupExpiredEntries()
    return this.map.size
  }
}
