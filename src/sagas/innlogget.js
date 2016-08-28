import { takeLatest } from 'redux-saga';
import { put, call, select } from 'redux-saga/effects';
import {
    INNLOGGET,
    hentOversikt,
} from '../actions';
import sesjonSaga from './sesjon';
import altinnSaga from './altinn';
import { getInnloggetBruker } from '../selectors';

export function* innlogget() {
    const innloggetBruker = yield select(getInnloggetBruker);
    yield put(hentOversikt(innloggetBruker.reportee));
    yield [
        call(altinnSaga),
        call(sesjonSaga),
    ];
}

export default function* () {
    yield* takeLatest(INNLOGGET, innlogget);
}
