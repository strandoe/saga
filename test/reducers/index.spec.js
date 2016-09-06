import { tasks, newTask, deleteTask, completeTask } from '../../src/reducers';
import expect from 'expect';

describe('Reducer', () => {
  it('skal legge til ny oppgave', () => {
    const oppg = tasks([], newTask(1, 'hei'));
    expect(oppg.length).toBe(1);
    expect(oppg[0].text).toEqual('hei');
  });

  it('skal slette en oppgave', () => {
    const oppg = tasks([{ id: 'foo' }], deleteTask('foo'));
    expect(oppg.length).toBe(0);
  });

  it('skal fullføre en oppgave', () => {
    const oppg = tasks([ { id: 'foo', completed: false } ], completeTask('foo'));
    expect(oppg[0].completed).toBe(true);
  });
});
