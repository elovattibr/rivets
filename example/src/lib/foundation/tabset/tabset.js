(function() {
  'use strict';

  class Tabset {
    constructor() {
      this.tabs = []
      this.selectTab = this.selectTab.bind(this);
    }

    addTab(tab) {
      if (this.tabs.length === 0) {
        this.activeTab = tab;
      }
      this.tabs.push(tab);
    }

    selectTab(e, context) {
      this.activeTab = context.tab;
    }
  }

  rivets.components.tabset = {
    transclude: true,

    template: `
      <ul class="tabs">
        <li rv-each-tab="tabset.tabs" rv-class-active="tabset.activeTab | eq tab" class="tab-title">
          <a rv-on-click="tabset.selectTab">{ tab.title }</a>
        </li>
      </ul>
      <div rv-transclude class="tabs-content"></div>
    `,

    initialize: function() {
      return new Tabset();
    }
  };
})();
