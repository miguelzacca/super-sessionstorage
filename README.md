# Super sessionStorage

Implementation of improved `window.sessionStorage` for server, `Type-Safe`, and TTL cache system.

it works without the need for a `window`. Furthermore, super sessionstorage maintains the original types, avoiding the need to make conversions. (type-safe storage).

## Install

```bash
npm install super-sessionstorage
```

## Methods

- `setItem`

- `getItem`

- `key`

- `includes`

- `clear`

- `length`

- `removeItem`

## Options

- `ttl` default is infinity (seconds)

- `checkperiod` default is 60 (seconds)

## Example

config.js:

```js
import { SuperSessionStorage } from 'super-sessionstorage'

export const storage = new SuperSessionStorage({ ttl: 3600 })
```

setItem:

```js
import { storage } from './config.js'

const myObject = {
  test1: 123,
  test2: [1, 2, '123'],
}

storage.setItem('example', myObject)
```

getItem:

```js
import { storage } from './config.js'

const example = storage.getItem('example')

console.log(example)
console.log(typeof example)
```

output:

```txt
{ test1: 123, test2: [1, 2, "123"] }
object
```
