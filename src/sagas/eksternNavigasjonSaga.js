import { takeEvery } from 'redux-saga';
import { call, put } from 'redux-saga/effects';
import { NAVIGER_EKSTERNT, eksternNavigasjonStart, eksternNavigasjonSlutt } from '../actions';
import { delay, navigate, navigateInNewWindow } from '../felles/util';

export function* naviger({ payload: { url, nyttVindu, delayMs } }) {
    yield put(eksternNavigasjonStart());

    if (delayMs && delayMs > 0) {
        yield call(delay, delayMs);
    }

    if (nyttVindu) {
        yield call(navigateInNewWindow, url);
    } else {
        yield call(navigate, url);
    }

    yield put(eksternNavigasjonSlutt());
}

export default function* () {
    yield* takeEvery(NAVIGER_EKSTERNT, naviger);
}
