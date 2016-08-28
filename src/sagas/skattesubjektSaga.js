import { post, roturlKalkulator } from '../felles/ajax';
import { LAG_SKATTESUBJEKT, mottaSkattesubjekt } from '../actions';
import { takeLatest } from 'redux-saga';
import { call, put } from 'redux-saga/effects';
import { hashHistory } from 'react-router';

export function* lag({ payload }) {
    const { response } = yield call(post, roturlKalkulator + '/skattesubjekt', payload);

    if (response) {
        yield put(mottaSkattesubjekt(response));
        yield call(hashHistory.push, '/grunnlag');
    }
}

export default function* () {
    yield* takeLatest(LAG_SKATTESUBJEKT, lag);
}
