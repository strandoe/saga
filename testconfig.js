import "babel-polyfill";

global.__DEVELOPMENT__ = false;
global.__LOGLEVEL__ = 1;

function storageMock() {
    const storage = {};

    return {
        setItem(key, value) {
            storage[key] = value || '';
        },
        getItem(key) {
            return storage[key];
        },
        removeItem(key) {
            delete storage[key];
        },
        get length() {
            return Object.keys(storage).length;
        },
        key(i) {
            const keys = Object.keys(storage);
            return keys[i] || null;
        },
    };
}

const jsdom = require('jsdom').jsdom;
global.document = jsdom('<html><body></body></html>');
global.window = document.defaultView;
global.navigator = {
    userAgent: 'node.js',
};
global.window.localStorage = storageMock();
global.localStorage = storageMock();
