'use strict';

var React = require('react')
var Check  = require('./src')

var checked = null

function nextValue(value, oldValue, info){
    if (oldValue === true){
        //from checked to indeterminate
        return null
    }

    if (oldValue === null){
        //from  indeterminate to unchecked
        return false
    }

    if (oldValue === false){
        return true
    }
}

var App = React.createClass({

    onChange: function(value){

        if (value && value.target){
            value = value.target.checked
        }

        checked = value

        this.setState({})
    },

    onClick: function() {
        console.log('clicked')
        this.setState({})
    },

    render: function() {
        return (
            <form className="App" style={{padding: 20}} onClick={this.onClick}>
                <Check supportIndeterminate={true} checked={checked} onChange={this.onChange}/>checked
                <input type="checkbox" checked={checked} onChange={this.onChange}/>
            </form>
        )
    }
})

React.render(<App />, document.getElementById('content'))