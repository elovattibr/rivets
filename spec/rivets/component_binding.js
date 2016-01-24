describe('Component binding', function() {
  var scope, element, component, componentRoot

  beforeEach(function() {
    element = document.createElement('div');
    element.innerHTML = '<test></test>'
    componentRoot = element.firstChild
    scope = { name: 'Rivets' }
    component = rivets.components.test = {
      initialize: sinon.stub().returns(scope)
    }
  })

  it('renders "template" as a string', function() {
    rivets.components.test.template = '<h1>test</h1>'
    rivets.bind(element)

    componentRoot.innerHTML.should.equal(component.template)
  })

  it('allows not to pass "template" method', function() {
    componentRoot.innerHTML = '<b>{ name }</b>'
    rivets.bind(element)

    componentRoot.innerHTML.should.equal('<b>' + scope.name + '</b>')
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

    it('returns attributes assigned to "static" property as they are', function() {
      var type = 'text'

      component.static = ['type']
      componentRoot.setAttribute('type', type)
      rivets.bind(element, locals)

      component.initialize.calledWith(componentRoot, { item: locals.object, type: type }).should.be.true
    })

    describe('when "requires" option is specified for component', function() {
      var anotherScope, anotherComponent

      beforeEach(function() {
        componentRoot.innerHTML = '<another></another>'
        anotherScope = {}
        anotherComponent = rivets.components.another = {
          requires: 'test',
          initialize: sinon.stub().returns(anotherScope)
        }
      })

      it('receives dependencies as third argument', function() {
        rivets.bind(element)

        anotherComponent.initialize.getCall(0).args[2].should.eql({ test: scope })
      })

      it('throws exception if cannot find specified dependency', function() {
        anotherComponent.requires = 'test2'

        rivets.bind.bind(null, element).should.throw(Error)
      })
    })
  })

  describe('when "template" is a function', function() {
    it('receives view scope as first argument', function() {
      component.template = sinon.spy()
      rivets.bind(element)

      component.template.calledWith(scope).should.be.true
    })

    it('renders returned string as component template', function() {
      component.template = sinon.stub().returns('<h1>{ name }</h1>')
      rivets.bind(element)

      componentRoot.innerHTML.should.equal('<h1>' + scope.name + '</h1>')
    })

    it('renders returned DOM fragment as component template', function() {
      var fragment = document.createDocumentFragment()
      var title = document.createElement('h1')

      title.innerHTML = '{ name }'
      fragment.appendChild(title)
      component.template = sinon.stub().returns(fragment)
      rivets.bind(element)

      componentRoot.innerHTML.should.equal('<h1>' + scope.name + '</h1>')
    })
  })
})
