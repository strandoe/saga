import React from 'react';
import { connect } from 'react-redux';

const btnStyle = {
  margin: '1em',
};

export function Saga(props) {
  return (
    <section>
      <button style={btnStyle} onClick={() => props.call()}>Call</button>
      <button style={btnStyle} onClick={() => props.eksempel2()}>Latest call</button>
      <button style={btnStyle} onClick={() => props.eksempel3()}>Sjekk count</button>
      <button style={btnStyle} onClick={() => props.eksempel4()}>Fork/join</button>
      <button style={btnStyle} onClick={() => props.eksempel5()}>Race</button>
      <button style={btnStyle} onClick={() => props.cancel()}>Cancel</button>
    </section>
  );
}

let counter1 = 1;
let counter2 = 1;

export const ConnectedSaga = connect(
  state => ({}),
  dispatch => {
    return {
      call: () => dispatch({ type: 'TEST_CALL', count: counter1++ }),
      eksempel2: () => dispatch({ type: 'TEST_CALL_LATEST', count: counter2++ }),
      eksempel3: () => dispatch({ type: 'SJEKK_COUNT' }),
      eksempel4: () => dispatch({ type: 'EKSEMPEL4' }),
      eksempel5: () => dispatch({ type: 'EKSEMPEL5' }),
      cancel: () => dispatch({ type: 'CANCEL' }),
    };
  }
)(Saga);
