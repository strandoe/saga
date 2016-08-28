import { put, call, take, select } from 'redux-saga/effects';
import { get as fetch, roturl } from '../felles/ajax';
import altinn from '../felles/altinn';
import {sha256} from 'js-sha256';
import { generateCid, generateCidFromOptionalXhr } from '../felles/Log';
import { getQueryParameterByName } from '../felles/util';
import tekster from '../felles/tekster';
import persistentVisitorId from '../lib/persistentVisitorId';
import {
    LOGG_INN,
    loggInn,
    hentSystemdata,
    mottaSystemdata,
    hentSystemdataFeilet,
    loggInnAltinn,
    autentiser,
    autentisert,
    autentiserFeilet,
    hentReportees,
    mottaReportees,
    hentReporteesFeilet,
    feil,
    innlogget,
    slettFeil,
    sjekkNettleser,
    settBrukerId,
    nettleserIkkeStoettet,
    navigerEksternt,
    initPiwik,
    KONTEKST_NAVIGER_EKSTERNT,
} from '../actions';
import store from '../store';
import { url } from '../felles/Konstanter';
import bowser from 'bowser';
import { getSystemdata, getInnloggetBruker, getReportees, getFeil, getBrukerId } from '../selectors';
import { erLocalhost } from '../config';

export function* stegHentSystemdata() {
    yield put(hentSystemdata());
    const {response, error} = yield call(fetch, roturl + '/system');
    if (!error) {
        yield put(mottaSystemdata(response));
    } else {
        yield put(hentSystemdataFeilet(error, generateCidFromOptionalXhr(error.xhr)));
        yield Promise.reject(error);
    }
}

export function* stegLoggInnAltinn(systemdata) {
    yield put(loggInnAltinn());
    yield altinn.forceAuthPromise(systemdata);
}

export function* stegAutentiser() {
    yield put(autentiser());
    const {response, error} = yield call(fetch, roturl + '/autentisering');
    if (!error) {
        const bruker = response.bruker;
        const innloggetBruker = {innlogget: {id: bruker}, reportee: {id: bruker}};
        const brukerId = sha256(bruker);
        const systemdata = yield select(getSystemdata);
        yield put(initPiwik(systemdata.piwikUrl, brukerId));
        yield put(settBrukerId(brukerId));
        yield put(autentisert(innloggetBruker));
    } else {
        yield put(autentiserFeilet(error, generateCidFromOptionalXhr(error.xhr)));
        yield Promise.reject(error);
    }
}

export function slettFeilOgLoggInnPaaNytt(feilId) {
    return () => {
        store.dispatch(slettFeil(feilId));
        store.dispatch(loggInn());
    };
}

export function dispatchGaaTilGammelLoesning() {
    return () => {
        store.dispatch(navigerEksternt({
            url: getSystemdata(store.getState()).foiUrl,
            nyttVindu: false,
            delayMs: 1000,
            kontekst: KONTEKST_NAVIGER_EKSTERNT.gammelLoesning.innloggingsfeil,
        }));
    };
}

export const handlingGaaTilFoi = {
    tittel: tekster.get('gaaTilGammelTjeneste'),
    onClick: dispatchGaaTilGammelLoesning(),
};

export function handlingSlettFeilOgLoggInnPaaNytt(feilId) {
    return {
        tittel: tekster.get('feil.innlogging.feilet.retry'),
        onClick: slettFeilOgLoggInnPaaNytt(feilId),
    };
}

function generellInnloggingsFeil({retry = true, feilId = generateCid(), brukerId}) {
    const handlinger = [handlingGaaTilFoi];
    if (retry) {
        handlinger.unshift(handlingSlettFeilOgLoggInnPaaNytt(feilId));
    }
    return feil(
        feilId,
        brukerId || persistentVisitorId(),
        tekster.get('feil.innlogging.feilet.tittel'),
        tekster.get('feil.innlogging.feilet.melding'),
        handlinger,
        'fatal'
    );
}

function nettleserIkkeStoettetFeil() {
    return feil(
        generateCid(),
        persistentVisitorId(),
        tekster.get('feil.browser.overskrift'),
        tekster.get('feil.browser.melding'),
        [handlingGaaTilFoi],
        'fatal'
    );
}

function reporteesFeilet({feilId = generateCid(), brukerId}) {
    return feil(
        feilId,
        brukerId || persistentVisitorId(),
        tekster.get('feil.innlogging.reportees.tittel'),
        tekster.get('feil.innlogging.reportees.melding'),
        [handlingGaaTilFoi],
        'fatal'
    );
}

export function* stegHentReportees(innloggetBruker, altinnApi = altinn, vindu = window) {
    yield put(hentReportees());
    const {response, error} = yield call(altinnApi.hentReportees, null, 2);

    if (error) {
        const feilId = generateCid();
        if (getQueryParameterByName('sofusCookieFix', vindu.location) === 'true') {
            yield put(hentReporteesFeilet(feilId, error));
            yield put(reporteesFeilet({ feilId }));
        } else if (!erLocalhost()) {
            yield put(navigerEksternt({ url: url.altinnCookieFix }));
        }
        yield Promise.reject(error);
    }

    const reportees = response.map(reportee => {
        return { id: reportee.SocialSecurityNumber, name: reportee.Name, reporteeId: reportee.ReporteeId };
    });

    const innloggetFnr = innloggetBruker.innlogget.id;
    const innloggetReportee = reportees.find(reportee => {
        return reportee.id === '' + innloggetFnr;
    });

    if (innloggetReportee) {
        yield put(mottaReportees(reportees));
    } else {
        const msg = `Fant ikke ${innloggetFnr} i listen av reportees ${reportees.map(x => `[id:${x.id} name:${x.name} reporteeId:${x.reporteeId}]`).join(',')}`;
        const feilId = generateCid();
        yield put(hentReporteesFeilet(feilId, msg));
        yield put(generellInnloggingsFeil({retry: false, feilId, brukerId: yield select(getBrukerId)}));
        yield Promise.reject(new Error(msg));
    }
}

export function* sjekkBrowser(nettleser = bowser) {
    yield put(sjekkNettleser(nettleser.name, nettleser.version));
    if (!nettleser.a) {
        const error = new Error('Ikke støttet nettleser');
        yield put(nettleserIkkeStoettet(error, nettleser.name, nettleser.version));
        yield put(nettleserIkkeStoettetFeil());
        yield Promise.reject(error);
    }
}

export default function* () {
    while (true) {
        try {
            yield take(LOGG_INN);

            yield call(stegHentSystemdata);
            yield call(sjekkBrowser);

            const systemdata = yield select(getSystemdata);
            yield call(stegLoggInnAltinn, systemdata);

            yield call(stegAutentiser);

            const innloggetBruker = yield select(getInnloggetBruker);
            yield call(stegHentReportees, innloggetBruker);

            const reportees = yield select(getReportees);
            yield put(innlogget(innloggetBruker, reportees));
        } catch (error) {
            const feilene = yield select(getFeil);
            const ingenAvStegeneHarProdusertEnFeil = feilene.length === 0;
            if (ingenAvStegeneHarProdusertEnFeil) {
                const brukerId = yield select(getBrukerId);
                yield put(generellInnloggingsFeil({ brukerId }));
            }
        }
    }
}
