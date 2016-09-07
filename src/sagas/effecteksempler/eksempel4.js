import { takeLatest } from 'redux-saga';
import { call, put, take, select, fork, join } from 'redux-saga/effects';

const Api = {
  users() {
    return new Promise(resolve => setTimeout(() => resolve({ users: [ { name: 'Øystein' } ] }), 1000));
  },
  tasks() {
    return new Promise(resolve => setTimeout(() => resolve({ tasks: [ { task: 'Rydd rommet' } ] }), 2000));
  }
}

function* run() {
  const taskFetchUsers = yield fork(Api.users);
  const taskFetchTasks = yield fork(Api.tasks);

  yield put({ type: 'HENTER_USERS' });
  yield put({ type: 'HENTER_TASKS' });

  const users = yield join(taskFetchUsers);
  yield put({ type: 'BRUKERE', payload: users });
}

export function* eksempel4() {
  yield* takeLatest('EKSEMPEL4', run);
}
