export const HENT_OPPGAVER = 'HENT_OPPGAVER';
export const MOTTA_OPPGAVER = 'MOTTA_OPPGAVER';
export const HENT_OPPGAVER_FEILET = 'HENT_OPPGAVER_FEILET';

export const hentOppgaver = () => ({ type: HENT_OPPGAVER });
export const mottaOppgaver = oppgaver => ({ type: MOTTA_OPPGAVER, payload: oppgaver });
export const hentOppgaverFeilet = (error, retry) => ({ type: HENT_OPPGAVER_FEILET, error, meta: { retry } });

export function ajaxHentOppgaver() {
  return (dispatch, getState) => {
    return fetch('/oppgaver')
      .then(
        oppgaver => dispatch(mottaOppgaver(oppgaver)),
        feil => dispatch(hentOppgaverFeilet(feil))
      );
  }
}

// Hvordan teste retry?
// Vi må mocke fetch, dispatch og getState
// Hvordan avbryte et kall?

export function ajaxHentOppgaverMedFeilhaandtering(doFetch = window.fetch) {
  return (dispatch, getState) => {
    return doFetch('/oppgaver')
      .then(
        oppgaver => dispatch(mottaOppgaver(oppgaver)),
        feil => {
          dispatch(hentOppgaverFeilet(feil, () => {
            dispatch(hentOppgaver());
          }));
        }
      );
  }
}
