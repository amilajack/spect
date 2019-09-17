# @spect/core ![unstable](https://img.shields.io/badge/stability-unstable-yellow) [![Build Status](https://travis-ci.org/spectjs/spect.svg?branch=master)](https://travis-ci.org/spectjs/spect)

Reactive [aspects](https://en.wikipedia.org/wiki/Aspect-oriented_programming) for javascript objects.


[![npm i @spect/core](https://nodei.co/npm/@spect/core.png?mini=true)](https://npmjs.org/package/@spect/core/)

```js
import spect from '@spect/core'

spect.fn(state)

let foo = {}
foo = spect(foo)

// timer aspect
foo.use(foo => {
  console.log(foo.state('count'))

  // rerender
  setTimeout(() => foo.state( state => state.count++ ), 1000)
})
```


## API

[**`spect.fn`**](#spectfn-fns----register-effects)&nbsp;&nbsp; [**`spect`**](#spect-target---create-aspectable)&nbsp;&nbsp; [**`.use`**](#use-fns---assign-aspects)&nbsp;&nbsp; [**`.update`**](#update-fns-deps----update-aspects)&nbsp;&nbsp; [**`.dispose`**](#dispose-fns----remove-aspect)&nbsp;&nbsp;

### `spect.fn( ...fns )` - register effects

Register effect(s) available for targets.

```js
import spect from '@spect/core'
import prop from '@spect/prop'
import state from '@spect/state'
import fx from '@spect/fx'

spect.fn(state, prop, fx)

let target = spect({ foo: 'bar' })

target.state('foo', 'baz')
```

### `spect( target? )` − create aspectable

Turn target into aspectable. The wrapper provides transparent access to target props, extended with registered effects via Proxy. `use` and `update` effects are provided by default, other effects must be registered via `spect.fn(...fxs)`.

```js
import spect from '@spect/core'

let target = spect({ foo: 'bar' })

// properties are transparent
target.foo // 'bar'

// targets are thenable
await target.use(() => { /* ..aspect */ })

// re-update all aspects
target.update()
```

### `.use( fns? )` − assign aspects

Assign aspect(s) to target. Each aspect `fn` is invoked as microtask. By reading/writing effects, aspect subscribes/publishes changes, causing update.

```js
import spect from '@spect/core'
import prop from '@spect/prop'
import state from '@spect/state'

spect.fn(prop, state)

let foo = spect({})
let bar = spect({})

foo.use(foo => {
  // subscribe to updates
  let x = foo.state('x')
  let y = bar.prop('y')

  // update after 1s
  setTimeout(() => foo.state( state => state.x++ ), 1000)
})

// update foo
bar.prop('y', 1)
```

### `.update( fns?, deps? )` - update aspect(s)

(re-)Run assigned aspects. If `fn` isn't provided, rerenders all aspects. `deps` control the conditions when the aspect must be reupdate, they take same signature as `useEffect` hook.

```js
import spect from '@spect/core'

let foo = spect({})

foo.use(a, b)

// update only a
await foo.update(a)

// update all
await foo.update()
```

### `.dispose( fns? )` - remove aspect

Remove assigned aspects. If `fn` isn't provided, removes all aspects.

```js
import spect from '@spect/core'

let foo = spect({})

foo.use(a, b)

// remove a
await foo.dispose(a)

// remove all
await foo.dispose()
```


<!--
#### Internals

Internal methods are available for effects as

```js
import spect, { symbols } from '@spect/core'

spect.fn(function myEffect (arg, deps) {
  // `this` is `spect` instance
  // `this[symbols.target]` - initial target object

  // `this._deps(deps, destructor)` - is dependencies gate
  if (!this._deps(deps, () => { /* destructor */})) return this

  // `this._pub(path)` - publishes update of some name / path string
  // `this._sub(path, aspect?)` - subscribes current aspect to paths
  // `this[symbols.subscription]` - subscriptions dict
  // `this._update(aspect)` - updates aspect as microtask
  // `this[symbols.promise]` - internal queue
  // `this[symbols.aspects]` - internal map of assigned aspects

  return this
})
```
-->

##

<p align="center">HK</p>