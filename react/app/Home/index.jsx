var React = require("react");
var Link = require("react-router").Link;
require("./style.css");
var Checkbox = require('react-checkbox');
var Progress = require('react-progressbar');
//var Progress = require('react-progress');
var YoutubeWrapper = require('../youtube-wrapper.js');

module.exports = React.createClass({
    render: function() {
	return ( 
	    <div>
	    <YoutubeWrapper  />
	    <h1> Hello world </h1>
	    <Checkbox checked={true} supportIntermediate={true} />
	    <Progress completed={true} />
	    <h2>Homepage</h2>
	    <p>This is the homepage.</p>
	    <p>Try to go to a todo list page:</p>
	    <ul>
	    <li><Link to="todolist" params={{list: "mylist"}}>mylist</Link></li>
	    <li><Link to="todolist" params={{list: "otherlist"}}>otherlist</Link></li>
	    </ul>
	    <p>Or try to switch to <Link to="some-page">some page</Link>.</p>
	    </div>
	);
    }
});
