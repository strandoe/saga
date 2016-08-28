import {writeCookie, getCookie} from '../felles/util';
import {generateCid} from '../felles/Log';

const key = 'sofus_visitor_id';

function allowsThirdPartyCookies() {
    var re = /Version\/\d+\.\d+(\.\d+)?.*Safari/;
    return !re.test(navigator.userAgent);
}

const store = {
    set(id) {
        localStorage.setItem(key, id);
        return id;
    },
    get() {
        return localStorage.getItem(key);
    }
};

const cookie = {
    set(id) {
        writeCookie(key, id, 7);
        return id;
    },
    get() {
        return getCookie(key);
    }
};

const persistor = allowsThirdPartyCookies() ? cookie : store;

export default function() {
    const id = persistor.get();
    if (!id) {
        return persistor.set(generateCid());
    }
    return id;
};
