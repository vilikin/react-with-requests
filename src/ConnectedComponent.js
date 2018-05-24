import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { getConnectionContext } from './ConnectionContext';

const ConnectionContext = getConnectionContext();

class ConnectedComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      requests: [],
    };

    const requests = this.props.requests(this.props);
    this.componentWillReceiveRequests(requests);
  }

  componentWillReceiveProps(nextProps) {
    const requests = nextProps.requests(nextProps);
    this.componentWillReceiveRequests(requests);
  }

  componentWillReceiveRequests = (requests) => {


    this.setState({
      requests: [
        ...this.state.requests,
      ]
    });
  }

  getAddedRequests = (newRequests) => {
    const previousRequestIds = _.cloneDeep(this.state.requestIds);
    const newRequestIds = _.map(newRequests, req => req.id);

    const comparator = (a, b) => a.id === b.id;

    return _.differenceWith(newRequestIds, previousRequestIds, comparator);
  }

  mapConnectionStateToConsumer = (requestState) => {


    return this.props.children(requestState);
  }

  render() {
    return (
      <ConnectionContext.Consumer>
        {this.mapRequestStateToConsumer}
      </ConnectionContext.Consumer>
    );
  }
}

ConnectedComponent.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
  requests: PropTypes.func.isRequired,
};

/*
const mapRequestsToProps = (props) => ({
  photos: photoResource,
  photo: photoResource.withParams(1),
})

const component = (
  <ConnectedComponent requests={mapRequestsToProps}>
    {({photos, singlePhoto}) =>

    }
  </ConnectedComponent>
)
*/
