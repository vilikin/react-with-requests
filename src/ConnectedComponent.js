import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { connectContext } from 'react-connect-context';
import Joi from 'joi-browser';
import Request from './Request';

import { getConnectionContext } from './ConnectionContext';
import RequestStateHandler from './RequestStateHandler';

const ConnectionContext = getConnectionContext();

const requestMappingSchema = Joi.array().items(Joi.object({
  request: Joi.object().type(Request).required(),
  statusProp: Joi.string().required(),
  requestProp: Joi.string().required(),
  executeOnMount: Joi.boolean().required(),
}));

const defaultMappingValues = {
  executeOnMount: true,
};

const compareRequest = (requestInstance1, requestInstance2) => _.differenceWith(
  requestInstance1,
  requestInstance2,
  (req1, req2) => req1.equals(req2),
);

class ConnectedComponent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      requests: [],
    };

    const requestMapping = this.getRequestMapping(this.props);
    this.componentWillReceiveRequestMapping(requestMapping, true);
  }

  getRequestMapping = (props) => {
    if (!_.isFunction(props.requests)) {
      throw new Error('Request mapping has to be a function that returns an array');
    }

    const requestMapping = props.requests(props);
    if (!_.isArray(requestMapping)) {
      throw new Error('Request mapping function should return an array');
    }

    const requestMappingWithDefaults = _.map(requestMapping, (mapping) => {
      const config = mapping.request.getConfig();
      // use config as a base, merge properties from global defaults
      const defaultProperties = _.defaults(config.defaultMapping, defaultMappingValues);

      // use directly defined mapping values as base, merge defaults from config and global defaults
      return _.defaults(mapping, defaultProperties);
    });

    const { error } = Joi.validate(requestMappingWithDefaults, requestMappingSchema);

    if (error) {
      throw new Error(`Request mapping function should return an array of request definitions: ${error}`);
    }

    return requestMappingWithDefaults;
  }

  componentWillReceiveProps(nextProps) {
    const requestMapping = this.getRequestMapping(nextProps);
    this.componentWillReceiveRequestMapping(requestMapping, false);
  }

  updateRequestState = (newRequestState, updateStateDirectly) => {
    if (updateStateDirectly) {
      this.state.requests = newRequestState;
    } else {
      this.setState({
        requests: newRequestState,
      });
    }
  }

  componentWillReceiveRequestMapping = (nextRequestMapping, updateStateDirectly) => {
    const previousRequestInstances = _.map(this.state.requests, 'requestInstance');
    const nextRequestInstances = _.map(nextRequestMapping, 'request');

    if (_.isEqual(previousRequestInstances, nextRequestInstances)) {
      return;
    }

    const addedRequestInstances = compareRequest(nextRequestInstances, previousRequestInstances);

    const removedRequestInstances = compareRequest(previousRequestInstances, nextRequestInstances);

    if (_.isEmpty(addedRequestInstances) && _.isEmpty(removedRequestInstances)) {
      return;
    }

    const remainingRequests = this.state.requests.filter(({ requestInstance }) =>
      !removedRequestInstances.includes(requestInstance));

    this.executeRequests(addedRequestInstances, remainingRequests, updateStateDirectly);
  }

  executeRequests = (requestInstances, remainingRequests, updateStateDirectly) => {
    const requestStateHandler = this.props.__requestStateHandler__;

    const executedRequests = requestStateHandler.makeMultipleRequests(requestInstances);

    const executedRequestsStripped = _.map(executedRequests, executedRequest =>
      _.pick(executedRequest, 'id', 'requestInstance'));

    this.updateRequestState([
      ...executedRequestsStripped,
      ...remainingRequests,
    ], updateStateDirectly);

    return executedRequests;
  }

  areAllRequestsInContext = () => {
    const requestsFromState = this.state.requests;
    const requestsFromContext = this.props.__requestState__;

    return _.every(requestsFromState, ({ id }) => _.some(requestsFromContext, { id }));
  }

  getRequestsFromContext = () => {
    const allRequestsInContext = this.areAllRequestsInContext();

    if (!allRequestsInContext) {
      return this.props.__requestStateHandler__.getCurrentState();
    }

    return this.props.__requestState__;
  }

  mapContextStateToRequests = (requests) => {
    const requestsFromContext = this.getRequestsFromContext();

    return _.chain(requestsFromContext)
      .map((requestFromContext) => {
        const match = _.find(requests, { id: requestFromContext.id });
        return match ? _.assign(match, { contextState: requestFromContext }) : null;
      })
      .filter(_.isObject)
      .value();
  }

  mergeRequestsWithMapping = (requestsFromContext) => {
    const requestMapping = this.getRequestMapping(this.props);

    return _.map(requestMapping, (requestDefinition) => {
      const match = _.find(requestsFromContext, ({ requestInstance }) =>
        requestInstance.equals(requestDefinition.request));

      return {
        ...requestDefinition,
        ...match,
      };
    });
  }

  getRequestsByKey = (key) => {
    const requestsWithContextState = this.mapContextStateToRequests(this.state.requests);
    const requests = this.mergeRequestsWithMapping(requestsWithContextState);

    return _.chain(requests)
      .keyBy(key)
      .value();
  }

  getStatusProps = () => {
    const requestsByStatusProp = this.getRequestsByKey('statusProp');
    return _.mapValues(requestsByStatusProp, ({ contextState }) =>
      _.pick(contextState, 'error', 'loading', 'result'));
  }

  getRequestProps = () => {
    const requestsByRequestProp = this.getRequestsByKey('requestProp');

    return _.mapValues(requestsByRequestProp, ({ requestInstance }) =>
      () => {
        const { requests } = this.state;

        const remainingRequests = _.filter(requests, request =>
          !request.requestInstance.equals(requestInstance));

        const executedRequests = this.executeRequests([requestInstance], remainingRequests, false);

        const { promise } = _.first(executedRequests);

        return promise;
      });
  };

  render() {
    const statusProps = this.getStatusProps();
    const requestProps = this.getRequestProps();

    const passPropsToChildren = _.merge(statusProps, requestProps);

    return this.props.children(passPropsToChildren);
  }
}

ConnectedComponent.propTypes = {
  children: PropTypes.func.isRequired,

  // eslint-disable-next-line react/no-unused-prop-types
  requests: PropTypes.func.isRequired,

  __requestState__: PropTypes.arrayOf(PropTypes.object).isRequired,

  __requestStateHandler__: PropTypes.instanceOf(RequestStateHandler).isRequired,
};

export default connectContext(ConnectionContext.Consumer)(ConnectedComponent);
