import { call } from 'redux-saga/effects';
import { eksempel1 } from './effecteksempler/eksempel1';
import { eksempel2 } from './effecteksempler/eksempel2';
import { eksempel3 } from './effecteksempler/eksempel3';

export default function* () {
  yield [
    call(eksempel1),
    call(eksempel2),
    call(eksempel3),
  ];
}
