# Super sessionStorage

Implementation of `window.sessionStorage` for server.

it works without the need for a window. Furthermore, super sessionstorage maintains the original types, avoiding the need to make conversions. (type-safe storage)

## Install

```bash
npm install super-sessionstorage
```

## Methods

- `setItem`

- `getItem`

- `key`

- `clear`

- `length`

- `removeItem`

## Example

setItem:

```js
import superSessionStorage from 'super-sessionstorage'

const myObject = { 
  test1: 123, 
  test2: [1, 2, '123'] 
}

superSessionStorage.setItem('example', myObject)
```

getItem:

```js
import superSessionStorage from 'super-sessionstorage'

const example = superSessionStorage.getItem('example')

console.log(example)
console.log(typeof example)
```

output:

```txt
{ test1: 123, test2: [1, 2, "123"] }
object
```
