import cloneDeep from 'lodash/cloneDeep';
import { combineReducers } from 'redux';

import {
    INNLOGGET,
    MOTTA_ALTINN_MELDINGER,
    MOTTA_SYSTEMDATA,
    MOTTA_REPORTEES,
    AUTENTISERT,
    MOTTA_OVERSIKT,
    HENT_OVERSIKT_FEILET,
    MOTTA_NY_OVERSIKT,
    TOGGLE_HJELP,
    TOGGLE_POSTVELGER,
    SEND_INN,
    INNSENDT,
    MOTTA_NY_PROGNOSE,
    BYTT_SKATTYTER,
    MOTTA_SKATTESUBJEKT,
    SETT_BRUKER_ID,
    EKSTERN_NAVIGASJON_START,
    INNSENDING_FEILET,
    TOGGLE_SYNLIG,
} from '../actions';

import {
    POSTGRUPPER,
    TILSTAND_INNSENDING_STARTET,
    TILSTAND_INNSENDING_FERDIG,
    TILSTAND_INNSENDING_FEILET,
    TILSTAND_HENT_OVERSIKT_FEILET,
    TILSTAND_HENT_OVERSIKT_FERDIG,
    TILSTAND_INNLOGGET,
    INITIELL_PROGNOSE_SKATTEKALKULATOR,
}
from '../felles/Konstanter';
import byggNySoknadReducer from './nySoknadReducer';
import feil from './feilReducer';
import { redigeringsmodus } from './redigeringsmodusReducer';
import { erAapenLoesning } from '../config';

function gjeldendeReducer(state = {}, action) {
    switch (action.type) {
    case MOTTA_OVERSIKT:
        return action.payload.data.gjeldende;
    default:
        return state;
    }
}

function soknadReducer(state = null, action) {
    switch (action.type) {
    case MOTTA_OVERSIKT:
        return action.payload.data.soknad || state;

    case MOTTA_NY_PROGNOSE:
        return Object.assign({}, state, {
            prognose: action.data.oversikt.prognose,
            forskudd: action.data.oversikt.forskudd,
            beregnetSkatt: action.data.oversikt.beregnetSkatt,
        });

    case INNSENDT:
        return Object.assign({}, state, {
            altinnreferanse: action.payload.referanse,
            opprettetTidspunkt: action.payload.opprettetTidspunkt,
            innsendtIDenneSesjonen: true,
        });
    default:
        return state;
    }
}

function skattesubjekt(state = null, action) {
    switch (action.type) {
    case MOTTA_OVERSIKT:
        return action.payload.data.skattesubjekt || state;
    case MOTTA_SKATTESUBJEKT:
        return action.payload.skattesubjekt;
    default:
        return state;
    }
}

function skattesubjektEF(state = null, action) {
    switch (action.type) {
    case MOTTA_SKATTESUBJEKT:
        return action.payload.skattesubjektEF || null;
    default:
        return state;
    }
}

function beregnetSkatt(state = null, action) {
    switch (action.type) {
    case MOTTA_OVERSIKT:
        if (action.payload.data.soknad) {
            return Object.assign({}, state, action.payload.data.soknad.beregnetSkatt);
        }
        return Object.assign({}, state, action.payload.data.gjeldende.beregnetSkatt);
    case MOTTA_NY_OVERSIKT:
        return Object.assign({}, state, action.payload.beregnetSkatt);
    default:
        return state;
    }
}

function beregnetSkattEktefelle(state = null, action) {
    switch (action.type) {
    case MOTTA_OVERSIKT:
        if (action.payload.data.soknad) {
            return Object.assign({}, state, action.payload.data.soknad.beregnetSkattEktefelle);
        }
        return Object.assign({}, state, action.payload.data.gjeldende.beregnetSkattEktefelle);
    case MOTTA_NY_OVERSIKT:
        return Object.assign({}, state, action.payload.beregnetSkattEktefelle);
    default:
        return state;
    }
}

function forskudd(state = null, action) {
    switch (action.type) {
    case MOTTA_NY_OVERSIKT:
        return Object.assign({}, state, action.payload.forskudd);
    default:
        return state;
    }
}

function validering(state = [], action) {
    switch (action.type) {
    case MOTTA_NY_OVERSIKT:
        return [...action.payload.validering];
    default:
        return state;
    }
}

function tilstand(state = {}, action) {
    switch (action.type) {
    case MOTTA_OVERSIKT:
        return Object.assign({}, state, { oversikt: TILSTAND_HENT_OVERSIKT_FERDIG });
    case SEND_INN:
        return Object.assign({}, state, { innsending: TILSTAND_INNSENDING_STARTET });
    case INNSENDT:
        return Object.assign({}, state, { innsending: TILSTAND_INNSENDING_FERDIG });
    case INNSENDING_FEILET:
        return Object.assign({}, state, { innsending: TILSTAND_INNSENDING_FEILET });
    case HENT_OVERSIKT_FEILET:
        return Object.assign({}, state, { oversikt: TILSTAND_HENT_OVERSIKT_FEILET });
    case INNLOGGET:
        return Object.assign({}, state, { innlogging: TILSTAND_INNLOGGET });
    default:
        return state;
    }
}

function visHjelp(state = {}, { payload, type }) {
    switch (type) {
    case TOGGLE_HJELP:
        const nyState = cloneDeep(state);
        if (nyState[payload.id]) {
            delete nyState[payload.id];
        } else {
            nyState[payload.id] = true;
        }
        return nyState;
    default:
        return state;
    }
}

const INITIELLE_POSTVELGERE = [
    { id: POSTGRUPPER.inntekt, aapen: false },
    { id: POSTGRUPPER.fradrag, aapen: false },
    { id: POSTGRUPPER.formueOgGjeld, aapen: false },
];

function postvelgere(state = INITIELLE_POSTVELGERE, { payload, type }) {
    switch (type) {
    case TOGGLE_POSTVELGER:
        return state.map(p => p.id === payload.id ? Object.assign({}, p, { aapen: !p.aapen }) : p);
    default:
        return state;
    }
}

function innloggetBruker(state = null, action) {
    switch (action.type) {
    case AUTENTISERT:
        return Object.assign({}, action.payload);
    case MOTTA_REPORTEES:
        const innloggetFnr = state.innlogget.id;
        const valgtReportee = action.payload.find(reportee => {
            return reportee.id === '' + innloggetFnr;
        });
        return {
            innlogget: valgtReportee,
            reportee: valgtReportee,
        };
    default:
        return state;
    }
}

function reportees(state = [], action) {
    switch (action.type) {
    case MOTTA_REPORTEES:
        return [...action.payload];
    default:
        return state;
    }
}

function aktivReportee(state = null, action) {
    switch (action.type) {
    case INNLOGGET:
        return Object.assign({}, action.payload.reportees.filter(r => r.id === action.payload.innloggetBruker.innlogget.id)[0]);
    default:
        return state;
    }
}

function altinnMeldinger(state = [], action) {
    switch (action.type) {
    case MOTTA_ALTINN_MELDINGER:
        return [...action.payload];
    default:
        return state;
    }
}

function systemdata(state = {}, action) {
    switch (action.type) {
    case MOTTA_SYSTEMDATA:
        return Object.assign({}, state, action.payload);
    default:
        return state;
    }
}

function aktivSkattyter(state = 'hoved', { type, payload}) {
    switch (type) {
    case BYTT_SKATTYTER:
        return payload;
    default:
        return state;
    }
}

function brukerId(state = null, { type, payload }) {
    switch (type) {
    case SETT_BRUKER_ID:
        return payload;
    default:
        return state;
    }
}

function eksternNavigasjon(state = {}, { type }) {
    switch (type) {
    case EKSTERN_NAVIGASJON_START:
        return Object.assign({}, state, { underveis: true });
    default:
        return state;
    }
}

function synlig(state = {'grunnlag.toppmelding': true }, { type, key, synlig: s }) {
    switch (type) {
    case TOGGLE_SYNLIG:
        return Object.assign({}, state, { [key]: s !== undefined ? s : !state[key]});
    default:
        return state;
    }
}

function gui(state = {}, action) {
    switch (action.type) {
    case MOTTA_NY_OVERSIKT:
        return Object.assign({}, state, { shakeBeregning: state.shakeBeregning === undefined});
    default:
        return state;
    }
}

const initiellPrognose = erAapenLoesning() ? INITIELL_PROGNOSE_SKATTEKALKULATOR : [];

const rootReducer = combineReducers({
    gjeldende: gjeldendeReducer,
    soknad: soknadReducer,
    skattesubjekt,
    skattesubjektEF,
    nySoknad: byggNySoknadReducer('hoved', true, initiellPrognose),
    nySoknadEktefelle: byggNySoknadReducer('ektefelle', false, initiellPrognose),
    beregnetSkatt,
    beregnetSkattEktefelle,
    validering,
    tilstand,
    forskudd,
    visHjelp,
    redigeringsmodus,
    postvelgere,
    innloggetBruker,
    reportees,
    aktivReportee,
    altinnMeldinger,
    systemdata,
    feil,
    aktivSkattyter,
    brukerId,
    eksternNavigasjon,
    synlig,
    gui,
});

export default rootReducer;
