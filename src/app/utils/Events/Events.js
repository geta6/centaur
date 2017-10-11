export default class Events {

  static dispatch = (target, name, detail = {}) => {
    try {
      const event = new CustomEvent(name, { detail });
      target.dispatchEvent(event);
    } catch (error) {
      const event = document.createEvent('CustomEvent');
      event.initCustomEvent(name, false, false, detail);
      target.dispatchEvent(event);
    }
  };

  bind = (target, name, fn, option = false) => {
    this.listeners = this.listeners || [];
    this.listeners.push({ target, name, fn });
    target.addEventListener(name, fn, option);
  };

  bindOnce = (target, name, fn, option = false) => {
    const callback = (...args) => {
      fn(...args);
      this.unbind(target, name, callback);
    };
    this.listeners = this.listeners || [];
    this.listeners.push({ target, name, fn: callback });
    target.addEventListener(name, callback, option);
  };

  unbind = (target, name, fn) => {
    if (this.listeners) {
      this.listeners.filter((listener) => {
        switch (true) {
          case !!fn: return listener.target === target && listener.name === name && listener.fn === fn;
          case !!name: return listener.target === target && listener.name === name;
          case !!target: return listener.target === target;
          default: return true;
        }
      }).reverse().forEach((listener) => {
        this.listeners.splice(this.listeners.indexOf(listener), 1);
        listener.target.removeEventListener(listener.name, listener.fn);
      });
    }
  };

  delay = (fn, delay) => {
    const id = setTimeout(fn, delay);
    this.timeouts = this.timeouts || [];
    this.timeouts.push({ id, fn });
    return id;
  };

  undelay = (id, fn) => {
    if (this.timeouts) {
      this.timeouts.filter((timeout) => {
        switch (true) {
          case !!id: return timeout.id === id;
          case !!fn: return timeout.fn === fn;
          default: return true;
        }
      }).reverse().forEach((timeout) => {
        this.timeouts.splice(this.timeouts.indexOf(timeout), 1);
        clearTimeout(timeout.id);
      });
    }
  };

  repeat = (fn, delay) => {
    const id = setInterval(fn, delay);
    this.intervals = this.invervals || [];
    this.intervals.push({ id, fn });
    return id;
  };

  unrepeat = (id, fn) => {
    if (this.intervals) {
      this.intervals.filter((inverval) => {
        switch (true) {
          case !!id: return inverval.id === id;
          case !!fn: return inverval.fn === fn;
          default: return true;
        }
      }).reverse().forEach((interval) => {
        this.intervals.splice(this.intervals.indexOf(interval), 1);
        clearTimeout(interval.id);
      });
    }
  };

  clear = () => {
    this.unbind();
    this.undelay();
    this.unrepeat();
  };

}
