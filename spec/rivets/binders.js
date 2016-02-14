describe("Rivets.binders", function() {
  var context

  beforeEach(function() {
    context = {
      publish: function() {}
    }
  })

  describe("value", function() {
    var el

    beforeEach(function() {
      el = document.createElement('input')
    })

    it("unbinds the same bound function", function() {
      var boundFn

      sinon.stub(el, 'addEventListener', function(event, fn) {
        boundFn = fn
      })

      rivets.binders.value.bind.call(context, el)

      sinon.stub(el, 'removeEventListener', function(event, fn) {
        fn.should.equal(boundFn)
      })

      rivets.binders.value.unbind.call(context, el)
    })
  })

  describe("each-*", function() {
    var fragment, el, model, view;

    beforeEach(function() {
      fragment = document.createDocumentFragment();
      el = document.createElement("li");
      el.setAttribute("rv-each-item", "items");
      el.setAttribute("rv-text", "item.val");
      el.setAttribute("rv-index", "index");

      fragment.appendChild(el);

      model = { items: [{val: 0},{val: 1},{val: 2}] };
      view = rivets.bind(fragment, model);
    });

    it("binds to the model creating a list item for each element in items", function() {
      // one child for each element in the model plus 1 for the comment placeholder
      Should(fragment.childNodes.length).be.exactly(model.items.length + 1);
    });

    it("reflects changes to the model into the DOM", function() {
      Should(fragment.childNodes[1].textContent).be.exactly("0");

      model.items[0].val = "howdy";
      Should(fragment.childNodes[1].textContent).be.exactly("howdy");
    });

    it("reflects changes to the model into the DOM after unbind/bind", function() {
      Should(fragment.childNodes[1].textContent).be.exactly("0");

      view.unbind();
      view.bind();
      model.items[0].val = "howdy";
      Should(fragment.childNodes[1].textContent).be.exactly("howdy");
    });

    it("lets you push an item", function() {
      var originalLength  = model.items.length;

      // one child for each element in the model plus 1 for the comment placeholder
      Should(fragment.childNodes.length).be.exactly(model.items.length + 1);

      model.items.push({val: 3});
      Should(model.items.length).be.exactly(originalLength + 1);
      Should(fragment.childNodes.length).be.exactly(model.items.length + 1);
    });

    it("lets you push an item after unbind/bind", function() {
      var originalLength  = model.items.length;

      // one child for each element in the model plus 1 for the comment placeholder
      Should(fragment.childNodes.length).be.exactly(model.items.length + 1);

      view.unbind();
      view.bind();

      model.items.push({val: 3});
      Should(model.items.length).be.exactly(originalLength + 1);
      Should(fragment.childNodes.length).be.exactly(model.items.length + 1);
    });

    it("removes related view when an item is removed", function() {
      fragment.childNodes[2].id = 'second';
      model.items.splice(1, 1);

      fragment.childNodes.should.have.length(model.items.length + 1);
      fragment.childNodes[2].id.should.be.empty;
    });

    it("updates index of all other views when an item is removed", function() {
      model.items.shift();

      var nodeIds = Array.prototype.slice.call(fragment.childNodes, 1).map(function(element) {
        return element.getAttribute('index') + '-' + element.textContent;
      });

      var itemIds = model.items.map(function(model, index) {
        return index + '-' + model.val;
      });

      nodeIds.should.eql(itemIds);
    });
  });

  describe("nested-each-*", function() {
    var fragment;
    var el;
    var nestedEl;
    var model;

    beforeEach(function() {
      fragment = document.createDocumentFragment();
      el = document.createElement("span");
      el.setAttribute("rv-each-item", "items");
      nestedEl = document.createElement("span");
      nestedEl.setAttribute("rv-each-nested", "item.val");
      nestedEl.textContent = "{%item%}-{%nested%}";
      el.appendChild(nestedEl);
      fragment.appendChild(el);

      model = { items: [{val: [{val: 0},{val: 1}]},{val: [{val: 2},{val: 3}]},{val: [{val: 4},{val: 5}]}] };
    });

    it("lets you get all the indexes", function() {
      var view = rivets.bind(el, model);

      Should(fragment.childNodes[1].childNodes[1].textContent).be.exactly('0-0');
      Should(fragment.childNodes[1].childNodes[2].textContent).be.exactly('0-1');
      Should(fragment.childNodes[2].childNodes[2].textContent).be.exactly('1-1');
    });
  });

  describe("if", function() {
    var fragment;
    var el;
    var model;

    beforeEach(function() {
      fragment = document.createDocumentFragment();
      el = document.createElement("div");
      el.setAttribute("rv-if", "data.show");
      el.innerHTML = "{ data.count }";

      fragment.appendChild(el);

      model = { data: {
        show: true,
        count: 1
      } };
    });

    it("shows element with bound key inside if the value is true", function() {
      var view = rivets.bind(fragment, model);

      // one child for the original div plus 1 for the comment placeholder
      Should(fragment.childNodes.length).be.exactly(2);
      Should(fragment.childNodes[1].innerHTML).be.exactly("1");
    });

    it("hides if the value is false", function() {
      var view = rivets.bind(fragment, model);

      model.data.show = false;

      // 1 for the comment placeholder
      Should(fragment.childNodes.length).be.exactly(1);
    });

    it("keeps binding when element becomes visible again", function() {
      var view = rivets.bind(fragment, model);

      model.data.show = false;
      model.data.count = 2;
      model.data.show = true;

      // one child for the original div plus 1 for the comment placeholder
      Should(fragment.childNodes.length).be.exactly(2);
      Should(fragment.childNodes[1].innerHTML).be.exactly("2");
    });

    it("hides if the value is falsey - zero", function() {
      var view = rivets.bind(fragment, model);

      model.data.show = 0;
      // 1 for the comment placeholder
      Should(fragment.childNodes.length).be.exactly(1);
    });

    it("hides if the value is falsey - empty string", function() {
      var view = rivets.bind(fragment, model);

      model.data.show = "";
      // 1 for the comment placeholder
      Should(fragment.childNodes.length).be.exactly(1);
    });

    it("hides if the value is falsey - undefined", function() {
      var view = rivets.bind(fragment, model);

      model.data.show = undefined;
      // 1 for the comment placeholder
      Should(fragment.childNodes.length).be.exactly(1);
    });
  });

  describe("Custom binder with no attribute value", function() {
    rivets.binders["custom-binder"] = function(el, value) {
      el.innerHTML = "received " + value;
    };
    beforeEach(function() {
      fragment = document.createDocumentFragment();
      el = document.createElement("div");

      fragment.appendChild(el);

      model = {};
    });

    it("receives undefined when html attribute is not specified", function() {
      el.innerHTML = "<div rv-custom-binder></div>";
      var view = rivets.bind(fragment, model);
      Should(el.children[0].innerHTML).be.exactly('received undefined');
    });
    it("receives undefined when html attribute is not specified", function() {
      el.innerHTML = "<div rv-custom-binder=''></div>";
      var view = rivets.bind(fragment, model);
      Should(el.children[0].innerHTML).be.exactly('received undefined');
    });
  });
});
