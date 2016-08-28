import cloneDeep from 'lodash/cloneDeep';
import {
    LEGG_TIL_POST,
    TOGGLE_REDIGERINGSMODUS,
} from '../actions';
import {
    MOTTA_OVERSIKT,
} from '../actions';
import {
    REISEFRADRAGSTYPER,
    FRADRAGSBERETTIGETE_NAERINGSTYPER,
} from '../felles/Konstanter';
import { composeReducers } from '../felles/util';

function mottaOversikt(state = {}, action) {
    if (action.type !== MOTTA_OVERSIKT) {
        return state;
    }
    const { soknad, gjeldende } = action.payload.data;
    const aktivPrognose = soknad ? soknad.prognose : gjeldende.prognose;
    if (!Array.isArray(aktivPrognose)) {
        return state;
    }
    const harNaeringMedRettTilFradrag = aktivPrognose.some(post =>
        FRADRAGSBERETTIGETE_NAERINGSTYPER.includes(post.skatteobjektstype)
    );
    if (harNaeringMedRettTilFradrag) {
        return Object.assign({}, state, { harNaeringMedRettTilFradrag: true });
    }
    return state;
}

function leggTilPost(state = {}, { payload, type }) {
    if (type !== LEGG_TIL_POST) {
        return state;
    }
    if (REISEFRADRAGSTYPER.includes(payload.skatteobjektstype)) {
        return Object.assign({}, state, {[payload.skatteobjektstype]: true});
    }
    return Object.assign({}, state, {[payload.id]: true});
}

function toggleRedigeringsmodus(state = {}, { payload, type }) {
    if (type !== TOGGLE_REDIGERINGSMODUS) {
        return state;
    }
    const nyState = cloneDeep(state);
    if (nyState[payload.id]) {
        delete nyState[payload.id];
    } else {
        nyState[payload.id] = true;
    }
    return nyState;
}

export const redigeringsmodus = composeReducers({}, mottaOversikt, leggTilPost, toggleRedigeringsmodus);
