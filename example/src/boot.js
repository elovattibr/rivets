(function() {
  'use strict';

  rivets.binders['style-*'] = function(el, value) {
    el.style[this.args[0]] = value;
  };

  var user = {
    name: 'Test it',

    config: {
      notifications: true,
      autoBrightness: false,
      dataRoaming: false
    }
  };

  rivets.bind(document.documentElement, { user: user });
})();
