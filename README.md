# pico8-gpio-listener

A small library for listening to changes to your [PICO-8](https://www.lexaloffle.com/pico-8.php) web game's GPIO pins.

### [Try it here!](https://benwiley4000.github.io/pico8-gpio-listener/)

The fact you can read and write PICO-8 GPIO values from the web wrapper is awesome - it means you can do things like emit vibrations according to game state, change the site theme to match different in-game levels, or maybe even develop a brand new input scheme.

However the API for reading these values is a bit basic... PICO-8 writes GPIO values to an array, and it's up to you, the developer to check those values periodically to see if they're different. What if you could just tell JavaScript to let you know whenever the GPIO pins get updated with new values?

Voilà:

```js
var gpio = getP8Gpio();
var unsubscribe = gpio.subscribe(function(indices) {
  console.log(
    'New values at indices ' + indices.join(', ') + ': ' +
    indices.map(function(i) { return gpio[i]; }).join(', ')
  );
});
// unsubscribe later if you want...
unsubscribe();
```

This uses JavaScript setters under the hood to watch each index in the array, which means the watching part is shoved into a native background thread (== faster!). No need to write once-a-frame JS iterator loops or anything like that. Whenever PICO-8 writes to the GPIO array, you get notified immediately.

Of course you can also write back to the GPIO array:

```js
gpio[3] = 255;
gpio[4] = 0;
```

```console
New values at indices 3, 4: 255, 0
```

Your listener will be notified about your own changes as well; it's up to you if you want to do anything with that.

By default, listeners only get called if at least one value has changed in the last call stack. If you want to be notified about every update, new value or not, you can pass a second argument, `verbose`, which is a boolean:

```js
gpio.subscribe(function(indices) {
  console.log(
    'The values ' +
    indices.map(function(i) { return gpio[i]; }).join(', ') +
    ' at indices ' + indices.join(', ') +
    ' probably didn't change, but I am logging them anyway..'
  );
}, true);
```

## installing as a module

You can also install from npm:

```console
npm install --save pico8-gpio-listener
```

And use like this:

```js
var getP8Gpio = require('pico8-gpio-listener');

var gpio = getP8Gpio();
gpio.subscribe(function(indices) {
  console.log(indices.map(function(i) {
    return {
      index: i,
      value: gpio[i]
    };
  }));
});
```

## building example site

To build a new copy of the example javascript export, open PICO-8 and run:

```console
load example.p8
export index.js
```

Then open index.html in a web browser.
