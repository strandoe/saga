import React from 'react';

let e = React.createClass({
    render() {
        return <div className="fake-spinner"/>;
    }
});
if (process.env.NODE_ENV !== 'test') {
    e = require('react-spinkit');
}

export default e;
