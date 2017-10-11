import noop from 'lodash/noop';
import * as FluxibleUtils from 'fluxible/utils';
import * as FluxibleAddonsReact from 'fluxible-addons-react';
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import KeyEvent from './KeyEvent';

export const provideContext = (Component) => (
  FluxibleAddonsReact.provideContext(Component, {
    useCss: PropTypes.func.isRequired,
  })
);

export const createMockActionContext = (stores = []) => (
  FluxibleUtils.createMockActionContext({
    stores: stores.map((Store) => class MockStore extends Store {}),
  })
);

export const createMockComponentContext = (stores = [], customContext = {}) => {
  const context = FluxibleUtils.createMockComponentContext({
    stores: stores.map((Store) => class MockStore extends Store {}),
  });
  return Object.assign(context, {
    useCss: customContext.useCss || (() => noop),
  });
};

export const createMockComponent = (Component, { prev = {}, next = {}, timing = 'componentDidMount' }) => (
  @provideContext
  class MockComponent extends PureComponent {

    state = prev;
    [timing] = () => setTimeout(() => this.setState(next));
    render = () => <Component {...this.state} />;

  }
);

export const dispatch = {
  mouseEvent(type = 'click', target = window, options = {}) {
    const mouseEvent = new MouseEvent(type, Object.assign({ bubbles: false, cancelable: false }, options));
    target.dispatchEvent(mouseEvent);
  },

  keyboardEvent(...args) {
    KeyEvent.simulate(...args);
  },
};
