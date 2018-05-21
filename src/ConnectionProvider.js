import React, { Component } from 'react';
import PropTypes from 'prop-types';
import RequestStateHandler from './RequestStateHandler';
import { getConnectionContext } from './ConnectionContext';

const ConnectionContext = getConnectionContext();

class ConnectionProvider extends Component {
  constructor(props) {
    super(props);

    const requestStateHandler = new RequestStateHandler();

    this.state = {
      ...requestStateHandler.getCurrentState(),
    };

    requestStateHandler.addStateChangeListener(this.updateRequestState);
  }

  updateRequestState = (updatedState) => {
    this.setState({
      ...updatedState,
    });
  }

  render() {
    return (
      <ConnectionContext.Provider value={this.state}>
        {this.props.children}
      </ConnectionContext.Provider>
    );
  }
}

ConnectionProvider.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
};

export {
  ConnectionProvider,
  ConnectionContext,
};
