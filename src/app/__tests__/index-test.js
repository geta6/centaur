import Fluxible from 'fluxible';
import app from '../';

describe('Application', () => {
  it('should instantiate Fluxible instance', () => {
    expect(app instanceof Fluxible).toBeTrue();
  });
});
