// test/env-1/jsx/a.jsx
/** @jsx React.DOM */

var HelloMessage = React.createClass({displayName: 'HelloMessage',
  render: function () {
    return React.createElement("div", null, 'Hello ' + this.props.name);
  }
});

React.renderComponent(React.createElement(HelloMessage, {name: "John"}), mountNode);
