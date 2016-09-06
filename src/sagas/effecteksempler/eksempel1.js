import { takeEvery } from 'redux-saga';
import { call, put, take } from 'redux-saga/effects';

const delay = ms => new Promise(resolve => setTimeout(() => resolve(), ms));

function* doCall(action) {
  yield call(delay, 2000);
  yield put({ type: 'TEST_CALL_FERDIG', count: action.count });
}

export function* eksempel1() {
  yield* takeEvery('TEST_CALL', doCall);
}
