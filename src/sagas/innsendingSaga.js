import { takeLatest } from 'redux-saga';
import { put, call, select } from 'redux-saga/effects';
import { SEND_INN, sendInn, innsendt, innsendingFeilet, mottaNyPrognose, lagNyPrognose } from '../actions';
import { roturl, post as ajaxPost } from '../felles/ajax';
import Piwik from '../felles/Piwik';
import altinn from '../felles/altinn';
import { byggSoknadsdata } from './beregningSaga';
import store from '../store';
import { getAktivReportee } from '../selectors';
import { hashHistory } from 'react-router';
import { refreshMeldingsboks } from './altinn';

function* innsending() {
    const data = byggSoknadsdata(yield select());
    const aktivReportee = yield select(getAktivReportee);
    yield put(lagNyPrognose(aktivReportee, data));
    const { response, error } = yield call(ajaxPost, roturl + '/minskatteside/forberedInnsending', data);
    if (response) {
        const altinnResponse = yield call(altinn.sendInnSkjema, aktivReportee.reporteeId, response.vedleggXML);
        if (altinnResponse.arId) {
            yield put(innsendt(altinnResponse.arId));
            yield call(hashHistory.replace, '/kvittering');
            yield put(mottaNyPrognose(aktivReportee, response));
            yield call(Piwik.event.log, Piwik.event.SEND_INN_SOKNAD, altinnResponse.arId);
            yield call(ajaxPost, roturl + '/minskatteside/innsending/' + altinnResponse.arId);
            yield call(refreshMeldingsboks);
        } else if (altinnResponse.error) {
            yield put(innsendingFeilet(error, sendInn));
        }
    } else if (error) {
        yield put(innsendingFeilet(error, sendInn, store.dispatch));
    }
}

export default function* innsendingSaga() {
    yield* takeLatest(SEND_INN, innsending);
}
