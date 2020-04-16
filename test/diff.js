import t from 'tst'
import { merge as diff } from '../h'
// import diff from './libs/list-difference.js'
// import diff from './libs/udomdiff.js'
// import diff from './libs/snabbdom.js'


const t1 = document.createTextNode(1),
      t2 = document.createTextNode(2),
      t3 = document.createTextNode(3),
      t4 = document.createTextNode(4),
      t5 = document.createTextNode(5),
      t6 = document.createTextNode(6),
      t7 = document.createTextNode(7),
      t8 = document.createTextNode(8),
      t9 = document.createTextNode(9),
      t0 = document.createTextNode(0)


const frag = () => {
  let f = document.createDocumentFragment()
  f.count = 0
  f.reset = () => f.count = 0

  let _insertBefore = f.insertBefore
  f.insertBefore = function () {_insertBefore.apply(this, arguments), f.count++}
  let _appendChild = f.appendChild
  f.appendChild = function () {_appendChild.apply(this, arguments), f.count++}
  let _replaceChild = f.replaceChild
  f.replaceChild = function () {_replaceChild.apply(this, arguments), f.count++}
  let _removeChild = f.removeChild
  f.removeChild = function () {_removeChild.apply(this, arguments), f.count++}

  return f
}


t('create', t => {
  let parent = frag();

  diff(parent, parent.childNodes, [t1,t2,t3,t4,t5], );
  t.is([...parent.childNodes], [t1,t2,t3,t4,t5], 'create')
})

t('remove', t => {
  let parent = frag();
  diff(parent, parent.childNodes, [t1,t2,t3,t4,t5], );

  console.log('remove')
  diff(parent,parent.childNodes,[t1,t3,t5],);
  t.is([...parent.childNodes], [t1,t3,t5], 'remove')
})

t('insert', t => {
  let parent = frag();
  diff(parent, parent.childNodes, [t1,t3,t5], );

  console.log('insert')
  diff(parent,parent.childNodes,[t1,t2,t3,t4,t5],);
  t.is([...parent.childNodes],[t1,t2,t3,t4,t5], 'insert')
})

t('swap', t => {
  let parent = frag();
  diff(parent, parent.childNodes, [t1,t2,t3,t4,t5], );

  console.log('---swap')
  diff(parent,parent.childNodes,[t1,t5,t3,t4,t2],);
  t.is([...parent.childNodes], [t1,t5,t3,t4,t2])
})

t('reverse', t => {
  let parent = frag();
  diff(parent,parent.childNodes,[t1,t2,t3,t4,t5],);
  t.is([...parent.childNodes], [t1,t2,t3,t4,t5])
  console.log('---reverse')
  diff(parent,parent.childNodes,[t5,t4,t3,t2,t1],);
  t.is([...parent.childNodes], [t5,t4,t3,t2,t1])
})

t('reverse-add', t => {
  let parent = frag();
  diff(parent,parent.childNodes,[t5,t4,t3,t2,t1],);

  diff(parent,parent.childNodes,[t1,t2,t3,t4,t5,t6],);
  t.is([...parent.childNodes], [t1,t2,t3,t4,t5,t6])
  console.groupEnd()
})

t('swap 10', t => {
  let parent = frag();
  diff(parent,parent.childNodes,[t1,t2,t3,t4,t5,t6,t7,t8,t9,t0],);
  parent.reset()
  console.log('---swap')
  diff(parent,parent.childNodes,[t1,t8,t3,t4,t5,t6,t7,t2,t9,t0],);
  t.is([...parent.childNodes], [t1,t8,t3,t4,t5,t6,t7,t2,t9,t0], 'order')
  t.is(parent.count, 2, 'ops count')
})

t('update each 3', t => {
  console.groupCollapsed('create')
  let parent = frag();
  diff(parent,parent.childNodes,[t1,t2,t3,t4,t5,t6,t7,t8,t9],);
  console.groupEnd()
  console.log('---update')
  let x = document.createTextNode(0), y = document.createTextNode(0), z = document.createTextNode(0)
  diff(parent,parent.childNodes,[t1,t2,x,t4,t5,y,t7,t8,z],);
  t.is([...parent.childNodes], [t1,t2,x,t4,t5,y,t7,t8,z])
})

t('create ops', t => {
  // That's fine: failed due to wrong nodes
  let parent = frag()
  const N = 100

  let start = 0;
  let childNodes = [];
  for (let i = 0; i < N; i++) childNodes.push(document.createTextNode(start + i))

  parent.reset()
  diff(parent,parent.childNodes,childNodes,)

  t.is(parent.count, N)

  // replace
  start = N
  childNodes = []
  for (let i = 0; i < N; i++) childNodes.push(document.createTextNode(start + i))

  parent.reset()
  console.log('replace')
  diff(parent,parent.childNodes,childNodes,)
  t.is((parent.count - N) < 100, true, 'ops count')
})



// actual benchmark
t('create 1000', async t => {
  const parent = frag()
  console.time('create 1000');
  const rows = create1000(parent, diff);
  console.timeEnd('create 1000');
  console.assert([...parent.childNodes].every((row, i) => row === rows[i]));
  const out = ['operations', parent.count];
  if (parent.count > 1000) {
    console.warn(`+${parent.count - 1000}`);
  }
  console.log(...out, '\n');
  parent.reset();
})

t('random', async t => {
  const parent = frag()
  console.time('random');
  const rows = random(parent, diff);
  console.timeEnd('random');
  console.assert([...parent.childNodes].every((row, i) => row === rows[i]));
  const out = ['operations', parent.count];
  if (parent.count > 1000) {
    console.warn(`+${parent.count - 1000}`);
  }
  console.log(...out, '\n');
  parent.reset();
})

t('reverse', async t => {
  const parent = frag()
  console.time('reverse');
  const rows = reverse(parent, diff);
  console.timeEnd('reverse');
  console.assert([...parent.childNodes].every((row, i) => row === rows[i]));
  const out = ['operations', parent.count];
  if (parent.count > 1000) {
    console.warn(`+${parent.count - 1000}`);
  }
  console.log(...out, '\n');
  parent.reset();
})

t('clear', async t => {
  const parent = frag()
  console.time('clear');
  const rows = clear(parent, diff);
  console.timeEnd('clear');
  console.assert([...parent.childNodes].every((row, i) => row === rows[i]) && rows.length === 0);
  const out = ['operations', parent.count];
  if (parent.count > 1000) {
    console.warn(`+${parent.count - 1000}`);
  }
  console.log(...out, '\n');
  parent.reset();

})

t('replace 1000', async t => {
  const parent = frag()
  create1000(parent, diff);
  parent.reset();
  console.time('replace 1000');
  const rows = create1000(parent, diff);
  console.timeEnd('replace 1000');
  console.assert([...parent.childNodes].every((row, i) => row === rows[i]));
  const out = ['operations', parent.count];
  if (parent.count > 2000) {
    console.warn(`+${parent.count - 2000}`);
  }
  console.log(...out, '\n');
  clear(parent, diff);
  parent.reset();

})

t('append 1000', async t => {
  const parent = frag()
  create1000(parent, diff);
  parent.reset();
  console.time('append 1000');
  const rows = append1000(parent, diff);
  console.timeEnd('append 1000');
  console.assert([...parent.childNodes].every((row, i) => row === rows[i]) && rows.length === 2000);
  const out = ['operations', parent.count];
  if (parent.count > 1000) {
    console.warn(`+${parent.count - 1000}`);
  }
  console.log(...out, '\n');
  parent.reset();
})

t('append more', async t => {
  const parent = frag()
  console.time('append more');
  const rows = append1000(parent, diff);
  console.timeEnd('append more');
  console.assert([...parent.childNodes].every((row, i) => row === rows[i]) && rows.length === 3000);
  const out = ['operations', parent.count];
  if (parent.count > 1000) {
    console.warn(`+${parent.count - 1000}`);
  }
  console.log(...out, '\n');
  parent.reset();
  clear(parent, diff);
})


t('swap rows', async t => {
  const parent = frag()
  create1000(parent, diff);
  parent.reset();
  console.time('swap rows');
  swapRows(parent, diff);
  console.timeEnd('swap rows');
  const out = ['operations', parent.count];
  if (parent.count > 2) {
    console.warn(`+${parent.count - 2}`);
  }
  console.log(...out, '\n');
  parent.reset();
})

t('update every 10th row', async t => {
  const parent = frag()
  create1000(parent, diff);
  parent.reset();
  console.time('update every 10th row');
  updateEach10thRow(parent, diff);
  console.timeEnd('update every 10th row');
  const out = ['operations', parent.count];
  if (parent.count > 200) {
    console.warn(`+${parent.count - 200}`);
  }
  console.log(...out, '\n');
  parent.reset();

  clear(parent, diff);
  parent.reset();
})

t('create 10000 rows', async t => {
  const parent = frag()
  console.time('create 10000 rows');
  create10000(parent, diff);
  console.timeEnd('create 10000 rows');
  const out = ['operations', parent.count];
  if (parent.count > 10000) {
    console.warn(`+${parent.count - 10000}`);
  }
  console.log(...out, '\n');
  parent.reset();
})

t('swap over 10000 rows', async t => {
  const parent = frag()
  console.time('swap over 10000 rows');
  swapRows(parent, diff);
  console.timeEnd('swap over 10000 rows');
  const out = ['operations', parent.count];
  if (parent.count > 2) {
    console.warn(`+${parent.count - 2}`);
  }
  console.log(...out, '\n');
  parent.reset();
})

t('clear 10000', async t => {
  const parent = frag()
  console.time('clear 10000');
  clear(parent, diff);
  console.timeEnd('clear 10000');
  const out = ['operations', parent.count];
  if (parent.count > 10000) {
    console.warn(`+${parent.count - 10000}`);
  }
  console.log(...out, '\n');
  parent.reset();
})


function random(parent, diff) {
  return diff(
    parent,
    parent.childNodes,
    Array.from(parent.childNodes).sort(() => Math.random() - Math.random()),

  );
}

function reverse(parent, diff) {
  return diff(
    parent,
    parent.childNodes,
    Array.from(parent.childNodes).reverse(),

  );
}

function append1000(parent, diff) {
  const start = parent.childNodes.length - 1;
  const childNodes = [...parent.childNodes];
  for (let i = 0; i < 1000; i++)
    childNodes.push(document.createTextNode(start + i));
  return diff(
    parent,
    parent.childNodes,
    childNodes,
  );
}

function clear(parent, diff) {
  return diff(
    parent,
    parent.childNodes,
    [],
  );
}

function create1000(parent, diff) {
  const start = parent.childNodes.length;
  const childNodes = [];
  for (let i = 0; i < 1000; i++)
    childNodes.push(document.createTextNode(start + i));
  return diff(
    parent,
    parent.childNodes,
    childNodes,
  );
}

function create10000(parent, diff) {
  const childNodes = [];
  for (let i = 0; i < 10000; i++)
    childNodes.push(document.createTextNode(i));
  return diff(
    parent,
    parent.childNodes,
    childNodes,

  );
}

function swapRows(parent, diff) {
  const childNodes = [...parent.childNodes];
  const $1 = childNodes[1];
  childNodes[1] = childNodes[998];
  childNodes[998] = $1;
  return diff(
    parent,
    parent.childNodes,
    childNodes,

  );
}

function updateEach10thRow(parent, diff) {
  const childNodes = [...parent.childNodes];
  for (let i = 0; i < childNodes.length; i += 10)
    childNodes[i] = document.createTextNode(i + '!');
  return diff(
    parent,
    parent.childNodes,
    childNodes,

  );
}
