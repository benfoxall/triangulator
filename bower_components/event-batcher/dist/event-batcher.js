(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.eventBatcher = global.eventBatcher || {})));
}(this, (function (exports) { 'use strict';

// get some sort of timestamp
var now = (function(){

  // node
  if(typeof window == 'undefined') { return Date.now }

  var perf = window.performance
  return (perf && perf.now && perf.now.bind(perf))
    || Date.now
    || (function (_) { return new Date().getTime(); })

})()


var encode = function (millis) {

  var handlers = []
  var events = []
  var off = 0

  var flush = function () {
    handlers.forEach( function (handler) { return handler(events); })
    events = []
  }

  var collector = function (event) {
    if(!events.length){
      off = now()
      setTimeout(flush, millis)
    }


    events.push({
      t: ~~(now() - off),
      e: event
    })

  }

  collector.handle = function (fn) { return handlers.push(fn); }


  return collector
}


var decode = function (millis) {

  var handlers = []
  var queue = []

  var trigger = function (data) {
    handlers.forEach( function (h) { return h(data); })
  }

  var polling = false

  var processor = function (data) {

    // naive approach here, don't need so many timers
    // data.forEach( function (b) {
    //   setTimeout(trigger, b.t, b.e)
    // })
    // queue.push(b)

    var n = now()
    data.forEach( b => {
      queue.push([
        b.t + n, b.e
      ])
    })

    if(!polling) {
      polling = true
      requestAnimationFrame(poll)
    }

  }

  function poll(n){

    while(queue.length && (queue[0][0] < n)) {
      trigger(queue.shift()[1])
    }

    if(queue.length) requestAnimationFrame(poll)
    else polling = false

  }

  processor.handle = function (fn) { return handlers.push(fn); }

  return processor
}

exports.encode = encode;
exports.decode = decode;

Object.defineProperty(exports, '__esModule', { value: true });

})));
