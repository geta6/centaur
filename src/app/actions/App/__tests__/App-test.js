import useragent from 'ua-parser-js';
import { createMockActionContext } from 'AppTestUtil';
import Payload from '../../../utils/Payload';
import AppAction from '..';
import AppStore from '../../../stores/App';

describe('AppAction', () => {
  let context;

  beforeEach(() => {
    context = createMockActionContext([AppStore]);
  });

  it('should execute setAgent', async () => {
    expect(AppAction.actionTypes).toHaveString(AppAction.actionTypes.setAgent);
    const payload = new Payload({ type: AppAction.actionTypes.setAgent, entity: { agent: useragent(navigator.userAgent) } });
    await context.executeAction(AppAction, payload);
    // executed
    expect(context.executeActionCalls.length).toBe(1);
    expect(context.executeActionCalls[0].action).toBe(AppAction);
    expect(context.executeActionCalls[0].payload).toBe(payload);
    // dispatched
    expect(context.dispatchCalls.length).toBe(1);
    expect(context.dispatchCalls[0].name).toBe(AppStore.dispatchTypes.SET_AGENT);
    expect(context.dispatchCalls[0].payload.agent).toEqual(payload.getIn(['entity', 'agent']).toJS());
  });

  it('should execute setLocale', async () => {
    expect(AppAction.actionTypes).toHaveString(AppAction.actionTypes.setLocale);
    const payload = new Payload({ type: AppAction.actionTypes.setLocale, entity: { locale: 'en' } });
    await context.executeAction(AppAction, payload);
    // executed
    expect(context.executeActionCalls.length).toBe(1);
    expect(context.executeActionCalls[0].action).toBe(AppAction);
    expect(context.executeActionCalls[0].payload).toBe(payload);
    // dispatched
    expect(context.dispatchCalls.length).toBe(1);
    expect(context.dispatchCalls[0].name).toBe(AppStore.dispatchTypes.SET_LOCALE);
    expect(context.dispatchCalls[0].payload.locale).toBe(payload.getIn(['entity', 'locale']));
  });
});
