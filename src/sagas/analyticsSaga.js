import { takeLatest, takeEvery } from 'redux-saga';
import { call, select } from 'redux-saga/effects';
import { LAG_SKATTESUBJEKT, BYTT_SKATTYTER, INIT_PIWIK, ENDRE_POST, LEGG_TIL_POST, FJERN_POST, FJERN_POSTER, TOGGLE_HJELP, ENDRE_HITTIL_FELT, HENT_REPORTEES_FEILET, NAVIGER_EKSTERNT } from '../actions';
import { delay } from '../felles/util';
import Piwik from '../felles/Piwik';
import tekster from '../felles/tekster';
import { getVisHjelp, getSystemdata } from '../selectors';

function* endrePost({ payload }) {
    yield call(delay, 1000);
    yield call(Piwik.event.log, Piwik.event.ENDRE_VERDI, tekster.get(payload.skatteobjektstype));
}

function* leggTilPost({ payload }) {
    yield call(Piwik.event.log, Piwik.event.LEGG_TIL_POST, tekster.get(payload.skatteobjektstype));
}

function* fjernPost({ payload }) {
    yield call(Piwik.event.log, Piwik.event.SLETT_POST, tekster.get(payload.post.skatteobjektstype));
}

function* fjernPoster({ payload }) {
    yield call(Piwik.event.log, Piwik.event.SLETT_POST, tekster.get(payload.skatteobjektstype));
}

const hjelpetekstTimer = {};

function* toggleHjelp({ payload }) {
    const visHjelp = yield select(getVisHjelp);
    if (!visHjelp[payload.id]) {
        const lukketEtter = Math.ceil((new Date().getTime() - hjelpetekstTimer[payload.id]) / 1000);
        const tidVist = `Lukket etter ${lukketEtter} sekunder`;
        yield call(Piwik.event.log, Piwik.event.LUKK_HJELPETEKST, tekster.get(payload.skatteobjektstype), tidVist);
    } else {
        hjelpetekstTimer[payload.id] = new Date().getTime();
        yield call(Piwik.event.log, Piwik.event.VIS_HJELPETEKST, tekster.get(payload.skatteobjektstype));
    }
}

function* trackHentReporteesFeilet() {
    yield call(Piwik.event.log, Piwik.event.HENT_REPORTEES_FEILET);
}

function* trackEksternNavigasjon({ payload: { url }, meta: { kontekst } }) {
    const { foiUrl } = yield select(getSystemdata);
    switch (url) {
    case foiUrl:
        yield call(Piwik.event.log, Piwik.event.NAVIGER_TIL_FOI, kontekst);
        break;
    default:
    }
}

function* byttSkattyter({ payload }) {
    yield call(Piwik.event.log, Piwik.event.BYTT_SKATTYTER, payload);
}

function* lagSkattesubjekt({ payload: { sivilstand, kommune } }) {
    yield call(Piwik.event.log, Piwik.event.VELGER_SKATTYTER, sivilstand);
    if (kommune !== null) {
        yield call(Piwik.event.log, Piwik.event.VELGER_FINNMARKSFRADRAG, 'Oh yeah');
    }
}

function* initPiwik({ payload: { siteUrl, brukerId } }) {
    yield call(Piwik.initialize, siteUrl);
    if (brukerId !== null) {
        yield call(Piwik.setUserId, brukerId);
    }
    yield call(Piwik.event.log, Piwik.event.APP_START, brukerId);
}

export default function* analyticsSaga() {
    yield [
        takeEvery(INIT_PIWIK, initPiwik),
        takeLatest([ENDRE_POST, ENDRE_HITTIL_FELT], endrePost),
        takeEvery(LEGG_TIL_POST, leggTilPost),
        takeEvery(FJERN_POST, fjernPost),
        takeEvery(FJERN_POSTER, fjernPoster),
        takeEvery(TOGGLE_HJELP, toggleHjelp),
        takeLatest(HENT_REPORTEES_FEILET, trackHentReporteesFeilet),
        takeLatest(NAVIGER_EKSTERNT, trackEksternNavigasjon),
        takeEvery(BYTT_SKATTYTER, byttSkattyter),
        takeEvery(LAG_SKATTESUBJEKT, lagSkattesubjekt),
    ];
}
