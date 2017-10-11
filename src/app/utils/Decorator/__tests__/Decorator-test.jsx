import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { provideContext, createMockComponentContext } from 'AppTestUtil';
import { withStyles } from '..';

describe('DecoratorUtil', () => {
  it('should called useCss() if style exists', () => {
    const removeCss = jest.genMockFunction();
    const useCss = jest.fn(() => removeCss);
    const context = createMockComponentContext([], { useCss });

    expect(removeCss.mock.calls.length).toBe(0);
    expect(useCss.mock.calls.length).toBe(0);

    @provideContext
    @withStyles('html {}')
    class MockComponent extends React.Component {

      static displayName = 'MockComponent';
      render = () => <div>Mock</div>;

    }

    const renderer = ReactTestRenderer.create(<MockComponent context={context} />);
    expect(removeCss.mock.calls.length).toBe(0);
    expect(useCss.mock.calls.length).toBe(1);

    renderer.unmount();
    jest.runAllTimers();
    expect(removeCss.mock.calls.length).toBe(1);
    expect(useCss.mock.calls.length).toBe(1);
  });

  it('should not called useCss() if style not exists', () => {
    const removeCss = jest.genMockFunction();
    const useCss = jest.fn(() => removeCss);
    const context = createMockComponentContext([], { useCss });

    @provideContext
    @withStyles()
    class MockComponent extends React.Component {

      static displayName = 'MockComponent';
      render = () => <div>Mock</div>;

    }

    expect(removeCss.mock.calls.length).toBe(0);
    expect(useCss.mock.calls.length).toBe(0);

    const renderer = ReactTestRenderer.create(<MockComponent context={context} />);
    expect(removeCss.mock.calls.length).toBe(0);
    expect(useCss.mock.calls.length).toBe(0);

    renderer.unmount();
    jest.runAllTimers();
    expect(removeCss.mock.calls.length).toBe(0);
    expect(useCss.mock.calls.length).toBe(0);
  });
});
