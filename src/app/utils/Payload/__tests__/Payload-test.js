import Immutable from 'immutable';
import Payload from '..';

describe('PayloadUtil', () => {
  it('should not call as a function', () => {
    expect(() => Payload()).toThrow(); // eslint-disable-line new-cap
  });

  it('should set deep map with correct field', () => {
    const original = process.env.NODE_ENV;
    process.env.NODE_ENV = 'not-test';
    const field = { type: 'test', entity: { test: { foo: 'bar' } }, emitState: true };
    const payload = new Payload(field);
    expect(payload.toJS()).toEqual(field);
    expect(payload.get('entity')).toEqual(Immutable.fromJS(field.entity));
    process.env.NODE_ENV = original;
  });

  it('should ignore extra field', () => {
    const payload = new Payload({ hoge: 'fuga' });
    expect(payload instanceof Immutable.Map).toBe(true);
    expect(payload.get('hoge')).toBeUndefined();
  });
});
