/* global __DEVELOPMENT__ */
import { compose, createStore, applyMiddleware } from 'redux';
import createLogger from 'redux-logger';
import rootReducer from '../reducers';
import logErrorsInterceptor from './logErrorsInterceptor';
import createSagaMiddleware from 'redux-saga';
import rootSaga from '../sagas';
import { logErrorRemotely } from '../felles/Log';
import { SJEKK_NETTLESER, SJEKK_SESJON } from '../actions';
import { TOGGLE_HJELP, TOGGLE_POSTVELGER, TOGGLE_REDIGERINGSMODUS } from '../actions';

const uinteressanteActions = [SJEKK_NETTLESER, SJEKK_SESJON, TOGGLE_POSTVELGER, TOGGLE_REDIGERINGSMODUS, TOGGLE_HJELP];
const sagaMiddleware = createSagaMiddleware(rootSaga);
const middlewares = [
    sagaMiddleware,
    logErrorsInterceptor(logErrorRemotely),
];

if (__DEVELOPMENT__) {
    middlewares.push(
        createLogger({
            predicate: (getState, action) => {
                const sagalogg = action.type.startsWith('EFFECT_');
                const ikkeInteressant = uinteressanteActions.includes(action.type);
                return !sagalogg && !ikkeInteressant;
            },
        })
    );
}

const createStoreWithMiddleware = compose(
    applyMiddleware(...middlewares),
    typeof window === 'object' && typeof window.devToolsExtension !== 'undefined' ? window.devToolsExtension() : f => f
)(createStore);

export default function configureStore(initialState) {
    const store = createStoreWithMiddleware(rootReducer, initialState);
    if (module.hot) {
        // Enable Webpack hot module replacement for reducers
        module.hot.accept('../reducers', () => {
            const nextReducer = require('../reducers/index');
            store.replaceReducer(nextReducer);
        });
    }
    return store;
}
