# Super sessionStorage

Implementation of improved `window.sessionStorage` for server, `Type-Safe`, and TTL cache system.

it works without the need for a `window`. Furthermore, super sessionstorage maintains the original types, avoiding the need to make conversions. (type-safe storage).

## Install

```bash
npm install super-sessionstorage
```

## Methods

- `setItem(key: string, value: T, customTTL?: number): void`

- `getItem(key: string): T | undefined`

- `key(index: number): string | undefined`

- `has(key: string): boolean`

- `includes(value: T): boolean`

- `clear(): void`

- `get length(): number`

- `removeItem(key: string): void`

## Options

- `stdTTL` default is infinity (seconds)

- `checkperiod` default is 60 (seconds)

## Strict Type

```js
const storage = new SuperSessionStorage<CustomItemType>({ /* options */ })
```

## Example

#### config.js:

```js
import { SuperSessionStorage } from 'super-sessionstorage'

export const storage = new SuperSessionStorage({ stdTTL: 3600 })
```

#### setItem:

```js
import { storage } from './config.js'

const myObject = {
  test1: 123,
  test2: [1, 2, '123'],
}

storage.setItem('example', myObject)
```

#### getItem:

```js
import { storage } from './config.js'

const example = storage.getItem('example')

console.log(example)
console.log(typeof example)
```

#### output:

```txt
{ test1: 123, test2: [1, 2, "123"] }
object
```

#### Strict Type:

```js
import { SuperSessionStorage } from 'super-sessionstorage'

type Item = { id: number;  productName: string }

const storage = new SuperSessionStorage<Item>()

storage.setItem('example1', { id: '100', productName: 'test' })
// Error: Id should be number
```
