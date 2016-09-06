import { ajaxHentOppgaverMedFeilhaandtering } from '../../src/actions/thunkActions';
import sinon from 'sinon';
import expect from 'expect';
import { mottaOppgaver, hentOppgaverFeilet, HENT_OPPGAVER_FEILET, hentOppgaver } from '../../src/actions/thunkActions';

describe('Thunk actions', () => {
  it('skal hente oppgaver', () => {
    const doFetch = sinon.stub();
    doFetch.withArgs('/oppgaver')
        .onFirstCall().returns(Promise.resolve({ oppgaver: [] }));

    const dispatch = sinon.spy();
    const getState = () => ({});

    const p = ajaxHentOppgaverMedFeilhaandtering(doFetch);
    const result = p(dispatch, getState);

    expect(dispatch.calledWith(mottaOppgaver([])));
  });
});
