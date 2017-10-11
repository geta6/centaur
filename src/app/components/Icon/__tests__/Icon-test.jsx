import feather from 'feather-icons';
import React from 'react';
import ReactTestUtils from 'react-dom/test-utils';
import ReactTestRenderer from 'react-test-renderer';
import { provideContext, createMockComponentContext, createMockComponent } from 'AppTestUtil';
import IconComponent from '..';

const Icon = provideContext(IconComponent);

describe('ButtonComponent', () => {
  let context;

  beforeEach(() => {
    context = createMockComponentContext();
  });

  it('should render', () => {
    const renderer = ReactTestRenderer.create(<Icon context={context} src='home' />);
    const json = renderer.toJSON();
    expect(json.type).toBe('i');
    expect(json.props.className).toBe('root');
    expect(json.props.dangerouslySetInnerHTML.__html).toMatch(/^<svg/);
    renderer.unmount();
  });

  it('should re-create icon svg after update props', () => {
    const MockComponent = createMockComponent(IconComponent, { prev: { src: 'home' }, next: { src: 'user' } });
    const tree = ReactTestUtils.renderIntoDocument(<MockComponent context={context} />);
    const pre = ReactTestUtils.findAllInRenderedTree(tree, (inst) => inst.constructor.displayName === 'IconComponent')[0];
    expect(pre.props.src).toBe('home');
    expect(pre.state.svg).toBe(feather.toSvg('home'));
    jest.runAllTimers();
    const post = ReactTestUtils.findAllInRenderedTree(tree, (inst) => inst.constructor.displayName === 'IconComponent')[0];
    expect(post.props.src).toBe('user');
    expect(post.state.svg).toBe(feather.toSvg('user'));
  });
});
