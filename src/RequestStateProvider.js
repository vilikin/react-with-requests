import React, { Component } from 'react';
import PropTypes from 'prop-types';
import RequestStateHandler from './RequestStateHandler';
import { getRequestStateContext } from './RequestStateContext';

const { Provider } = getRequestStateContext();

class RequestStateProvider extends Component {
  constructor(props) {
    super(props);

    const requestStateHandler = new RequestStateHandler();

    this.state = {
      // eslint-disable-next-line react/no-unused-state
      __requestState__: requestStateHandler.getCurrentState(),
      // eslint-disable-next-line react/no-unused-state
      __requestStateHandler__: requestStateHandler,
    };

    requestStateHandler.addStateChangeListener(this.updateRequestState);
  }

  updateRequestState = (updatedState) => {
    this.setState({
      // eslint-disable-next-line react/no-unused-state
      __requestState__: updatedState,
    });
  }

  render() {
    return (
      <Provider value={this.state}>
        {this.props.children}
      </Provider>
    );
  }
}

RequestStateProvider.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
};

export default RequestStateProvider;
