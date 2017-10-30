import { fromJS } from 'immutable';
import { RouteStore } from 'fluxible-router';
// import AppAction from '../../actions/App';
// import Payload from '../../utils/Payload';
import StyleGuideHandler from '../../handlers/StyleGuide';

// const createRouteAction = (action) => async (context, ...args) => {
//   const route = args.shift();
//   await Promise.all(action(context, fromJS(route), ...args));
// };

const routes = RouteStore.withStaticRoutes({
  index: {
    path: '/',
    handler: StyleGuideHandler,
  },
});

Object.assign(routes.prototype, {
  getRoute: function getRoute() {
    return fromJS(routes.prototype.getCurrentRoute.call(this) || {});
  },
  getError: function getError() {
    return fromJS(routes.prototype.getCurrentNavigateError.call(this) || {});
  },
});

export default routes;
