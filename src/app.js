/* global __DEVELOPMENT__, __PRODUCTION__ */
import React from 'react';
import { render } from 'react-dom';
import store from './store';
import { Provider } from 'react-redux';
import { ConnectedTasklist } from './components/Tasklist.jsx';
import './scss/stil.scss';

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
      <ConnectedTasklist />
    </Provider>,
    document.getElementById('main')
);
