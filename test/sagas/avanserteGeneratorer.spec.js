import expect from 'expect';

function call(fn, ...args) {
  return {
    CALL: {
      fn,
      args,
    }
  };
}

function put(action) {
  return {
    PUT: action,
  };
}

function take(type) {
  return {
    TAKE: type,
  }
}

function ajax(url) {
  console.log('fetching url', url);
  return new Promise(resolve => setTimeout(() => resolve({response: url}), 500));
}

const fakeStore = {
  listeners: [],
  listen(type, cb) {
    this.listeners.push({ type, cb });
  },
  dispatch(action) {
    console.log('Dispatching action:', action);
    this.listeners.filter(l => l.type === action.type).forEach(l => l.cb(action));
  }
}

function processNext(g, resolve, next) {
  if (next.done) {
    resolve();
  }
  const { CALL, PUT, TAKE } = next.value;

  if (CALL) {
    CALL.fn(...CALL.args).then(val => {
      processNext(g, resolve, g.next(val));
    });
  } else if (PUT) {
    fakeStore.dispatch(PUT);
    processNext(g, resolve, g.next(PUT));
  } else if (TAKE) {
    fakeStore.listen(TAKE, action => processNext(g, resolve, g.next(action)));
  }
}

function runSaga(gen, done) {
  const g = gen();
  return new Promise(resolve => {
    processNext(g, resolve, g.next());
  }).then(done);
}

function* minSaga() {
  const action = yield take('HENT');
  const { response, error } = yield call(ajax, action.payload);

  if (response) {
    yield put({ type: 'MOTTATT', payload: response });
  } else if (error) {
    yield put({ type: 'FEILET', error });
  }
}

describe('Avanserte generatorfunksjoner', () => {
  it('skal kalle vg og dispatche MOTTATT hvis alt går bra', () => {
    const sut = minSaga();
    expect(sut.next().value).toEqual(take('HENT'));
    expect(sut.next({ type: 'HENT', payload: 'vg.no'}).value).toEqual(call(ajax, 'vg.no'));
    expect(sut.next({ response: 'hei' }).value).toEqual(put({ type: 'MOTTATT', payload: 'hei' }));
  });

  it('skal kalle vg og dispatche FEILET hvis noe feiler', () => {
    const sut = minSaga();
    expect(sut.next().value).toEqual(take('HENT'));
    expect(sut.next({ type: 'HENT', payload: 'vg.no'}).value).toEqual(call(ajax, 'vg.no'));
    expect(sut.next({ error: 'foo' }).value).toEqual(put({ type: 'FEILET', error: 'foo' }));
  });

  it('saga skal kjøre', (done) => {
    runSaga(minSaga, done);
    fakeStore.dispatch({ type: 'HENT', payload: 'www.apple.com'});
  });
});
