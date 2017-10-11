import { fromJS } from 'immutable';
import { storeGenerator } from '../../utils/Generator';

export default storeGenerator('AppStore', {
  handlers: {
    SET_AGENT: 'setAgent',
    SET_LOCALE: 'setLocale',
  },

  defaults: {
    agent: {},
    locale: 'en',
  },

  setAgent({ agent }) {
    return this.set(['agent'], this.get(['agent']).mergeDeep(fromJS(agent)));
  },

  getAgent() {
    return this.get(['agent']);
  },

  setLocale({ locale }) {
    return this.set(['locale'], locale);
  },

  getLocale() {
    return this.get(['locale']);
  },
});
