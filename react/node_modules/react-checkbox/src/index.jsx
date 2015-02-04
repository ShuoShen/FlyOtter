'use strict';

var React  = require('react')
var assign = require('object-assign')
var hasOwn = function(obj, prop){
    return Object.prototype.hasOwnProperty.call(obj, prop)
}

function emptyFn(){}

module.exports = React.createClass({

    displayName: 'ReactCheckbox',

    propTypes: {
        nextValue: React.PropTypes.func,
        onChange : React.PropTypes.func,

        checked: React.PropTypes.any,
        defaultChecked: React.PropTypes.any,

        indeterminateValue: React.PropTypes.any,
        supportIndeterminate: React.PropTypes.bool
    },

    getDefaultProps: function() {
        return {
            stopPropagation     : true,
            indeterminateValue  : null,
            supportIndeterminate: false,

            nextValue: function(oldValue, props) {
                return oldValue === props.indeterminateValue?
                        //indeterminate -> checked
                        true:
                        oldValue === true?
                            // checked -> unchecked
                            false:
                            // unchecked -> indeterminate
                            props.indeterminateValue

            }
        }
    },

    getInitialState: function() {
        return {
            defaultChecked: this.props.defaultChecked
        }
    },

    render: function() {

        var props = this.prepareProps(this.props, this.state)

        return <input type='checkbox' {...props} checked={this.isChecked()}/>
    },

    componentDidMount: function() {
        this.checkIndeterminate()
    },

    componentDidUpdate: function() {
        this.checkIndeterminate()
    },

    checkIndeterminate: function() {
        if (this.props.supportIndeterminate){
            //it's not safe to store the prev indeterminate value
            //and only set it if isIndeterminate is different from prev indeterminate value
            //so we have to do this all the time
            this.getDOMNode().indeterminate = this.isIndeterminate()
        }
    },

    isIndeterminate: function() {
        var props         = this.props
        var checked       = this.getValue()
        var indeterminate = props.supportIndeterminate && checked === props.indeterminateValue

        return indeterminate === true
    },

    prepareProps: function(thisProps, state) {

        var props = {}

        assign(props, thisProps)

        props.onChange = this.handleChange

        return props
    },

    getValue: function() {
        var props = this.props

        return hasOwn(props, 'checked')?
                    props.checked:
                    this.state.defaultChecked
    },

    isChecked: function() {
        return this.getValue() || false
    },

    handleChange: function(event) {

        var value = event.target.checked
        var props = this.props

        if (props.supportIndeterminate){
            var oldValue = this.getValue()

            if (typeof props.nextValue == 'function'){
                value = props.nextValue(oldValue,
                //  {
                //     checked           : value,
                //     oldValue          : oldValue,
                //     indeterminateValue: props.indeterminateValue
                // },
                this.props)
            }
        }

        ;(props.onChange || emptyFn)(value, event)

        if (!hasOwn(props, 'checked')){
            this.setState({
                defaultChecked: value
            })
        }

        props.stopPropagation && event.stopPropagation()
    }
})