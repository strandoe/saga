import { takeLatest } from 'redux-saga';
import { call, put, race, take } from 'redux-saga/effects';

const Api = {
  users() {
    return new Promise(resolve => setTimeout(() => resolve({ users: [ { name: 'Øystein' } ] }), 5000));
  },
}

function* run() {
  const { users, cancel } = yield race({
    users: call(Api.users),
    cancel: take('CANCEL'),
  });

  if (users) {
    yield put({ type: 'USERS_VANT!', payload: users });
  }

  if (cancel) {
    yield put({ type: 'USERS_BLE_STOPPET' });
  }
}

export function* eksempel5() {
  yield* takeLatest('EKSEMPEL5', run);
}
