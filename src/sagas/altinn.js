import { takeLatest } from 'redux-saga';
import { put, call, select, take } from 'redux-saga/effects';
import {
    HENT_ALTINN_MELDINGER,
    MOTTA_ALTINN_MELDINGER,
    mottaAltinnMeldinger,
    hentAltinnMeldingerFeilet,
    startPollingAvMeldingerFraAltinn,
} from '../actions';
import altinn from '../felles/altinn';
import isUndefined from 'lodash/isUndefined';
import { delay } from '../felles/util';
import { getAktivReportee, getAltinnMeldinger } from '../selectors';

function getNumNyesteMeldinger(response, num) {
    const jsonResp = isUndefined(response._embedded) ? JSON.parse(response) : response;
    return jsonResp._embedded.messages.slice(0, num);
}

export function* hent() {
    const aktivReportee = yield select(getAktivReportee);
    const { response, error } = yield call(altinn.hentAltinnMeldinger, aktivReportee.reporteeId);

    if (response) {
        yield put(mottaAltinnMeldinger(getNumNyesteMeldinger(response, 5)));
    } else if (error) {
        yield put(hentAltinnMeldingerFeilet(error));
    }
}

export function* schedulePollAltinnMeldingsboks() {
    yield put(startPollingAvMeldingerFraAltinn());
    const femMinutter = 5 * 60 * 1000;
    while (true) {
        yield call(hent);
        yield call(delay, femMinutter);
    }
}

const defaultConfig = { initialDelay: 1000, numTries: 4, increaseDelayByFactor: 2 };
export function* refreshMeldingsboks(config = {}) {
    const { initialDelay, numTries, increaseDelayByFactor } = Object.assign({}, defaultConfig, config);
    let forrigeMeldinger = yield select(getAltinnMeldinger);
    let nyeMeldinger = forrigeMeldinger;
    let currentTry = 1;
    let delayMs = initialDelay;

    while (nyeMeldinger.length === forrigeMeldinger.length) {
        if (currentTry > numTries) {
            break;
        }

        yield call(delay, delayMs);
        yield call(hent);
        yield take(MOTTA_ALTINN_MELDINGER);

        forrigeMeldinger = nyeMeldinger;
        nyeMeldinger = yield select(getAltinnMeldinger);
        delayMs = delayMs * increaseDelayByFactor;
        currentTry = currentTry + 1;
    }
}

export default function* () {
    yield [
        takeLatest(HENT_ALTINN_MELDINGER, hent),
        call(schedulePollAltinnMeldingsboks),
    ];
}
