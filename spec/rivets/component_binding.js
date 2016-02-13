describe('Component binding', function() {
  var scope, element, component, componentRoot

  beforeEach(function() {
    element = document.createElement('div')
    element.innerHTML = '<test></test>'
    componentRoot = element.firstChild
    scope = { name: 'Rivets' }
    component = rivets.components.test = {
      initialize: sinon.stub().returns(scope),
      template: function() {}
    }
  })

  it('renders "template" as a string', function() {
    rivets.components.test.template = function() {return '<h1>test</h1>'}
    rivets.bind(element)

    componentRoot.innerHTML.should.equal(component.template())
  })

  describe('controller()', function() {
    var locals

    beforeEach(function() {
      locals = { name: 'controller' }
      componentRoot.setAttribute('title', 'name')
      component.controller = sinon.stub().returns(scope)
    })

    it('receives passed attributes as first argument', function() {
      rivets.bind(element, locals)

      component.controller.calledWith({ title: locals.name }).should.be.true
    })

    it('is available inside view under name of the component', function() {
      component.template = sinon.stub().returns('{ test.name }')
      rivets.bind(element, locals)

      componentRoot.innerHTML.should.equal(scope.name)
    })

    it('is available inside view under name specified in "as" attribute', function() {
      component.as = 'custom'
      component.template = sinon.stub().returns('{ custom.name }')
      rivets.bind(element, locals)

      componentRoot.innerHTML.should.equal(scope.name)
    })

    it('synchronizes changes in attributes with returned controller', function() {
      rivets.bind(element, locals)
      locals.name = 'another name'

      scope.title.should.equal(locals.name)
    })

    it('synchronizes changes in controller with parent models', function() {
      rivets.bind(element, locals)
      scope.title = 'another title'

      locals.name.should.equal(scope.title)
    })
  })

  describe('initialize()', function() {
    var locals

    beforeEach(function() {
      locals = { object: { name: 'Rivets locals' } }
      componentRoot.setAttribute('item', 'object')
    })

    it('receives element as first argument and attributes as second', function() {
      rivets.bind(element, locals)

      component.initialize.calledWith(componentRoot, { item: locals.object }).should.be.true
    })

    it('receives primitives attributes', function() {
      componentRoot.setAttribute('primitivestring', "'value'")
      componentRoot.setAttribute('primitivenumber', "42")
      componentRoot.setAttribute('primitiveboolean', "true")
      rivets.bind(element, locals)

      component.initialize.calledWith(componentRoot, { item: locals.object,
        primitivestring: 'value',
        primitivenumber: 42,
        primitiveboolean: true })
      .should.be.true
    })

    it('returns attributes assigned to "static" property as they are', function() {
      var type = 'text'

      component.static = ['type']
      componentRoot.setAttribute('type', type)
      rivets.bind(element, locals)

      component.initialize.calledWith(componentRoot, { item: locals.object, type: type }).should.be.true
    })
  })

  describe('when "template" is a function', function() {
    it('renders returned string as component template', function() {
      component.template = sinon.stub().returns('<h1>{ name }</h1>')
      rivets.bind(element)

      componentRoot.innerHTML.should.equal('<h1>' + scope.name + '</h1>')
    })
  })

})
