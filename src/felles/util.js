import moment from 'moment';
import flatten from 'lodash/flatten';
import { SORTERING_KATEGORIER, SKATTEOBJEKTSTYPER_MED_EGEN_LEGG_TIL_TEKST, RESPONSE_TEXT_RUT_TIL_FOI } from './Konstanter';
import tekster from './tekster';

export function erKunHeltallEllerBlankt(verdi) {
    return new RegExp('^([0-9 ]|)+$').test(verdi);
}

export const isNumeric = n => !isNaN(parseFloat(n)) && isFinite(n);

export function formaterKroner(kroner) {
    if (kroner === undefined || kroner === null) {
        return kroner;
    }
    if (kroner.length > 0 && kroner[0] === '0') {
        return kroner;
    }

    const stringUtenWhitespace = (kroner + '').replace(/\s+/g, '');
    const kronerFormatert = parseInt(stringUtenWhitespace, 10).toFixed(0);

    return !isNaN(kronerFormatert) ? kronerFormatert.replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : '';
}

export function fjernFormateringKroner(kroner) {
    const utenFormatering = parseInt(('' + kroner).replace(/ /g, ''), 10);
    return isNaN(utenFormatering) ? undefined : utenFormatering;
}

export function formaterDato(timestamp) {
    return moment(timestamp).format('DD.MM.YYYY');
}

export function formaterDatoMedTidspunkt(timestamp) {
    return moment(timestamp).format('LLL');
}

export function beregnesFraMaaned() {
    const dagensDato = moment().date();
    const denneMaaneden = moment().month() + 1;
    const nesteMaaned = denneMaaneden + 1;

    return dagensDato < 23 || denneMaaneden === 12 ? denneMaaneden : nesteMaaned;
}

export function countSpaces(s) {
    if (s === undefined || s === null) {
        return 0;
    }
    let count = 0;
    for (let i = 0; i < s.length; i++) {
        if (s.charAt(i) === ' ') count++;
    }
    return count;
}

export function getCookie(cname) {
    const name = cname + '=';
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) === 0) {
            return c.substring(name.length, c.length);
        }
    }
    return '';
}

export function writeCookie(key, value, daysArg) {
    const date = new Date();

    // Default at 365 days.
    const days = daysArg || 365;

    // Get unix milliseconds at current time plus number of days
    date.setTime(+ date + (days * 86400000)); // 24 * 60 * 60 * 1000

    window.document.cookie = key + '=' + value + '; expires=' + date.toGMTString() + '; path=/';

    return value;
}

export function arrayToMap(array, property) {
    if (!Array.isArray(array)) {
        throw new Error('Expected an Array as first argument');
    }
    const map = {};
    array.forEach(val => {
        map[val[property]] = val;
    });
    return map;
}

export function isBlank(testString) {
    return testString === undefined || testString === null || testString.trim().length === 0;
}

export const postliste = {
    alleFelter: (ppostliste) => {
        const underkategorier = flatten(ppostliste.map(x => x.underKategorier));
        return flatten(underkategorier.map(x => x.felter));
    },
};

export function join(array, separator, lastSeparator = separator) {
    return array.reduce((total, elem, i) => {
        if (array.length === 1) {
            return elem;
        }

        if (i === (array.length - 1) && array.length > 1) {
            return total + lastSeparator + elem;
        }

        if (i === (array.length - 2)) {
            return total + elem;
        }
        return total + elem + separator;
    }, '');
}

export function pluralize(length, singular, plural) {
    if (length === 1) {
        return '1 ' + singular;
    }
    return length + ' ' + plural;
}

export function getQueryParameterByName(nam, location = window.location) {
    const name = nam.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    const results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

export function sortPostnummer(a, b) {
    const postnrA = a.postnummer !== undefined ? a.postnummer.split('.') : '';
    const postnrB = b.postnummer !== undefined ? b.postnummer.split('.') : '';
    for (let i = 0; i < postnrA.length || i < postnrB.length; i++) {
        const x = parseInt(postnrA[i], 10);
        const y = parseInt(postnrB[i], 10);
        if (isNaN(y)) {
            return 1;
        }
        if (isNaN(x)) {
            return -1;
        }
        if (x !== y) {
            return x - y;
        }
    }
    return 0;
}

export function sorterKategorierIGruppe(gruppe) {
    const sortering = SORTERING_KATEGORIER[gruppe];
    return (a, b) => {
        const i1 = sortering.indexOf(a.kategori);
        const i2 = sortering.indexOf(b.kategori);

        const val1 = i1 === -1 ? 9999 : i1;
        const val2 = i2 === -1 ? 9999 : i2;

        return val1 - val2;
    };
}

export function nyListeMedEndretNyttObjektPaaIndex(liste, indeks, endretObjekt) {
    return [
        ...liste.slice(0, indeks),
        Object.assign({}, liste[indeks], endretObjekt),
        ...liste.slice(indeks + 1),
    ];
}

export function immutableReplaceAtIndex(list, index, value) {
    return [
        ...list.slice(0, index),
        value,
        ...list.slice(index + 1),
    ];
}

export function tekstForLeggesTil(skatteobjektstype) {
    if (SKATTEOBJEKTSTYPER_MED_EGEN_LEGG_TIL_TEKST.some(x => x === skatteobjektstype)) {
        return tekster.get('postvelger.' + skatteobjektstype);
    }
    return tekster.get(skatteobjektstype);
}

export function delay(ms) {
    return new Promise(resolve => setTimeout(() => resolve(), ms));
}

const STATUS_FORBIDDEN = 403;
export function responseRutTilFoi(xhr) {
    return xhr && xhr.status === STATUS_FORBIDDEN && xhr.responseText === RESPONSE_TEXT_RUT_TIL_FOI;
}

export const groupBy = propOrFunc => (acc, item) => {
    const key = typeof propOrFunc === 'function' ? propOrFunc(item) : item[propOrFunc];
    acc[key] = acc[key] || [];
    acc[key].push(item);
    return acc;
};

export function composeReducers(initialState, ...reducers) {
    return (state = initialState, action) => {
        const last = reducers[reducers.length - 1];
        const rest = reducers.slice(0, -1);
        return rest.reduceRight((composed, f) => f(composed, action), last(state, action));
    };
}

export const noop = () => ({});

export function navigate(url) {
    window.location = url;
}

export function navigateInNewWindow(url) {
    window.open(url);
}

export const is = {
    undef: v => v === null || v === undefined,
    notUndef: v => v !== null && v !== undefined,
    func: f => typeof f === 'function',
    array: Array.isArray,
    promise: p => p && is.func(p.then),
    iterator: it => it && is.func(it.next) && is.func(it.throw),
};
