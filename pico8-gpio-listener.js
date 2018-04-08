var getP8Gpio;

(function() {
  getP8Gpio = _getP8Gpio;
  // constants
  var size = 128;
  // variables
  var initialized = false;

  // extends Array prototype
  function PicoGpioArray() {
    Array.call(this, size);
    this._data = Array(size);
    this._listeners = [];
    this._pending = {};
    this._pendingNew = {};
    this._pendingTimeout = null;
    this.dispatchPending = this.dispatchPending.bind(this);
    Object.seal(this);
  }

  PicoGpioArray.prototype = Object.create(Array.prototype, {
    // we must custom-specify length since we override the index setters
    length: {
      value: size,
      writable: false
    }
  });
  PicoGpioArray.prototype.constructor = PicoGpioArray;

  // listener callback is required. second argument (verbose) is a boolean
  // and assumed to be false if not provided.
  PicoGpioArray.prototype.subscribe = function subscribe(listener, verbose) {
    listener.verbose = Boolean(verbose);
    this._listeners.push(listener);
    return (function unsubscribe() {
      this._listeners.splice(this._listeners.indexOf(listener), 1);
    }).bind(this);
  };

  // alert listeners of all values changed during the last call stack
  PicoGpioArray.prototype.dispatchPending = function dispatchPending() {
    var pendingIndices = Object.keys(this._pending).map(Number);
    var pendingNewIndices = Object.keys(this._pendingNew).map(Number);
    for (var i = 0; i < size; i++) {
      delete this._pending[i];
      delete this._pendingNew[i];
    }
    if (!pendingIndices.length) {
      return;
    }
    for (var l = 0; l < this._listeners.length; l++) {
      var indices = this._listeners[l].verbose
        ? pendingIndices
        : pendingNewIndices;
      if (indices.length) {
        this._listeners[l](indices);
      }
    }
  };

  // intercept assignments to each GPIO pin to notify listeners
  for (var i = 0; i < size; i++) {
    (function(index) {
      Object.defineProperty(PicoGpioArray.prototype, index, {
        get: function() {
          return this._data[index];
        },
        set: function(value) {
          clearTimeout(this._pendingTimeout);
          this._pending[index] = true;
          if (this._data[index] !== value) {
            this._pendingNew[index] = true;
          }
          this._data[index] = value;
          this._pendingTimeout = setTimeout(this.dispatchPending);
        }
      });
    })(i);
  }

  function _getP8Gpio() {
    if (!initialized) {
      window.pico8_gpio = new PicoGpioArray();
      initialized = true;
    }
    return window.pico8_gpio;
  }
})();

if (typeof module !== 'undefined' && module) {
  module.exports = getP8Gpio;
}
