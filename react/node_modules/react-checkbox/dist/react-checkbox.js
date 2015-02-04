(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("React"));
	else if(typeof define === 'function' && define.amd)
		define(["React"], factory);
	else if(typeof exports === 'object')
		exports["ReactCheckbox"] = factory(require("React"));
	else
		root["ReactCheckbox"] = factory(root["React"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_1__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/** @jsx React.DOM */'use strict';

	var React  = __webpack_require__(1)
	var assign = __webpack_require__(2)
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

	        return React.createElement("input", React.__spread({type: "checkbox"},  props, {checked: this.isChecked()}))
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

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_1__;

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	function ToObject(val) {
		if (val == null) {
			throw new TypeError('Object.assign cannot be called with null or undefined');
		}

		return Object(val);
	}

	module.exports = Object.assign || function (target, source) {
		var from;
		var keys;
		var to = ToObject(target);

		for (var s = 1; s < arguments.length; s++) {
			from = arguments[s];
			keys = Object.keys(Object(from));

			for (var i = 0; i < keys.length; i++) {
				to[keys[i]] = from[keys[i]];
			}
		}

		return to;
	};


/***/ }
/******/ ])
});
