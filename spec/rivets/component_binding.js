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

  describe('when "transclude" option equals "true"', function() {
    beforeEach(function() {
      component.transclude = true
      component.template = '<label>Field</label>: <span rv-transclude>Value</span>'
      componentRoot.innerHTML = '<b rv-text="title"></b>'
      scope.title = 'Rivets transclusion!'
    })

    it('replaces "rv-transclude" element with content of the component', function() {
      rivets.bind(element)

      componentRoot.querySelector('b[rv-text]').should.exist
      Boolean(componentRoot.querySelector('span[rv-transclude]')).should.be.false
    })

    it('leaves "rv-transclude" element as it is if no content is provided for the component', function() {
      componentRoot.innerHTML = ''
      rivets.bind(element)

      componentRoot.querySelector('span[rv-transclude]').should.exist
    })

    it('assignes view scope of the component to transcluded part', function() {
      rivets.bind(element)

      componentRoot.querySelector('b[rv-text]').innerHTML.should.equal(scope.title)
    })

    it('processes bindings of trunscluded part', function() {
      rivets.bind(element)
      scope.title = 'test me'

      componentRoot.querySelector('b[rv-text]').innerHTML.should.equal(scope.title)
    })

    it('clears transclusion part when component is cleared', function() {
      var view = rivets.bind(element)
      var originalTitle = scope.title

      view.unbind()
      scope.title = 'new value'

      componentRoot.querySelector('b[rv-text]').innerHTML.should.equal(originalTitle)
    })
  })

  describe('multiple trunsclusion', function() {
    beforeEach(function() {
      component.transclude = true
      component.template = '<label rv-transclude="label">Field</label>: <span rv-transclude="value">Value</span>'
      scope.value = 'Rivets multiple transclusion!'
      scope.label = 'Greeting'
    })

    it('does not replace parts if content of component does not contain blocks', function() {
      componentRoot.innerHTML = '<strong>nothing</strong>'
      rivets.bind(element)

      componentRoot.innerHTML.should.equal(component.template)
    })

    it('replaces only specified part of component template', function() {
      componentRoot.innerHTML = '<b block-name="label">{ label }</b>'
      rivets.bind(element)
      var compiledTemplate = component.template.replace('<label rv-transclude="label">Field</label>', '<b block-name="label">' + scope.label + '</b>')

      componentRoot.innerHTML.should.equal(compiledTemplate)
    })

    it('looks for blocks only inside direct children', function() {
      componentRoot.innerHTML = '<b block-name="value">{ value }</b><another-one><b block-name="label">{ label }</b></another-one>'
      rivets.bind(element)
      var compiledTemplate = component.template.replace('<span rv-transclude="value">Value</span>', '<b block-name="value">' + scope.value + '</b>')

      componentRoot.innerHTML.should.equal(compiledTemplate)
    })

    it('searches block by specified alias in "transclusion" option', function() {
      component.transclude = { value: 'value' }
      componentRoot.innerHTML = '<value>{ value }</value>'
      rivets.bind(element)
      var compiledTemplate = component.template.replace('<span rv-transclude="value">Value</span>', '<value>' + scope.value + '</value>')

      componentRoot.innerHTML.should.equal(compiledTemplate)
    })
  })
})
