import AppStore from '../../stores/App';
import { actionGenerator } from '../../utils/Generator';

export default actionGenerator('AppAction', {
  async setAgent({ context, payload }) {
    const agent = payload.getIn(['entity', 'agent']);
    await context.dispatch(AppStore.dispatchTypes.SET_AGENT, { agent: agent.toJS() });
  },

  async setLocale({ context, payload }) {
    const locale = payload.getIn(['entity', 'locale']).toLowerCase();
    await context.dispatch(AppStore.dispatchTypes.SET_LOCALE, { locale });
  },
});
