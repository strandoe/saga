import { takeLatest } from 'redux-saga';
import { call, put, select } from 'redux-saga/effects';
import { ENDRE_POST, ENDRE_HITTIL_FELT, LEGG_TIL_POST, FJERN_POSTER, FJERN_POST, endrePostUtenDelay, mottaNyOversikt, lagNyOversiktFeilet, lagNyOversikt } from '../actions';
import { delay } from '../felles/util';
import { post as ajaxPost, roturl, roturlKalkulator } from '../felles/ajax';
import { vaskSkattegrunnlagsobjekterForBeregningOgInnsending, vaskHittilIAar } from '../felles/PostUtils';
import { generateCidFromOptionalXhr } from '../felles/Log';
import store from '../store';
import { erPaaloggetLoesning } from '../config';
import { getSkattesubjekt, getSkattesubjektEF } from '../selectors';

export function byggSoknadsdata(state) {
    const data = {
        skattyter: getSkattesubjekt(state),
        soknad: {
            hittilIAar: vaskHittilIAar(state.nySoknad.hittilIAar),
            skattegrunnlagsobjekter: vaskSkattegrunnlagsobjekterForBeregningOgInnsending(state.nySoknad.skattegrunnlagsobjekter),
        },
        gjeldendeForskudd: state.gjeldende.forskudd,
    };

    const skattyterEktefelle = getSkattesubjektEF(state);

    if (skattyterEktefelle) {
        data.skattyterEktefelle = skattyterEktefelle;
        data.soknadEktefelle = {
            hittilIAar: vaskHittilIAar(state.nySoknadEktefelle.hittilIAar),
            skattegrunnlagsobjekter: vaskSkattegrunnlagsobjekterForBeregningOgInnsending(state.nySoknadEktefelle.skattegrunnlagsobjekter),
        };
    }

    return data;
}

export function* beregn({ payload, meta }) {
    if (meta && meta.delay) {
        yield call(delay, meta.delay);
    }
    const paaloggetUrl = roturl + '/minskatteside/beregn';
    const aapenUrl = roturlKalkulator + '/beregn';
    const url = erPaaloggetLoesning() ? paaloggetUrl : aapenUrl;
    const data = byggSoknadsdata(yield select());
    yield put(lagNyOversikt(data));
    const { response, error } = yield call(ajaxPost, url, data);
    if (response) {
        yield put(mottaNyOversikt(response));
    } else if (error) {
        const feilId = generateCidFromOptionalXhr(error.xhr);
        yield put(lagNyOversiktFeilet(
            error,
            endrePostUtenDelay.bind(null, payload),
            store.dispatch,
            feilId
        ));
    }
}

export default function* watchEndrePost() {
    yield* takeLatest([ENDRE_POST, ENDRE_HITTIL_FELT, LEGG_TIL_POST, FJERN_POSTER, FJERN_POST], beregn);
}
