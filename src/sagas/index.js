import innlogging from './innlogging';
import innlogget from './innlogget';
import beregningSaga from './beregningSaga';
import skattesubjektSaga from './skattesubjektSaga';
import oversiktSaga from './oversiktSaga';
import eksternNavigasjonSaga from './eksternNavigasjonSaga';
import analyticsSaga from './analyticsSaga';
import innsendingSaga from './innsendingSaga';
import { call } from 'redux-saga/effects';

export default function* () {
    yield [
        call(innlogging),
        call(innlogget),
        call(oversiktSaga),
        call(beregningSaga),
        call(innsendingSaga),
        call(skattesubjektSaga),
        call(eksternNavigasjonSaga),
        call(analyticsSaga),
    ];
}
