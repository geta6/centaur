window.requestAnimationFrame = (fn) => setTimeout(fn, 0);

import 'babel-polyfill';
import 'jasmine-expect';
import path from 'path';
import PrettyError from 'pretty-error';
import { JUnitXmlReporter } from 'jasmine-reporters';
import Environment from '../Environment';

Environment.load({ NODE_ENV: 'test' }, false);

const pe = new PrettyError();
pe.skipNodeFiles();
pe.skipPackage(
  'jest-jasmine2',
  'jest-util',
  'fbjs',
  'core-js',
  'jest-cli',
  'jest-runtime',
  'babel-runtime',
  'regenerator-runtime',
  'enzyme',
  'react',
  'react-dom',
  'fluxible',
  'fluxible-addons-react',
  'dispatchr',
  '[worker-farm]',
);
pe.alias(`${path.join(__dirname, '..', '..')}/`, '');
pe.start();

// jest.mock('../../src/app/utils/Request');
// jest.mock('../../src/app/utils/SignIn');

jasmine.getEnv().addReporter(new JUnitXmlReporter({
  savePath: 'tmp/junit',
  consolidateAll: false,
}));
