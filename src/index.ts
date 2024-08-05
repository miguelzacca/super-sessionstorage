interface SuperSessionStorageProperties {
  setItem(key: string, value: any): void
  getItem(key: string): any
  key(index: number): any
  removeItem(key: string): void
  clear(): void
  length(): number
}

class SuperSessionStorage implements SuperSessionStorageProperties {
  private map = new Map()

  setItem(key: string, value: any): void {
    this.map.set(key, value)
  }

  getItem(key: string) {
    return this.map.get(key)
  }

  key(index: number) {
    return Array.from(this.map.entries())[index][1]
  }

  removeItem(key: string): void {
    this.map.delete(key)
  }

  clear(): void {
    this.map.clear()
  }

  length(): number {
    return this.map.size
  }
}

const superSessionStorage = new SuperSessionStorage()
export default superSessionStorage
