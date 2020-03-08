import channel, { observer, CANCEL } from './channel.js'

export default (...subs) => {
  let cur = subs.length ? [subs.shift()] : []
  let chan = channel()

  value.set = val => (chan(cur[0] = val), cur[0])

  function value (val) {
    if (val === CANCEL) subs.length = 0

    let res = !arguments.length ? cur[0] :
      observer(val) ? (cur.length && val(cur[0]), chan(val)) :
      value.set(val)

    return res
  }

  return value
}

