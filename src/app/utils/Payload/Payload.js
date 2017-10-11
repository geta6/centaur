import { fromJS } from 'immutable';

export default class Payload {

  constructor({ type, entity = {}, emitState }) {
    return fromJS({ type, entity, emitState: typeof emitState === 'boolean' ? emitState : false });
  }

}
