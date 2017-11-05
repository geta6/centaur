import merge from 'lodash/merge';
import axios from 'axios';
import Debug from '../Debug';

const debug = new Debug('fetch:server');

export default function fetchPlugin() {
  return {
    name: 'Fetch',

    plugContext(contextOptions) {
      const instance = axios.create(merge({
        baseURL: process.env.ENDPOINT_INTERNAL,
        timeout: process.env.TIMEOUT,
        headers: { accept: 'application/vnd.centaur-v1+json' },
      }, contextOptions.fetchPluginConfig || {}));

      const request = async (options = { method: 'GET' }) => {
        try {
          const { data, status } = await instance(options);
          !options.nolog && debug.enabled && debug('%s %s %s', options.method, status, decodeURI(options.url));
          return data;
        } catch (e) {
          !options.nolog && debug.enabled && debug('%s %s %s', options.method, e.response.status, decodeURI(options.url));
          throw e;
        }
      };

      Object.assign(request, {
        get(url, options = {}) {
          return request(Object.assign({ method: 'GET', url }, options));
        },

        post(url, options = {}) {
          return request(Object.assign({ method: 'POST', url }, options));
        },

        put(url, options = {}) {
          return request(Object.assign({ method: 'PUT', url }, options));
        },

        del(url, options = {}) {
          return request(Object.assign({ method: 'DELETE', url }, options));
        },
      });

      return {
        plugActionContext(actionContext) {
          Object.assign(actionContext, { request });
        },
      };
    },
  };
}
