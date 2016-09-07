import { takeEvery } from 'redux-saga';
import { put, take, call } from 'redux-saga/effects';
import { eksempel1, delay, doCall } from '../../src/sagas/effecteksempler/eksempel1';
import expect from 'expect';

describe('Eksempel 1', () => {
  it('skal vente på riktig action', () => {
    expect(eksempel1().next().value).toEqual(take('TEST_CALL'));
  });

  it('skal vente 2 sekunder', () => {
    const gen = doCall({ count: 1 });
    expect(gen.next().value).toEqual(call(delay, 2000));
    expect(gen.next().value).toEqual(put({ type: 'TEST_CALL_FERDIG', count: 1 }));
  });
});
