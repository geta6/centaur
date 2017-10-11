import get from 'lodash/get';
import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { createMockComponentContext } from 'AppTestUtil';
import serialize from 'serialize-javascript';
import RouteStore from '../../../stores/Route';
import Html from '..';

describe('HtmlComponent', () => {
  let context;

  beforeEach(() => {
    context = createMockComponentContext([RouteStore]);
  });

  it('should render', () => {
    const style = 'html,body { margin:0; padding:0; }';
    const state = serialize({ key: 'value' });
    const assets = { vendor: { js: 'script.vendor.js' }, client: { js: 'script.client.js' } };
    const renderer = ReactTestRenderer.create(<Html
      context={context}
      src='home'
      style={style}
      state={state}
      assets={assets}
    />);
    const json = renderer.toJSON();
    expect(json.type).toBe('html');

    const head = json.children.find((child) => child.type === 'head');
    {
      const tags = head.children.filter((child) => child.type === 'style');
      expect(tags.filter((t) => get(t, ['props', 'dangerouslySetInnerHTML', '__html']) === style).length).toBe(1);
    }

    const body = json.children.find((child) => child.type === 'body');
    {
      const tags = body.children.filter((child) => child.type === 'script');
      expect(tags.filter((t) => get(t, ['props', 'dangerouslySetInnerHTML', '__html']) === state).length).toBe(1);
    }
    {
      const tags = body.children.filter((child) => child.type === 'script');
      expect(tags.find((t) => get(t, ['props', 'id']) === 'vendor').props.src).toBe(assets.vendor.js);
      expect(tags.find((t) => get(t, ['props', 'id']) === 'client').props.src).toBe(assets.client.js);
    }

    renderer.unmount();
  });
});
