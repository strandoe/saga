import { takeLatest } from 'redux-saga';
import { call } from 'redux-saga/effects';
import { ENDRE_POST } from '../actions';
import { delay } from '../felles/util';

function* beregn() {
    yield delay(1000);
}

function* watchEndrePost() {
    yield* takeLatest(ENDRE_POST, beregn);
}

export default function* endringerSaga() {
    yield [call(watchEndrePost)];
}
