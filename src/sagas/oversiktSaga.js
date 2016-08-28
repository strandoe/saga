import { takeEvery } from 'redux-saga';
import { put, call, select } from 'redux-saga/effects';
import { get as fetch, roturl } from '../felles/ajax';
import { HENT_OVERSIKT, mottaOversikt, hentOversiktFeilet, navigerEksternt, KONTEKST_NAVIGER_EKSTERNT } from '../actions';
import Piwik from '../felles/Piwik';
import { responseRutTilFoi } from '../felles/util';
import { generateCidFromOptionalXhr } from '../felles/Log';
import { getSystemdata } from '../selectors';

export function* hentOversikt(action) {
    const { payload: reportee } = action;
    const { response, error } = yield call(fetch, roturl + '/minskatteside/oversikt/' + reportee.id);

    if (response) {
        yield call(Piwik.setKommune, response.skattesubjekt.skatteKommune);
        yield put(mottaOversikt(reportee, response));
    }

    if (error) {
        const { xhr } = error;
        const cid = generateCidFromOptionalXhr(xhr);

        if (responseRutTilFoi(xhr)) {
            const systemdata = yield select(getSystemdata);
            yield put(navigerEksternt({
                url: systemdata.foiUrl,
                kontekst: KONTEKST_NAVIGER_EKSTERNT.gammelLoesning.ikkePilotbruker,
            }));
        } else {
            yield put(hentOversiktFeilet(error, cid));
        }
    }
}

export default function* () {
    yield* takeEvery(HENT_OVERSIKT, hentOversikt);
}
