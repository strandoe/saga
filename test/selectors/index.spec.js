import { completedTasks, activeTasks } from '../../src/reducers';
import expect from 'expect';

describe('Selectors', () => {
  it('skal vise fullførte oppgaver', () => {
    const oppg = completedTasks({ tasks: [ { completed: true }, { completed: false } ] });
    expect(oppg.length).toBe(1);
    expect(oppg[0].completed).toBe(true);
  });

  it('skal vise aktive oppgaver', () => {
    const oppg = activeTasks({ tasks: [ { completed: true }, { completed: false } ] });
    expect(oppg.length).toBe(1);
    expect(oppg[0].completed).toBe(false);
  });
});
