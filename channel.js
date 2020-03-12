import _observable from 'symbol-observable'

export default (...subs) => {
    const _teardown = Symbol('teardown'), _cancel = Symbol('cancel')

    const next = (val, subs=channel.subs) => {
        // promise awaits value
        if (val && val.then) return val.then(val => next(val))
        subs.map(sub => {
            if (sub[_teardown] && sub[_teardown].call) ( sub[_teardown]())
            sub[_teardown] = sub(val)
        })
    }

    const cancel = () => {
        subs.map(sub => (
            sub[_teardown] && sub[_teardown].call && (sub[_teardown]()),
            delete sub[_teardown],
            sub[_cancel](),
            delete sub[_cancel]
        ))
        subs.length = 0
        channel.closed = true
    }

    const subscribe = (next, error, complete) => {
        next = next.call ? next : next.next
        complete = next.call ? complete : next.complete
        subs.push(next)

        const unsubscribe = () => {
            if (subs.length) subs.splice(subs.indexOf(next) >>> 0, 1)
            if (complete) complete()
            unsubscribe.closed = true
        }
        next[_cancel] = unsubscribe.unsubscribe = unsubscribe
        unsubscribe.closed = false
        return unsubscribe
    }

    const channel = val => observer(val) ? subscribe(val) : next(val)

    return Object.assign(channel, {
        subs,
        closed: false,
        next,
        subscribe,
        cancel,
        [_observable](){return this}
    })
}

export const observer = (val) => !!(val && (val.call || val.next))
