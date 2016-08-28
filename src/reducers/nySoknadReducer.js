import {
    ENDRE_POST,
    LEGG_TIL_POST,
    FJERN_POST,
    FJERN_POSTER,
} from '../actions';
import { ENDRE_HITTIL_FELT, MOTTA_OVERSIKT, BYTT_SKATTYTER } from '../actions';
import findIndex from 'lodash/findIndex';
import cloneDeep from 'lodash/cloneDeep';
import {
    byggRelatertePoster,
    relaterteSkatteobjektstyperSomKanFjernes,
    leggPaaSjekkboksdata,
} from '../felles/PostUtils';
import {
    nyListeMedEndretNyttObjektPaaIndex,
    beregnesFraMaaned,
    immutableReplaceAtIndex,
} from '../felles/util';
import { SKATTEOBJEKTSTYPER_SOM_KAN_FOREKOMME_FLERE_GANGER_I_PROGNOSE, FRADRAGSBERETTIGETE_NAERINGSTYPER } from '../felles/Konstanter';
import { byggNyPost } from './nyePoster';
import intersection from 'lodash/intersection';
import { Poster } from '../felles/postliste';

const initiellNySoknad = (type, aktiv, initiellPrognose) => {
    return { skattegrunnlagsobjekter: initiellPrognose, aktiv, type, hittilIAar: { beregnesFraMaaned: beregnesFraMaaned() } };
};

function endreHittilFelt(state, { skatteobjektstype, beloep }) {
    return Object.assign({}, state, {hittilIAar: Object.assign({}, state.hittilIAar, {[skatteobjektstype]: beloep})});
}

function mottaOversikt(state, payload) {
    const { soknad, gjeldende } = payload.data;
    let poster = soknad ? [...soknad.prognose] : [...gjeldende.prognose];

    const harFradragsberettigetNaering = intersection(poster.map(x => x.skatteobjektstype), FRADRAGSBERETTIGETE_NAERINGSTYPER).length > 0;
    const harPersoninntektForNaering = intersection(poster.map(x => x.skatteobjektstype), [Poster.personinntektAnnenNaeringUspesifisert, Poster.personinntektFiskerOgFangstmannUspesifisert]).length > 0;
    const manglerInntektNaeringAnnenNaering = !poster.find(x => x.skatteobjektstype === Poster.inntektNaeringAnnenNaering);
    if ((harFradragsberettigetNaering || harPersoninntektForNaering) && manglerInntektNaeringAnnenNaering) {
        poster.push(byggNyPost(Poster.inntektNaeringAnnenNaering, Poster.inntektNaeringAnnenNaering));
    }

    poster = poster.map((post, i) => Object.assign({}, post, { id: post.skatteobjektstype + '-' + i }));

    const hittilIAar = (soknad && soknad.hittilIAar) || {};
    hittilIAar.beregnesFraMaaned = beregnesFraMaaned();

    return Object.assign({}, state, {
        skattegrunnlagsobjekter: [...poster, ...byggRelatertePoster(poster)].map(leggPaaSjekkboksdata),
        hittilIAar,
    });
}

function endrePost(state, payload) {
    const index = findIndex(state.skattegrunnlagsobjekter, x => x.id === payload.id);
    return Object.assign({}, state, {
        skattegrunnlagsobjekter: nyListeMedEndretNyttObjektPaaIndex(state.skattegrunnlagsobjekter, index, payload),
    });
}

function fjernPost(state, payload) {
    const sType = state.skattegrunnlagsobjekter.find(x => x.id === payload.post.id).skatteobjektstype;

    const antall = state.skattegrunnlagsobjekter.reduce((prev, x) => x.skatteobjektstype === sType ? prev + 1 : prev, 0);

    const typerSomKanFjernes = antall === 1 ? relaterteSkatteobjektstyperSomKanFjernes(state.skattegrunnlagsobjekter, sType) : [];

    if (sType === Poster.inntektNaeringAnnenNaering) {
        typerSomKanFjernes.push(Poster.personinntektAnnenNaeringUspesifisert, Poster.personinntektFiskerOgFangstmannUspesifisert, Poster.inntektsfradragJordbruksfradrag);
    }

    return Object.assign({}, state, {
        skattegrunnlagsobjekter: state.skattegrunnlagsobjekter.filter(x => {
            return !(x.id === payload.post.id || typerSomKanFjernes.includes(x.skatteobjektstype));
        }),
    });
}

function fjernPoster(state, { skatteobjektstype }) {
    const kanFjernes = [skatteobjektstype, ...relaterteSkatteobjektstyperSomKanFjernes(state.skattegrunnlagsobjekter, skatteobjektstype)];

    const nyListe = state.skattegrunnlagsobjekter.filter(x => !kanFjernes.includes(x.skatteobjektstype));

    return Object.assign({}, state, {
        skattegrunnlagsobjekter: nyListe,
    });
}

function leggTilPost(state, payload) {
    const { skatteobjektstype, id } = payload;

    const finnesFraFoer = state.skattegrunnlagsobjekter.map(x => x.skatteobjektstype).includes(skatteobjektstype);
    const kanForekommeFlereGanger = SKATTEOBJEKTSTYPER_SOM_KAN_FOREKOMME_FLERE_GANGER_I_PROGNOSE.includes(skatteobjektstype);

    if (finnesFraFoer && !kanForekommeFlereGanger) {
        return state;
    }

    const nyPost = byggNyPost(skatteobjektstype, id);

    const nyePoster = [nyPost, ...byggRelatertePoster([nyPost, ...state.skattegrunnlagsobjekter])].map(leggPaaSjekkboksdata);
    const skattegrunnlagsobjekter = [...state.skattegrunnlagsobjekter, ...nyePoster];

    const nyState = {
        skattegrunnlagsobjekter,
    };

    if (skatteobjektstype === Poster.inntektPensjonAlderspensjonFolketrygd) {
        const index = findIndex(skattegrunnlagsobjekter, x => x.skatteobjektstype === Poster.inntektPensjonAvtalefestet);
        if (index > -1) {
            const nyAfp = cloneDeep(skattegrunnlagsobjekter[index]);
            delete nyAfp.antallMaaneder;
            delete nyAfp.pensjonsgrad;
            nyState.skattegrunnlagsobjekter = immutableReplaceAtIndex(nyState.skattegrunnlagsobjekter, index, nyAfp);
        }

        const i2 = findIndex(skattegrunnlagsobjekter, x => x.skatteobjektstype === Poster.inntektPensjonSupplerendeStoenad);
        if (i2 > -1) {
            const nySuppl = cloneDeep(skattegrunnlagsobjekter[i2]);
            delete nySuppl.antallMaaneder;
            nyState.skattegrunnlagsobjekter = immutableReplaceAtIndex(nyState.skattegrunnlagsobjekter, i2, nySuppl);
        }
    }

    return Object.assign({}, state, nyState);
}

function nySoknadReducer(state, { type, payload }) {
    if (type === BYTT_SKATTYTER) {
        return Object.assign({}, state, { aktiv: payload === state.type});
    }

    if (!state.aktiv) {
        return state;
    }

    switch (type) {
    case LEGG_TIL_POST:
        return leggTilPost(state, payload);
    case FJERN_POSTER:
        return fjernPoster(state, payload);
    case FJERN_POST:
        return fjernPost(state, payload);
    case ENDRE_POST:
        return endrePost(state, payload);
    case MOTTA_OVERSIKT:
        return mottaOversikt(state, payload);
    case ENDRE_HITTIL_FELT:
        return endreHittilFelt(state, payload);
    default:
        return state;
    }
}

export default function(type, aktiv, initiellPrognose = []) {
    return (state = initiellNySoknad(type, aktiv, initiellPrognose), action) => nySoknadReducer(state, action);
}
