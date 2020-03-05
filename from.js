// create an observable from any observable-like source
import _observable from 'symbol-observable'
import value from './value.js'
import channel from './channel.js'

export default function from(src, map) {
  let curr

  // constant (stateful)
  if (primitive(src)) {
    const c = value(src)
    curr = (...args) => typeof args[0] === 'function' ? c(...args) : c()
  }
  // observable / observ / mutant (stateful)
  else if (typeof src === 'function') {
    curr = src
  }
  // Observable, xstream, rxjs etc (stateless)
  else if (src[_observable]) {
    src[_observable]().subscribe({next: curr = channel()})
  }
  // async iterator (stateful, initial undefined)
  else if (src.next || src[Symbol.asyncIterator]) {
    curr = value()
    ;(async () => {for await (const v of src) curr(v)})()
  }
  // node streams (stateless)
  else if (src.on && src.pipe) {
    src.on('data', curr = channel())
  }
  // promise (stateful, initial undefined)
  else if (src.then) {
    src.then(curr = channel())
  }
  // objects etc
  else curr = value(src)

  if (map) {
    let mapped = value()
    curr(value => mapped(map(value)))
    curr = mapped
  }

  return curr
}

export function primitive(val) {
  if (typeof val === 'object') return val === null
  return typeof val !== 'function'
}
