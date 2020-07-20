function debounce(func, wait, immediate) {
  var timeout;
  return function() {
    var context = this, args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    }, wait);
    if (immediate && !timeout) func.apply(context, args);
  };
}

function throttle(func, timeFrame) {
  var lastTime = 0;
  return function () {
      var now = new Date();
      if (now - lastTime >= timeFrame) {
          func();
          lastTime = now;
      }
  };
}

module.exports = {
  debounce,
  throttle,
};
