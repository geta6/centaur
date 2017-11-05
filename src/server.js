import fs from 'fs';
import get from 'lodash/get';
import set from 'lodash/set';
import uniq from 'lodash/uniq';
import omitBy from 'lodash/omitBy';
import path from 'path';
import express from 'express';
import helmet from 'helmet';
import favicon from 'serve-favicon';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import { navigateAction } from 'fluxible-router';
import useragent from 'ua-parser-js';
import serialize from 'serialize-javascript';
import React from 'react';
import ReactDOM from 'react-dom/server';
import CleanCss from 'clean-css';
import PrettyError from 'pretty-error';
import AppAction from './app/actions/App';
import HtmlContainer from './app/containers/Html';
import Payload from './app/utils/Payload';
import app from './app';
import assets from './assets.json'; // eslint-disable-line import/no-unresolved, import/extensions

//
// Instantiate objects
// -----------------------------------------------------------------------------
const srv = express();
const css = new CleanCss();
const pe = new PrettyError();
pe.skipNodeFiles();
pe.skipPackage('express', 'regenerator-runtime');
pe.alias(`${__dirname}/webpack:/`, '');

//
// Register middleware
// -----------------------------------------------------------------------------
srv.use(favicon(path.join(__dirname, 'public', 'favicon.png')));
srv.use(helmet());
srv.use(express.static(path.resolve(__dirname, 'public')));
srv.use(cookieParser());
srv.use(bodyParser.urlencoded({ extended: true }));
srv.use(bodyParser.json());

//
// Handle context
// -----------------------------------------------------------------------------
srv.use(async (req, res, next) => {
  try {
    Object.assign(req, { context: app.createContext({
      optimizePromiseCallback: true,
      fetchPluginConfig: { headers: req.headers },
    }) });
    await Promise.all([
      req.context.executeAction(AppAction, new Payload({
        type: AppAction.actionTypes.setAgent,
        entity: { agent: useragent(req.headers['user-agent']) },
      })),
      req.context.executeAction(AppAction, new Payload({
        type: AppAction.actionTypes.setLocale,
        entity: { locale: req.acceptsLanguages(['en-us', 'ja-jp']) },
      })),
      req.context.executeAction(navigateAction, {
        url: req.path,
      }),
    ]);
    next();
  } catch (e) {
    next(e);
  }
});

//
// Register application error
// -----------------------------------------------------------------------------
srv.use((reason, req, res, next) => {
  const statusCode = +(get(reason, ['statusCode']) || get(reason, ['response', 'status']) || 500);
  res.status(statusCode);
  statusCode >= 500 && process.stderr.write(`${pe.render(reason)}\n`);
  const RouteStore = req.context.getStore('RouteStore');
  if (get(RouteStore, ['_currentNavigate', 'error', 'statusCode']) !== statusCode) {
    RouteStore._currentNavigate.error = RouteStore._currentNavigate.error || {};
    Object.assign(RouteStore._currentNavigate.error, { statusCode, message: reason.message });
    RouteStore.emitChange();
  }
  next();
});

//
// Rendering middleware
// -----------------------------------------------------------------------------
srv.use((req, res, next) => {
  try {
    const styles = [];
    const context = Object.assign(req.context.getComponentContext(), { useCss: (s) => styles.push(s._getCss()) });
    const children = ReactDOM.renderToString(React.createElement(req.context.getComponent(), { context }));
    const dehydrated = app.dehydrate(req.context);
    const route = get(dehydrated, ['context', 'dispatcher', 'stores', 'RouteStore', 'currentNavigate', 'route']);
    set(dehydrated, ['context', 'dispatcher', 'stores', 'RouteStore', 'currentNavigate', 'route'], omitBy(route, (val) => typeof val === 'function'));
    const state = `window.dehydrated=${serialize(dehydrated)}`;
    const style = css.minify(uniq(styles).join('')).styles;
    res.status(req.context.getStore('RouteStore').getError().get('statusCode') || 200);
    res.setHeader('content-type', 'text/html');
    ReactDOM.renderToNodeStream(React.createElement(HtmlContainer, { context, style, state, assets }, children)).pipe(res);
  } catch (reason) {
    next(reason);
  }
});

//
// Rendering error fallback
// -----------------------------------------------------------------------------
srv.use((reason, req, res, next) => { // eslint-disable-line no-unused-vars
  process.stderr.write(pe.render(reason));
  res.status(500).setHeader('content-type', 'text/html');
  fs.createReadStream(path.join(__dirname, 'public', '500.html')).pipe(res);
});

//
// Launch the server
// -----------------------------------------------------------------------------
if (!module.hot) {
  const server = srv.listen(process.env.PORT, process.env.HOST, () => {
    const { address, port } = server.address();
    process.stdout.write(`The server is running at http://${address}:${port}/\n`);
  });
  const unhandled = (reason) => process.stderr.write(`${pe.render(reason)}`);
  process.removeListener('uncaughtException', unhandled);
  process.removeListener('unhandledRejection', unhandled);
  process.on('uncaughtException', unhandled);
  process.on('unhandledRejection', unhandled);
}

//
// Hot Module Replacement
// -----------------------------------------------------------------------------
if (module.hot) {
  srv.hot = module.hot;
  module.hot.accept('./app');
}

export default srv;
