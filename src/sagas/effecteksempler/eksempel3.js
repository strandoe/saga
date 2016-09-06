import { takeLatest } from 'redux-saga';
import { call, put, take, select } from 'redux-saga/effects';

function* sjekk() {
  const count = yield select(state => state.count);
  if (count > 2) {
      yield put({ type: 'COUNT_VAR_STOR_NOK' });
  } else {
    yield put({ type: 'COUNT_VAR_FOR_LITEN' });
  }
}

export function* eksempel3() {
  yield* takeLatest('SJEKK_COUNT', sjekk);
}
