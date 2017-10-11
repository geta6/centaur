import path from 'path';
import util from 'gulp-util';
import dotenv from 'dotenv';

export default {
  load: (defaults = {}, log = true) => {
    const globals = Object.assign({}, require('../etc/env/_default.json'));
    const envPath = path.join(__dirname, `../etc/env/${process.env.NODE_ENV}.json`);
    try {
      Object.assign(globals, require(envPath)); // eslint-disable-line import/no-dynamic-require
      log && util.log(`Using envfile ${util.colors.magenta(envPath).replace(process.env.HOME, '~')}`);
    } catch (reason) {
      log && util.log(util.colors.yellow(`Missing env file ${util.colors.magenta(envPath).replace(process.env.HOME, '~')}`));
      log && util.log(`${util.colors.bold(util.colors.cyan('NOTE: '))}${util.colors.yellow('Using only default setting.')}`);
    }
    const { parsed } = dotenv.config();
    const env = Object.assign(globals, defaults, parsed);
    const envKeys = Object.keys(env);
    const longest = envKeys.reduce((length, key) => (key.length > length ? key.length : length), '');
    log && process.stdout.write('Environment\n');
    envKeys.forEach((envKey) => {
      const envVal = env[envKey];
      delete globals[envKey];
      globals[`process.env.${envKey}`] = JSON.stringify(envVal);
      process.env[envKey] = envVal;
      log && process.stdout.write(`    ${envKey}${' '.repeat(longest - envKey.length)} ${util.colors.green(envVal)}\n`);
    });
    return globals;
  },
};
