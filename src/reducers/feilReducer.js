import { HENT_OVERSIKT_FEILET, LAG_NY_OVERSIKT_FEILET, FEIL, SLETT_FEIL, INNSENDING_FEILET } from '../actions';

import tekster from '../felles/tekster';
import { gaaTilFoi } from '../actions/felles';

const handlingGaaTilFoi = {
    tittel: tekster.get('gaaTilGammelTjeneste'),
    onClick: () => gaaTilFoi(),
};

export default function feil(state = [], action) {
    switch (action.type) {
    case FEIL:
        const { id, brukerId, tittel, melding, handlinger, alvorlighet } = action.payload;
        return [{
            id,
            brukerId,
            tittel,
            melding,
            handlinger,
            alvorlighet,
        }, ...state];
    case SLETT_FEIL:
        return state.filter(x => x.id !== action.payload);
    case HENT_OVERSIKT_FEILET:
        return [{
            id: action.meta.feilId,
            brukerId: action.meta.brukerId,
            tittel: tekster.get('feil.oversikt.hentOversiktFeilet.tittel'),
            melding: tekster.get('feil.oversikt.hentOversiktFeilet.melding'),
            handlinger: [handlingGaaTilFoi],
            alvorlighet: 'fatal',
        }, ...state];
    case LAG_NY_OVERSIKT_FEILET:
        return [{
            id: action.meta.feilId,
            brukerId: action.meta.brukerId,
            tittel: tekster.get('feil.lagNyOversikt.feilet.tittel'),
            melding: tekster.get('feil.lagNyOversikt.feilet.melding'),
            handlinger: [
                {
                    tittel: tekster.get('feil.lagNyOversikt.feilet.retry'),
                    onClick: () => action.meta.retry(),
                },
                handlingGaaTilFoi,
            ],
            alvorlighet: 'advarsel',
        }, ...state];
    case INNSENDING_FEILET:
        return [{
            id: action.meta.feilId,
            brukerId: action.meta.brukerId,
            tittel: tekster.get('feil.innsending.feilet.tittel'),
            melding: tekster.get('feil.innsending.feilet.melding'),
            handlinger: [
                {
                    tittel: tekster.get('feil.innsending.feilet.retry'),
                    onClick: () => action.meta.retry(),
                },
                handlingGaaTilFoi,
            ],
            alvorlighet: 'advarsel',
        }, ...state];
    default:
        return state;
    }
}
