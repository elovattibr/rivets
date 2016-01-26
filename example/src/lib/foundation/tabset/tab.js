(function() {
  'use strict';

  class Tab {
    constructor(attrs) {
      this.title = attrs.title;
    }
  }

  rivets.components.tab = {
    static: ['title'],

    transclude: true,

    requires: 'tabset',

    template: `<div rv-transclude rv-class-active="tabset.activeTab | eq tab" class="content"></div>`,

    initialize: function(el, locals, deps) {
      var tab = new Tab(locals);

      deps.tabset.addTab(tab);

      return tab;
    }
  };
})();
