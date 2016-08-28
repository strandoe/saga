import { takeLatest } from 'redux-saga';
import { call, put, select } from 'redux-saga/effects';
import { sjekkSesjon, startPollingAvSesjon, sesjonUtloept, LOGG_UT } from '../actions';
import { get as fetch } from '../felles/ajax';
import { delay } from '../felles/util';
import { getSystemdata } from '../selectors';

export function* schedulePollSesjon(vindu = window) {
    yield put(startPollingAvSesjon());
    while (true) {
        yield put(sjekkSesjon());
        const systemdata = yield select(getSystemdata);
        const { response, error } = yield call(fetch, systemdata.ssoUrl);
        if (error || (!response.expiration) || (response.expiration === 1) || (response.expiration === '1')) {
            yield put(sesjonUtloept());
            vindu.location = systemdata.ssoLogoutUrl;
        }
        yield call(delay, 1000 * 60);
    }
}

export function* loggUt(vindu = window) {
    const systemdata = yield select(getSystemdata);
    vindu.location = systemdata.ssoLogoutUrl;
}

export default function* sesjonSaga(vindu = window) {
    yield [call(schedulePollSesjon, vindu), takeLatest(LOGG_UT, loggUt, vindu)];
}
