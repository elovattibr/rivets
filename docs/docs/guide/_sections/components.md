Components let you define reusable views that can be used within any of your templates. For some perspective on where components fit into your templates in relation to binders; binders define custom attributes, while components define custom elements.

A component object can define a `template` function, which returns the template for the component (this can be an HTML string or the actual element or even document fragment). It must also define an `initialize` function, which returns the scope object to bind the view with (this will likely be a controller / viewmodel / presenter).

```javascript
rivets.components['todo-item'] = {
  // Return the template for the component.
  template: function() {
    return JST['todos/todo-item']
  },

  // Takes the original element and the data that was passed into the
  // component (either from rivets.init or the attributes on the component
  // element in the template).
  initialize: function(el, data) {
    return new ItemController({
      item: data.item
    })
  }
}
```

To use the component inside of a template, simply use an element with the same tag name as the component's key. All attributes on the element will get evaluated as keypaths before being passed into the component's `initialize` function.

```html
<todo-item item="myItem"></todo-item>
```

These keypaths will also be observed in both directions so that the component will update if the value changes from the outside and it will set the value if the component changes it from the inside.

Additionally, if you want certain attributes to be static instead of an observed keypath, you can list them out on the `static` property fo your components.

```javascript
rivets.components['todo-item'] = {
  static: ['list-style'],
  …
}
```

```html
<todo-item item="myItem" list-style="condensed"></todo-item>
```

By the way `template` method accepts created (inside `initialize` method) controller, so then it's possible to decide which template to use depends on specified attributes.

```js
rivets.components['form-field'] = {
  static: ['type'],

  template: function(formField) {
    return JST['form-fields/' + formField.type]
  },

  initialize: function(el, data) {
    return new FormField(data)
  }
}
```

And use it like this:

```html
<form-field type="number" value="user.age"></form-field>

<form-field type="date-picker" value="user.createdAt"></form-field>
```

Further more, it's possible to create dependent components as `tabset`. In order to include parent component, just specify its name inside `requires` option of the component and it will be accessible in third argument of component's `initialize` method (in order to include few different parent components pass an array to `requires` option). If dependency is not found, exception will be thrown

```js
rivets.components.tab = {
  requires: 'tabset',

  initialize: function(el, attributes, dependencies) {
    var tab = new Tab(attributes)

    dependencies.tabset.addTab(tab)

    return tab;
  }
}
```

Components transclusion is something that helps to extend components' templates. In order to use transclusion it's required to specify `transclude: boolean | object` option on the component.

```js
rivets.components.pane = {
  transclude: true,

  template: `
    <div class="panel">
      <div rv-transclude="title" class="panel-heading">{ title }</div>
      <div rv-transclude="body" class="panel-body">{ body }</div>
    </div>
  `

  ...
}
```

Then lets specify custom heading for our `pane` component:

```html
<pane>
  <h3 block-name="title"><i class="glyphicon-ok"></i> { title }</h3>
</pane>
```

It's possible to overwrite default block name attribute (i.e. `block-name`):

```js
  rivets.binders.transclude.blockNameAttribute = 'data-block'
```

It's also possible to define custom CSS selectors for template's blocks. For this, just specify `translude` option as object:
```js
rivets.components.pane = {
  transclude: {
    title: 'pane-title' // supports any CSS selector
  }

  ...
}
```

```html
<pane>
  <pane-title><i class="glyphicon-ok"></i> { title }</pane-title>
</pane>
```

By default, specified block will replace all the children of existing one but this behavior can be customized by rewriting `rivets.binders.transclude.injectPart` method. For example, lets replace the whole part

```js
rivets.binders.transclude.injectPart = function(partElement, existingElement) {
  existingElement.parentNode.replaceChild(partElement, existingElement)
}
```


Components can also be initialized on their own, outside of a template. This is useful when you want to insert a new view into the DOM yourself, such as the entry point to your entire application or the content of a modal. The API is similar to `rivets.bind`, except that instead of passing it an actual template / element, you just pass it the name of the component and the root element you want the component to render in.

```
rivets.init('my-app', $('body'), {user: user})
```

```
rivets.init('todo-item', $('#modal-content'), {item: myItem})
```
