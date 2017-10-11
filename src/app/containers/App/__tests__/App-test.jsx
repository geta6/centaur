import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { navigateAction } from 'fluxible-router';
import { createMockComponentContext } from 'AppTestUtil';
import RouteStore from '../../../stores/Route';
import AppStore from '../../../stores/App';
import App from '..';

describe('AppComponent', () => {
  let context;

  beforeEach(() => {
    context = createMockComponentContext([RouteStore, AppStore]);
  });

  it('should render index contents under "/"', async () => {
    await context.executeAction(navigateAction, { url: context.getStore('RouteStore').makePath('index') });
    const renderer = ReactTestRenderer.create(<App context={context} />);
    const json = renderer.toJSON().children[0]; // Skip IntlProvider
    expect(json.type).toBe('div');
    expect(json.props.id).toBe('root');
    renderer.unmount();
  });

  it('should render missing route contents under "Not found route"', async () => {
    await context.executeAction(navigateAction, { url: '/n/o/t/f/o/u/n/d/r/o/u/t/e' });
    const renderer = ReactTestRenderer.create(<App context={context} src='home' />);
    const json = renderer.toJSON().children[0]; // Skip IntlProvider
    expect(json.type).toBe('div');
    expect(json.props.id).toBe('error');
    renderer.unmount();
  });
});
