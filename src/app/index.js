import Fluxible from 'fluxible';
import batchedUpdatePlugin from 'fluxible-addons-react/batchedUpdatePlugin';
import fetchPlugin from './utils/FetchPlugin';
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
app.plug(fetchPlugin());

export default app;
