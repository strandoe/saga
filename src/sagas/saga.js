export function call(fn, ...args) {
  return {
    CALL: {
      fn,
      args,
    }
  };
}

export function put(action) {
  return {
    PUT: action,
  };
}

export function take(type) {
  return {
    TAKE: type,
  }
}

const listeners = [];
function subscribe(type, cb) {
  listeners.push({ type, cb });
}

export const sagaMiddleware = store => next => action => {
  const result = next(action);
  listeners.filter(l => l.type === action.type).forEach(l => l.cb(action));
  return result;
};

function processNext(g, resolve, dispatch, next) {
  if (next.done) {
    resolve();
  }
  const performNext = processNext.bind(this, g, resolve, dispatch);
  const { CALL, PUT, TAKE } = next.value;

  if (CALL) {
    CALL.fn(...CALL.args).then(val => {
      performNext(g.next(val));
    });
  } else if (PUT) {
    dispatch(PUT);
    performNext(g.next(PUT));
  } else if (TAKE) {
    subscribe(TAKE, action => performNext(g.next(action)));
  }
}

export function runSaga(gen, store) {
  const g = gen();
  return new Promise(resolve => {
    processNext(g, resolve, store.dispatch, g.next());
  });
}
