import { TaskStatusAsStringPipe } from './task-status-as-string.pipe';

describe('TaskStatusAsStringPipe', () => {
  it('create an instance', () => {
    const pipe = new TaskStatusAsStringPipe();
    expect(pipe).toBeTruthy();
  });
});
