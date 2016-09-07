import { takeEvery } from 'redux-saga';
import { call, put, take } from 'redux-saga/effects';

export const delay = ms => new Promise(resolve => setTimeout(() => resolve(), ms));

export function* doCall(action) {
  yield call(delay, 2000);
  yield put({ type: 'TEST_CALL_FERDIG', count: action.count });
}

export function* eksempel1() {
  yield* takeEvery('TEST_CALL', doCall);
}

// Sånn funker takeEvery

function* minTakeEvery(type, gen) {
  while (true) {
    const action = yield take(type);
    yield fork(gen, action);
  }
}
