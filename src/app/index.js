import Fluxible from 'fluxible';
import batchedUpdatePlugin from 'fluxible-addons-react/batchedUpdatePlugin';
import AppContainer from './containers/App';
import AppStore from './stores/App';
import RouteStore from './stores/Route';

const app = new Fluxible({
  component: AppContainer,
  stores: [
    AppStore,
    RouteStore,
  ],
});

app.plug(batchedUpdatePlugin());

export default app;
