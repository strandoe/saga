/* global __DEVELOPMENT__, __PRODUCTION__ */
import React from 'react';
import { render } from 'react-dom';
import store from './store';
import { Provider } from 'react-redux';
import { ConnectedTasklist } from './components/Tasklist.jsx';
import { ConnectedSaga } from './components/Saga.jsx';
import './scss/stil.scss';
import { Router, Route, IndexRoute, hashHistory } from 'react-router';

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

function redirectToIndex(location, replace) {
  replace('/tasks');
}

render(
    <Provider store={store}>
      <Router history={hashHistory}>
        <Route path="tasks" component={ConnectedTasklist} />
        <Route path="saga" component={ConnectedSaga} />
      </Router>
    </Provider>,
    document.getElementById('main')
);
