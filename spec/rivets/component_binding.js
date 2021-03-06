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

  it('allows to acccess own controller by name of the component', function() {
    componentRoot.innerHTML = '{ test.name }'
    rivets.bind(element)

    componentRoot.innerHTML.should.equal(scope.name)
  })

  it('renders "template" as a string', function() {
    rivets.components.test.template = '<h1>test</h1>'
    rivets.bind(element)

    componentRoot.innerHTML.should.equal(component.template)
  })

  it('allows not to pass "template" method', function() {
    componentRoot.innerHTML = '<b>{ test.name }</b>'
    rivets.bind(element)

    componentRoot.innerHTML.should.equal('<b>' + scope.name + '</b>')
  })

  it('has access to parent model', function() {
    var parent = { title: 'Test' }
    componentRoot.innerHTML = '{ title }: { test.name }'
    rivets.bind(element, parent)

    componentRoot.innerHTML.should.equal(parent.title + ': ' + scope.name)
  })

  it('allows to access own controller via property specified in "as" option', function() {
    component.as = 'component'
    componentRoot.innerHTML = '{ component.name }'
    rivets.bind(element)

    componentRoot.innerHTML.should.equal(scope.name)
  })

  describe('initialize()', function() {
    var locals

    beforeEach(function() {
      locals = { object: { name: 'Rivets locals' } }
    })

    it('receives element as first argument', function() {
      rivets.bind(element, locals)

      component.initialize.calledWith(componentRoot).should.be.true
    })

    it('receives element attributes as second argument', function() {
      componentRoot.setAttribute('item', 'object')
      rivets.bind(element)

      component.initialize.calledWith(componentRoot, { item: 'object' }).should.be.true
    })

    describe('when has attributes', function() {
      beforeEach(function() {
        locals.name = 'John'
      })

      it('parses value of attributes which name ends with ".bind"', function() {
        componentRoot.setAttribute('name.bind', 'name')
        rivets.bind(element, locals)

        component.initialize.calledWith(componentRoot, { name: 'John' }).should.be.true
      })

      it('passes value of attributes as it is', function() {
        componentRoot.setAttribute('type', 'text')
        rivets.bind(element)

        component.initialize.calledWith(componentRoot, { type: 'text' }).should.be.true
      })
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

  describe('bind()', function() {
    it('receives element as first argument and controller as second', function() {
      component.bind = sinon.spy()
      rivets.bind(element)

      component.bind.calledWith(componentRoot, scope).should.be.true
    })

    it('is called after template is rendered', function() {
      component.template = '<b>test</b>'
      component.bind = function(el) {
        el.querySelector('b').setAttribute('data-exist', 'true')
      }
      rivets.bind(element)

      componentRoot.querySelector('b').getAttribute('data-exist').should.equal('true')
    })
  })

  describe('when "template" is a function', function() {
    it('receives view scope as first argument', function() {
      component.template = sinon.spy()
      rivets.bind(element)

      component.template.calledWith(scope).should.be.true
    })

    it('renders returned string as component template', function() {
      component.template = sinon.stub().returns('<h1>{ test.name }</h1>')
      rivets.bind(element)

      componentRoot.innerHTML.should.equal('<h1>' + scope.name + '</h1>')
    })

    it('renders returned DOM fragment as component template', function() {
      var fragment = document.createDocumentFragment()
      var title = document.createElement('h1')

      title.innerHTML = '{ test.name }'
      fragment.appendChild(title)
      component.template = sinon.stub().returns(fragment)
      rivets.bind(element)

      componentRoot.innerHTML.should.equal('<h1>' + scope.name + '</h1>')
    })
  })

  describe('when "transclude" option equals "true"', function() {
    beforeEach(function() {
      component.transclude = true
      component.template = '<label>Field</label>: <span rv-transclude="">Value</span>'
      componentRoot.innerHTML = '<b rv-text="test.title"></b>'
      scope.title = 'Rivets transclusion!'
    })

    it('replaces "rv-transclude" element with content of the component', function() {
      rivets.bind(element)

      componentRoot.querySelector('b[rv-text]').should.exist
    })

    it('leaves "rv-transclude" element as it is if no content is provided for the component', function() {
      componentRoot.innerHTML = ''
      rivets.bind(element)

      componentRoot.innerHTML.should.equal(component.template)
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
      componentRoot.innerHTML = '<b block-name="label">{ test.label }</b>'
      rivets.bind(element)
      var compiledTemplate = component.template.replace('Field', '<b block-name="label">' + scope.label + '</b>')

      componentRoot.innerHTML.should.equal(compiledTemplate)
    })

    it('looks for blocks only inside direct children', function() {
      componentRoot.innerHTML = '<b block-name="value">{ test.value }</b><another-one><b block-name="label">{ test.label }</b></another-one>'
      rivets.bind(element)
      var compiledTemplate = component.template.replace('Value', '<b block-name="value">' + scope.value + '</b>')

      componentRoot.innerHTML.should.equal(compiledTemplate)
    })

    it('searches block by specified alias in "transclusion" option', function() {
      component.transclude = { value: 'value' }
      componentRoot.innerHTML = '<value>{ test.value }</value>'
      rivets.bind(element)
      var compiledTemplate = component.template.replace('Value', '<value>' + scope.value + '</value>')

      componentRoot.innerHTML.should.equal(compiledTemplate)
    })
  })
})
