import { getQueryParameterByName } from './felles/util';

export function erAapenLoesning(vindu = window) {
    return vindu.location.href.includes('skattekalkulator') || getQueryParameterByName('aapen', vindu.location) === 'true';
}

export function erPaaloggetLoesning(vindu = window) {
    return !erAapenLoesning(vindu);
}

export function erLocalhost(vindu = window) {
    return vindu.location.origin && vindu.location.origin.toLowerCase().indexOf('localhost') !== -1;
}
