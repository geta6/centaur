export default class KeyEvent {

  static simulate = (charCode, keyCode, modifiers = [], element = document, repeat = 1) => {
    const modifierToKeyCode = { shift: 16, ctrl: 17, alt: 18, meta: 91 };
    if (keyCode === 16 || keyCode === 17 || keyCode === 18 || keyCode === 91) {
      repeat = 0; // eslint-disable-line no-param-reassign
    }
    const modifiersToInclude = [];
    const keyEvents = [];

    if (typeof charCode === 'string') {
      charCode = charCode.charCodeAt(0); // eslint-disable-line no-param-reassign
    }

    for (let i = 0; i < modifiers.length; i++) {
      modifiersToInclude.push(modifiers[i]);
      keyEvents.push(new KeyEvent({ charCode: 0, keyCode: modifierToKeyCode[modifiers[i]], modifiers: modifiersToInclude }, 'keydown'));
    }

    while (repeat > 0) {
      keyEvents.push(new KeyEvent({ charCode: 0, keyCode, modifiers: modifiersToInclude }, 'keydown'));
      keyEvents.push(new KeyEvent({ charCode, keyCode: charCode, modifiers: modifiersToInclude }, 'keypress'));
      repeat--; // eslint-disable-line no-param-reassign
    }

    keyEvents.push(new KeyEvent({ charCode: 0, keyCode, modifiers: modifiersToInclude }, 'keyup'));

    for (let i = 0; i < modifiersToInclude.length; i++) {
      const modifierKeyCode = modifierToKeyCode[modifiersToInclude[i]];
      modifiersToInclude.splice(i, 1);
      keyEvents.push(new KeyEvent({ charCode: 0, keyCode: modifierKeyCode, modifiers: modifiersToInclude }, 'keyup'));
    }

    for (let i = 0; i < keyEvents.length; i++) {
      keyEvents[i].fire(element);
    }
  };

  constructor(data, type) {
    this.keyCode = 'keyCode' in data ? data.keyCode : 0;
    this.charCode = 'charCode' in data ? data.charCode : 0;
    const modifiers = 'modifiers' in data ? data.modifiers : [];
    this.ctrlKey = false;
    this.metaKey = false;
    this.altKey = false;
    this.shiftKey = false;
    for (let i = 0; i < modifiers.length; i++) {
      this[`${modifiers[i]}Key`] = true;
    }
    this.type = type || 'keypress';
  }

  toNative = () => {
    const event = document.createEventObject ? document.createEventObject() : document.createEvent('Events');
    event.initEvent && event.initEvent(this.type, true, true);
    event.keyCode = this.keyCode;
    event.which = this.charCode || this.keyCode;
    event.shiftKey = this.shiftKey;
    event.metaKey = this.metaKey;
    event.altKey = this.altKey;
    event.ctrlKey = this.ctrlKey;
    return event;
  };

  fire = (element) => {
    const event = this.toNative();
    if (element.dispatchEvent) {
      element.dispatchEvent(event);
      return;
    }
    element.fireEvent(`on${this.type}`, event);
  };

}
