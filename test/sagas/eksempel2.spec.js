import { takeEvery } from 'redux-saga';
import { put, take, call } from 'redux-saga/effects';
import { eksempel2, delay, doCall } from '../../src/sagas/effecteksempler/eksempel2';
import expect from 'expect';

describe('Eksempel 2', () => {
  it('skal vente på riktig action', () => {
    expect(eksempel2().next().value).toEqual(take('TEST_CALL_LATEST'));
  });

  it('skal vente 2 sekunder', () => {
    const gen = doCall({ count: 1 });
    expect(gen.next().value).toEqual(call(delay, 2000));
    expect(gen.next().value).toEqual(put({ type: 'TEST_CALL_FERDIG', count: 1 }));
  });
});
