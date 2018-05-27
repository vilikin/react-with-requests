import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { connectContext } from 'react-connect-context';

import { getConnectionContext } from './ConnectionContext';
import RequestStateHandler from './RequestStateHandler';

const ConnectionContext = getConnectionContext();

class ConnectedComponent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      requests: [],
    };

    const requestInstancesObject = this.props.requests(this.props);
    this.componentWillReceiveRequestInstances(requestInstancesObject, true);
  }

  componentWillReceiveProps(nextProps) {
    const requestInstancesObject = nextProps.requests(nextProps);
    this.componentWillReceiveRequestInstances(requestInstancesObject, false);
  }

  getRequestsAsProps = () => {
    const requestsFromState = this.state.requests;
    let requestsFromContext = this.props.__requestState__;

    const isRequestInContext = ({ id }) => _.some(requestsFromContext, { id });
    const allRequestsInContext = _.every(requestsFromState, isRequestInContext);

    if (!allRequestsInContext) {
      requestsFromContext = this.props.__requestStateHandler__.getCurrentState();
    }

    return _.chain(requestsFromContext)
      .reduce((result, reqFromContext) => {
        const matchFromState = _.find(this.state.requests, { id: reqFromContext.id });
        if (matchFromState) {
          result.push(_.assign(reqFromContext, { name: matchFromState.name }));
        }

        return result;
      }, [])
      .keyBy('name')
      .mapValues(request => _.pick(request, 'result', 'loading', 'error'))
      .value();
  }

  componentWillReceiveRequestInstances = (nextRequestInstancesObject, useStateDirectly) => {
    const previousRequestInstances = _.map(this.state.requests, 'requestInstance');
    const nextRequestInstances = _.values(nextRequestInstancesObject);

    if (_.isEqual(previousRequestInstances, nextRequestInstances)) {
      return;
    }

    const addedRequestInstances = _.differenceWith(
      nextRequestInstances,
      previousRequestInstances,
      (req1, req2) => req1.equals(req2),
    );

    const removedRequestInstances = _.differenceWith(
      previousRequestInstances,
      nextRequestInstances,
      (req1, req2) => req1.equals(req2),
    );

    if (_.isEmpty(addedRequestInstances) && _.isEmpty(removedRequestInstances)) {
      return;
    }

    const remainingRequests = this.state.requests.filter(({ requestInstance }) =>
      !removedRequestInstances.includes(requestInstance));

    const requestStateHandler = this.props.__requestStateHandler__;

    const newRequests = requestStateHandler.makeMultipleRequests(addedRequestInstances);

    const newRequestsWithNames = _.transform(nextRequestInstancesObject, (result, value, key) => {
      const matchingNewRequest = _.find(newRequests, { requestInstance: value });
      if (matchingNewRequest) {
        result.push({
          ...matchingNewRequest,
          name: key,
        });
      }
    }, []);

    const requestsToState = [
      ...newRequestsWithNames,
      ...remainingRequests,
    ];

    if (useStateDirectly) {
      this.state.requests = requestsToState;
    } else {
      this.setState({
        requests: requestsToState,
      });
    }
  }

  render() {
    return this.props.children({
      ...this.getRequestsAsProps(),
    });
  }
}

ConnectedComponent.propTypes = {
  children: PropTypes.func.isRequired,

  requests: PropTypes.func.isRequired,

  __requestState__: PropTypes.arrayOf(PropTypes.object).isRequired,

  __requestStateHandler__: PropTypes.instanceOf(RequestStateHandler).isRequired,
};

export default connectContext(ConnectionContext.Consumer)(ConnectedComponent);
