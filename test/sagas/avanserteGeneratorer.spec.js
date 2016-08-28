import expect from 'expect';
import { createStore, applyMiddleware } from 'redux'
import { put, take, call, runSaga, sagaMiddleware } from '../../src/sagas/saga';

function ajax(url) {
  console.log('fetching url', url);
  return new Promise(resolve => setTimeout(() => resolve({response: url}), 500));
}

function rootReducer(state, action) {
  return state;
}

const store = createStore(rootReducer, applyMiddleware(sagaMiddleware));

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
    runSaga(minSaga, store).then(done);
    store.dispatch({ type: 'HENT', payload: 'www.apple.com'});
  });
});
