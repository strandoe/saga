import { combineReducers } from 'redux';
import { createSelector } from 'reselect';

export const NEW_TASK = 'NEW_TASK';
export const newTask = (id, task) => ({ type: NEW_TASK, payload: { id, task } });

export const DELETE_TASK = 'DELETE_TASK';
export const deleteTask = id => ({ type: DELETE_TASK, payload: id });

export const COMPLETE_TASK = 'COMPLETE_TASK';
export const completeTask = id => ({ type: COMPLETE_TASK, payload: id });

export function tasks(state = [], { type, payload }) {
  switch (type) {
    case NEW_TASK:
      return state.concat([{ text: payload.task, id: payload.id, completed: false }]);
    case DELETE_TASK:
      return state.filter(task => task.id !== payload);
    case COMPLETE_TASK:
      return state.map(task => task.id === payload ? Object.assign(task, { completed: true }) : task);
    default:
      return state;
  }
}

export const completedTasks = createSelector(
  [state => state.tasks],
  tasks => tasks.filter(task => task.completed)
);

export const activeTasks = createSelector(
  [state => state.tasks],
  tasks => tasks.filter(task => !task.completed)
);

export default combineReducers({
  tasks
});
