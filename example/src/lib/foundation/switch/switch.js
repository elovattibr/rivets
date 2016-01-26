(function() {
  'use strict';

  var count = 0;
  rivets.components['switch-button'] = {
    template: `
      <div class="switch round">
        <input rv-id="switchButton.uniqId" type="checkbox" rv-checked="switchButton.checked">
        <label rv-for="switchButton.uniqId"></label>
      </div>
    `,

    bind: function(el) {
      var observer = this.observers.checked;

      if (observer) {
        el.querySelector('input').addEventListener('change', function() {
          observer.setValue(this.checked);
        })
      }
    },

    initialize: function(el, attrs) {
      return {
        uniqId: 'switch-' + (++count),
        checked: attrs.checked
      }
    }
  }
})();
