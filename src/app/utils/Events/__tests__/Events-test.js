import { dispatch } from 'AppTestUtil';
import Events from '..';

describe('EventsUtil', () => {
  it('should not call as a function', () => {
    expect(() => Events()).toThrow(); // eslint-disable-line new-cap
  });

  it('should dispatch custom event', () => {
    const events = new Events();
    const mock = jest.genMockFunction();
    events.bindOnce(window, 'click', mock);
    expect(mock.mock.calls.length).toBe(0);
    Events.dispatch(window, 'click');
    expect(mock.mock.calls.length).toBe(1);
  });

  it('should dispatch custom event', () => {
    const ce = CustomEvent;
    window.CustomEvent = undefined;
    const events = new Events();
    const mock = jest.genMockFunction();
    events.bindOnce(window, 'click', mock);
    expect(mock.mock.calls.length).toBe(0);
    Events.dispatch(window, 'click');
    expect(mock.mock.calls.length).toBe(1);
    window.CustomEvent = ce;
  });

  it('should bind / bindOnce / unbind', () => {
    const events = new Events();
    { // unbindable just after instantiate
      events.unbind();
    }
    { // bindOnce
      const mock = jest.genMockFunction();
      events.bindOnce(window, 'click', mock);
      expect(mock.mock.calls.length).toBe(0);
      dispatch.mouseEvent('click');
      expect(mock.mock.calls.length).toBe(1);
      dispatch.mouseEvent('click');
      expect(mock.mock.calls.length).toBe(1);
    }
    { // unbind by func
      const mock = jest.genMockFunction();
      events.bind(window, 'click', mock);
      expect(mock.mock.calls.length).toBe(0);
      dispatch.mouseEvent('click');
      expect(mock.mock.calls.length).toBe(1);
      events.unbind(window, 'click', mock);
      dispatch.mouseEvent('click');
      expect(mock.mock.calls.length).toBe(1);
    }
    { // unbind by name
      const mock = jest.genMockFunction();
      events.bind(window, 'click', mock);
      expect(mock.mock.calls.length).toBe(0);
      dispatch.mouseEvent('click');
      expect(mock.mock.calls.length).toBe(1);
      events.unbind(window, 'click');
      dispatch.mouseEvent('click');
      expect(mock.mock.calls.length).toBe(1);
    }
    { // unbind by target
      const mock = jest.genMockFunction();
      events.bind(window, 'click', mock);
      expect(mock.mock.calls.length).toBe(0);
      dispatch.mouseEvent('click');
      expect(mock.mock.calls.length).toBe(1);
      events.unbind(window);
      dispatch.mouseEvent('click');
      expect(mock.mock.calls.length).toBe(1);
    }
  });

  it('should delay / undelay', () => {
    const events = new Events();
    { // undelayable just after instantiate
      events.undelay();
    }
    { // delay
      const mock = jest.genMockFunction();
      events.delay(mock, 1000);
      expect(mock.mock.calls.length).toBe(0);
      jest.runAllTimers();
      expect(mock.mock.calls.length).toBe(1);
    }
    { // undelay by id
      const mock = jest.genMockFunction();
      const id = events.delay(mock, 1000);
      expect(mock.mock.calls.length).toBe(0);
      events.undelay(id);
      jest.runAllTimers();
      expect(mock.mock.calls.length).toBe(0);
    }
    { // undelay by func
      const mock = jest.genMockFunction();
      events.delay(mock, 1000);
      expect(mock.mock.calls.length).toBe(0);
      events.undelay(null, mock);
      jest.runAllTimers();
      expect(mock.mock.calls.length).toBe(0);
    }
  });

  it('should repeat / unrepeat', () => {
    const events = new Events();
    { // unrepeatable just after instantiate
      events.unrepeat();
    }
    { // repeat
      let id;
      const mock = jest.genMockFunction();
      const func = () => mock(events.unrepeat(id));
      id = events.repeat(func, 1000);
      expect(mock.mock.calls.length).toBe(0);
      jest.runAllTimers();
      expect(mock.mock.calls.length).toBe(1);
    }
    { // unrepeat by id
      const mock = jest.genMockFunction();
      const id = events.repeat(mock, 1000);
      expect(mock.mock.calls.length).toBe(0);
      events.unrepeat(id);
      jest.runAllTimers();
      expect(mock.mock.calls.length).toBe(0);
    }
    { // unrepeat by func
      const mock = jest.genMockFunction();
      events.repeat(mock, 1000);
      expect(mock.mock.calls.length).toBe(0);
      events.unrepeat(null, mock);
      jest.runAllTimers();
      expect(mock.mock.calls.length).toBe(0);
    }
  });

  it('should clear all events', () => {
    const events = new Events();
    const mock1 = jest.genMockFunction();
    const mock2 = jest.genMockFunction();
    const mock3 = jest.genMockFunction();

    events.bind(window, 'click', mock1);
    events.delay(mock2, 100);
    events.repeat(mock3, 100);

    events.clear();

    dispatch.mouseEvent();
    dispatch.keyboardEvent(0, 27);
    jest.runAllTimers();

    expect(mock1.mock.calls.length).toBe(0);
    expect(mock2.mock.calls.length).toBe(0);
    expect(mock3.mock.calls.length).toBe(0);
  });
});
