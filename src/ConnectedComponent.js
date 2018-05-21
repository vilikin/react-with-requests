import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { getConnectionContext } from './ConnectionContext';

const ConnectionContext = getConnectionContext();

class ConnectedComponent extends Component {
  state = {
    requestIds: [],
  };

  constructor(props) {
    super(props);

    
  }

  componentWillReceiveProps(nextProps) {
    const addedRequests = getAddedRequests()
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
