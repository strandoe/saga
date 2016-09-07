import { takeLatest } from 'redux-saga';
import { call, put, take } from 'redux-saga/effects';

export const delay = ms => new Promise(resolve => setTimeout(() => resolve(), ms));

export function* doCall(action) {
  yield call(delay, 2000);
  yield put({ type: 'TEST_CALL_FERDIG', count: action.count });
}

export function* eksempel2() {
  yield* takeLatest('TEST_CALL_LATEST', doCall);
}
