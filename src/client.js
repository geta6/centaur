import 'react-fastclick';
import React from 'react';
import ReactDOM from 'react-dom';
import { navigateAction } from 'fluxible-router';
import deepForceUpdate from 'react-deep-force-update';
import app from './app';

app.rehydrate(window.dehydrated, async (err, context) => {
  let instance;
  let isInitialRender = true;
  const container = document.getElementById('root');
  const componentContext = Object.assign(context.getComponentContext(), {
    useCss: (...styles) => {
      const removeCss = styles.map((x) => x._insertCss());
      return () => removeCss.forEach((f) => f());
    },
  });

  const render = () => {
    const renderFunction = isInitialRender ? ReactDOM.hydrate : ReactDOM.render;
    isInitialRender = false;
    instance = renderFunction(React.createElement(context.getComponent(), {
      context: componentContext,
    }), container);
  };

  await render();

  if (module.hot) {
    instance && deepForceUpdate(instance);
    module.hot.accept('./app', async () => {
      instance && deepForceUpdate(instance);
      await context.executeAction(navigateAction, { url: location.pathname });
      await render();
    });
  }
});
