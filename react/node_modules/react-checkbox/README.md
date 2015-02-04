# react-checkbox

React Checkbox

> A React checkbox with support for the indeterminate state.

## Install

```sh
$ npm i --save react-checkbox
```

## Usage

```jsx
var Checkbox = require('react-checkbox')
var checked = null

React.render(
    <Checkbox checked={checked} supportIntermediate={true} />,
    document.body
)
```


## Props

 * `checked`: Boolean/Null - whether the checkbox should be checked or not. If `supportIntermediate` is true, the `checked` property can also have another value, which should equal to `indeterminateValue` prop (which defaults to null)
 * `supportIndeterminate`: Boolean - whether the checkbox should support the indeterminate state. Defaults to false.
 * `indeterminateValue` - the value for `checked` that should render the checkbox as indeterminate. Defaults to null
 * `stopPropagation`: Boolean - whether to stop `change` event propagation for the checkbox. Defaults to true.
 * `onChange`: Function(value, event) - The function to call when the state of the checkbox changes. **NOTE:** Unlike `<input type="checkbox" />`, first param is the new value, and second param is the event object.
 * `defaultChecked` - uncontrolled version of `checked`
 * `nextValue`: Function(oldValue, props) - can be used to change the default value order (when `supportIndeterminate` is `true`). Default order is: (`checked -> unchecked; unchecked -> indeterminate; indeterminate -> checked`).

## Other

If you want support for submitting the indeterminate value, and for specifying what to submit on each state, I suggest you take a look at [react-check3](https://github.com/radubrehar/react-check3)