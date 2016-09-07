import { call, fork } from 'redux-saga/effects';
import { eksempel1 } from './effecteksempler/eksempel1';
import { eksempel2 } from './effecteksempler/eksempel2';
import { eksempel3 } from './effecteksempler/eksempel3';
import { eksempel4 } from './effecteksempler/eksempel4';
import { eksempel5 } from './effecteksempler/eksempel5';

export default function* () {
  yield [
    call(eksempel1),
    call(eksempel2),
    call(eksempel3),
    call(eksempel4),
    call(eksempel5),
  ];
  // yield fork(eksempel1)
  // yield fork(eksempel2)
  // yield fork(eksempel3)
  // yield fork(eksempel4)
  // yield fork(eksempel5)
}
