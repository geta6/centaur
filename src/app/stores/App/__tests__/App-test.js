import useragent from 'ua-parser-js';
import { createMockActionContext } from 'AppTestUtil';
import AppStore from '..';

describe('AppStore', () => {
  let context;

  beforeEach(() => {
    context = createMockActionContext([AppStore]);
  });

  it('should set and get agent entity', () => {
    const payload = { agent: useragent(navigator.userAgent) };
    context.dispatch(AppStore.dispatchTypes.SET_AGENT, payload);
    // dispatch check
    expect(context.dispatchCalls.length).toBe(1);
    expect(context.dispatchCalls[0].name).toBe('SET_AGENT');
    expect(context.dispatchCalls[0].payload).toEqual(payload);
    // getter/setter check
    expect(context.getStore('AppStore').getAgent().toJS()).toEqual(payload.agent);
  });

  it('should set and get locale entity', () => {
    const payload = { locale: 'ja-jp' };
    context.dispatch(AppStore.dispatchTypes.SET_LOCALE, payload);
    // dispatch check
    expect(context.dispatchCalls.length).toBe(1);
    expect(context.dispatchCalls[0].name).toBe('SET_LOCALE');
    expect(context.dispatchCalls[0].payload).toEqual(payload);
    // getter/setter check
    expect(context.getStore('AppStore').getLocale()).toBe(payload.locale);
  });

});
