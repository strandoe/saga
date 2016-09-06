import React from 'react';
import { connect } from 'react-redux';
import { activeTasks, completedTasks, newTask, completeTask } from '../reducers';
import { withState } from 'recompose';
import shortid from 'shortid';
import { Task } from './Task.jsx';

const enhance = withState('taskText', 'setTaskText', '');

const inputStyle = {
  fontSize: '1.3rem',
  padding: '0.5em',
};

export const Tasklist = enhance(props => {
  return (
    <section>
      <input
        value={props.taskText}
        type="text"
        style={inputStyle}
        placeholder="Ny oppgave"
        onChange={e => props.setTaskText(e.target.value)}
        onKeyDown={e => {
          if (e.keyCode === 13) {
            props.newTask(shortid.generate(), props.taskText);
            props.setTaskText('');
          }
        }}/>
      <h3>Oppgaver</h3>
      <ul>
        {
          props.activeTasks.map(task => <li><Task editable onCheck={() => props.completeTask(task.id)} text={task.text} /></li>)
        }
      </ul>
      <h3>Fullførte oppgaver</h3>
      <ul>
        {
          props.completedTasks.map(task => <li><Task editable checked onCheck={() => props.completeTask(task.id)} text={task.text} /></li>)
        }
      </ul>
    </section>
  );
});

export const ConnectedTasklist = connect(
  state => {
    return {
      activeTasks: activeTasks(state),
      completedTasks: completedTasks(state),
    };
  },
  dispatch => {
    return {
      newTask(...args) {
        dispatch(newTask(...args));
      },
      completeTask(...args) {
        dispatch(completeTask(...args));
      }
    };
  }
)(Tasklist);
