import { fromJS } from 'immutable';
import { createMockActionContext } from 'AppTestUtil';
import { actionGenerator, storeGenerator } from '..';
import Payload from '../../Payload';

describe('GeneratorUtil', () => {
  let storeInitializer;
  let MockAction;
  let MockStore;
  let actionContext;

  beforeEach(() => {
    storeInitializer = jest.genMockFunction();

    MockAction = actionGenerator('MockAction', {
      mockAction({ context, payload }) {
        const mock = payload.getIn(['entity', 'mock']).toJS();
        context.dispatch(MockStore.dispatchTypes.SET_MOCK, { mock });
      },
    });

    MockStore = storeGenerator('MockStore', {
      handlers: { SET_MOCK: 'setMock' },
      initialize: storeInitializer,
      setMock({ mock }) {
        this.set('mock', fromJS(mock));
      },
      getMock(key) {
        return this.get(['mock'], ...(Array.isArray(key) ? key : [key]));
      },
    });

    actionContext = createMockActionContext([MockStore]);
  });

  it('should MockAction and MockStore class properties generated successfully', () => {
    expect(MockAction.displayName).toBe('MockAction');
    expect(MockAction.actionTypes.mockAction).toBe('mockAction');
    expect(MockStore.dispatchTypes.SET_MOCK).toBe('SET_MOCK');
  });

  it('should generate action and store crrectly', async () => {
    const payload = new Payload({ type: MockAction.actionTypes.mockAction, entity: { mock: { foo: 'bar' } } });
    await actionContext.executeAction(MockAction, payload);
    // action executed
    expect(actionContext.executeActionCalls.length).toBe(1);
    expect(actionContext.executeActionCalls[0].action).toBe(MockAction);
    expect(actionContext.executeActionCalls[0].payload).toBe(payload);
    // action dispatched
    expect(actionContext.dispatchCalls.length).toBe(1);
    expect(actionContext.dispatchCalls[0].name).toBe(MockStore.dispatchTypes.SET_MOCK);
    expect(actionContext.dispatchCalls[0].payload.mock).toEqual(payload.getIn(['entity', 'mock']).toJS());
    // store check
    const mockStore = actionContext.getStore('MockStore');
    expect(storeInitializer.mock.calls.length).toBe(1);
    expect(mockStore.getMock()).toEqual(payload.getIn(['entity', 'mock']));
    // low level API
    expect(mockStore.get('mock')).toEqual(payload.getIn(['entity', 'mock']));
    expect(mockStore.get(['mock'])).toEqual(payload.getIn(['entity', 'mock']));
    expect(mockStore.has('mock')).toBeTrue();
    expect(mockStore.has(['mock'])).toBeTrue();
    // not emitChange called try to set same entity
    const emitChange = mockStore.emitChange;
    mockStore.emitChange = jest.fn(emitChange);
    mockStore.set('mock', payload.getIn(['entity', 'mock']));
    expect(mockStore.emitChange.mock.calls.length).toBe(0);
    // hydrate
    const dehydrated = mockStore.dehydrate();
    expect(dehydrated).toEqual(payload.getIn(['entity']).toJS());
    mockStore.rehydrate({ mock: { hoge: 'fuga' } });
    expect(mockStore.dehydrate()).toEqual({ mock: { hoge: 'fuga' } });
    // state check
    // expect(actionContext.getStore('StateStore').hasState([toSnakeCase('MockAction'), toSnakeCase(MockAction.actionTypes.mockAction)].join('_'))).toBeTrue();
    // expect(actionContext.getStore('StateStore').getState([toSnakeCase('MockAction'), toSnakeCase(MockAction.actionTypes.mockAction)].join('_'))).toBeFalse();
    // expect(context.getStore('StateStore').getState().toJS()).toEqual(payload.state);
  });
});
