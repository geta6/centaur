import fs from 'fs';
import glob from 'glob';

describe('Code style', () => {
  const files = {
    prod: [],
    test: [],
  };

  beforeEach((done) => {
    glob('src/**/*.js*', (reason, paths) => {
      const toFile = (name) => ({ name, body: fs.readFileSync(name, 'utf-8') });
      files.prod = paths.filter((path) => !/__tests__/.test(path)).map(toFile);
      files.test = paths.filter((path) => /__tests__/.test(path)).map(toFile);
      done();
    });
  });

  it('should clear instantiated Events', () => {
    for (const file of files.prod) {
      try {
        if (/this\.events\s=/.test(file.body)) {
          expect(/this\.events\.clear\(\)/.test(file.body)).toBeTrue();
        }
      } catch (error) {
        error.stack = `At: "${file.name}"\n${error.stack}`;
        throw error;
      }
    }
  });
});
