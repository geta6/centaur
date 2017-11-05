import debug from 'debug';

if (process.env.NODE_ENV === 'development') {
  debug.enable('app:*');
}

export default class Debug {
  constructor(label) {
    return debug(`app:${label}`);
  }
}
