/* global __DEVELOPMENT__, __PRODUCTION__ */
import React from 'react';
import './scss/grunnstil.scss';
import { render } from 'react-dom';
import Main from './components/ConnectedMain';
import Grunnlag from './components/grunnlag/ConnectedGrunnlag';
import Skattesubjekt from './components/Skattesubjekt';
import { logErrorRemotely } from './felles/Log';
import Tekster from './felles/tekster';
import { Router, Route, IndexRoute, hashHistory } from 'react-router';
import ForberedInnsending from './components/forberedinnsending/ConnectedForberedInnsending';
import Kvittering from './components/Kvittering';
import Sporreundersokelse from './components/Sporreundersokelse';
import { getQueryParameterByName, getCookie } from './felles/util';
import { setSofusBackdoor } from './felles/ajax';
import injectTapEventPlugin from 'react-tap-event-plugin';
import store from './store';
import { TILSTAND_HENT_OVERSIKT_FERDIG } from './felles/Konstanter';
import { Provider } from 'react-redux';
import { erPaaloggetLoesning, erAapenLoesning } from './config';
import { feil, navigerEksternt, KONTEKST_NAVIGER_EKSTERNT } from './actions';
import { getBrukerId, getSystemdata } from './selectors';
import stackinfo from 'stackinfo';
import FeatureToggles from './felles/FeatureToggles';

injectTapEventPlugin();

if (__DEVELOPMENT__) {
    const localhost = 'localhost';
    // const localhostEkstern = '192.168.183.133';
    const host = localhost;
    if (erPaaloggetLoesning() && !getCookie('SOFUS_SESJON')) {
        window.location = 'http://' + host + ':9900/mss/login/';
    }
}

setSofusBackdoor(getQueryParameterByName('sofusBackdoor'));

if (__PRODUCTION__) {
    const piwikCspFeilmeldingPattern = 'Uncaught EvalError';
    const piwikCspFeilmeldingPattern2 = 'https://analytics.sits.no';
    window.onerror = (msg, source, line, col, error) => {
        const brukerId = getBrukerId(store.getState());
        const errorId = logErrorRemotely({
            msg,
            brukerId,
            stack: stackinfo(error).slice(0, 10),
        });

        const varPiwikCspFeil = msg.indexOf(piwikCspFeilmeldingPattern) > -1 && msg.indexOf(piwikCspFeilmeldingPattern2) > -1;

        if (!FeatureToggles.visJavascriptFeilTilBruker || varPiwikCspFeil) {
            return;
        }

        store.dispatch(feil(
            errorId,
            brukerId,
            'En feil har oppstått',
            Tekster.get('feil.generisk'),
            [{
                tittel: Tekster.get('gaaTilGammelTjeneste'),
                onClick: () => {
                    store.dispatch(navigerEksternt({
                        url: getSystemdata(store.getState()).foiUrl,
                        nyttVindu: true,
                        kontekst: KONTEKST_NAVIGER_EKSTERNT.gammelLoesning.generellFeil,
                    }));
                },
            }]
        ));
    };
}

const Index = React.createClass({
    propTypes: {
        children: React.PropTypes.node,
    },
    render() {
        return (
            <div>
                <h1>You should not see this.</h1>
                {this.props.children}
            </div>
        );
    },
});

function redirectToGrunnlag(nextState, replace) {
    replace('/grunnlag');
}

function redirectToIndex(location, replace) {
    if (erPaaloggetLoesning()) {
        redirectToGrunnlag(location, replace);
    } else {
        replace('/skattesubjekt');
    }
}

function requireSkattesubjektHvisSkattekalkulator(nextState, replace) {
    const { skattesubjekt } = store.getState();
    if (erAapenLoesning() && !skattesubjekt) {
        replace('/skattesubjekt');
    }
}

function requireGrunnlag(nextState, replace) {
    const { tilstand } = store.getState();
    if (tilstand.oversikt !== TILSTAND_HENT_OVERSIKT_FERDIG) {
        replace('/grunnlag');
    }
}

function requireSoknad(nextState, replace) {
    const { soknad } = store.getState();
    const harSoknad = soknad && soknad.altinnreferanse && soknad.innsendtIDenneSesjonen;
    if (!harSoknad) {
        replace('/grunnlag');
    }
}

render(
    <Provider store={store}>
        <Router history={hashHistory}>
            <Route path="/" component={Main}>
                <IndexRoute component={Index} onEnter={redirectToIndex} />
                <Route path="grunnlag" component={Grunnlag} onEnter={requireSkattesubjektHvisSkattekalkulator} />
                <Route path="skattesubjekt" component={Skattesubjekt}/>
                <Route path="sendinn" component={ForberedInnsending} onEnter={requireGrunnlag} />
                <Route path="kvittering" component={Kvittering} onEnter={requireSoknad} />
                <Route path="undersokelse" component={Sporreundersokelse} />
            </Route>
        </Router>
    </Provider>,
    document.getElementById('main')
);

document.querySelector('head title').textContent = erPaaloggetLoesning() ? 'MinSkatteside' : 'Skattekalkulator';
