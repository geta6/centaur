import keyMirror from 'fbjs/lib/keyMirror';
import { fromJS, is } from 'immutable';
import { createStore } from 'fluxible/addons';

export function actionGenerator(displayName, actions) {
  return Object.assign(async (context, payload) => {
    const actionType = payload.get('type');
    const action = actions[actionType];
    const result = await action.call(actions, { context, payload });
    return result;
  }, { displayName, actionTypes: keyMirror(actions) });
}

export function storeGenerator(storeName, properties) {
  return Object.assign(createStore(Object.assign({ storeName, ...properties }, {
    initialize() {
      if (properties.initialize) {
        properties.initialize.call(this);
      }
      Object.defineProperty(this, 'data', {
        enumerable: false,
        writable: true,
        configurable: false,
        value: fromJS(properties.defaults || {}),
      });
    },

    set(paths, data) {
      if (!is(this.get(paths), data)) {
        Object.defineProperty(this, 'data', {
          enumerable: false,
          writable: true,
          configurable: false,
          value: this.data.setIn(Array.isArray(paths) ? paths : [paths], data),
        });
        this.emitChange();
        return true;
      }
      return false;
    },

    get(paths, defaults) {
      return this.data.getIn(Array.isArray(paths) ? paths : [paths], defaults);
    },

    has(paths) {
      return this.data.hasIn(Array.isArray(paths) ? paths : [paths]);
    },

    dehydrate() {
      return this.data.toJS();
    },

    rehydrate(dehydrated) {
      Object.defineProperty(this, 'data', {
        enumerable: false,
        writable: true,
        configurable: false,
        value: fromJS(dehydrated),
      });
    },
  })), { dispatchTypes: keyMirror(properties.handlers) });
}
