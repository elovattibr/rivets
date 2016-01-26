(function() {
  'use strict';

  rivets.components.progressbar = {
    static: ['progress'],

    template: `
      <div class="progress">
        <span class="meter blue" rv-style-width="progressbar.progress">
          <p class="percent">{ progressbar.progress }</p>
        </span>
      </div>
    `,

    initialize: function(el, attrs) {
      return { progress: attrs.progress + '%' };
    }
  }
})();
