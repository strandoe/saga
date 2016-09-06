/* global __DEVELOPMENT__ */
import { compose, createStore, applyMiddleware } from 'redux';
import rootReducer from '../reducers';
import createSagaMiddleware from 'redux-saga';
import rootSaga from '../sagas';
import thunk from 'redux-thunk';

const sagaMiddleware = createSagaMiddleware(rootSaga);
const middlewares = [
    thunk,
    sagaMiddleware,
];

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
