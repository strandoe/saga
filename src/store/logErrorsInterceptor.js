import { MOTTA_ALTINN_MELDINGER, SJEKK_SESJON, TOGGLE_HJELP, TOGGLE_POSTVELGER, TOGGLE_REDIGERINGSMODUS, LAG_NY_OVERSIKT, MOTTA_NY_OVERSIKT } from '../actions';
import { getBrukerId } from '../selectors';

const IKKE_LOGG = [
    MOTTA_ALTINN_MELDINGER,
    SJEKK_SESJON,
    TOGGLE_HJELP,
    TOGGLE_POSTVELGER,
    TOGGLE_REDIGERINGSMODUS,
    LAG_NY_OVERSIKT,
    MOTTA_NY_OVERSIKT,
];

function erInternSagaAction(action) {
    return action.type.startsWith('EFFECT_');
}

export default function(logger, actionLog = []) {
    return store => next => action => {
        const result = next(action);

        if (!erInternSagaAction(action) && !action.error && !IKKE_LOGG.some(k => k === action.type)) {
            actionLog.unshift(action);
        }

        if (action.error && !erInternSagaAction(action)) {
            actionLog.unshift(Object.assign({}, action, { payload: action.payload.toString()}));
            logger({
                msg: actionLog,
                brukerId: getBrukerId(store.getState()),
                action,
            });
        }

        return result;
    };
}
