import React from 'react';
import ConnectedComponent from '../ConnectedComponent';

function withRequests(requests) {
  return (Component) => {
    const ComponentWithRequests = props => (
      <ConnectedComponent requests={requests} {...props}>
        {(connectedProps) => {
          const mergedProps = {
            ...props,
            ...connectedProps,
          };

          return <Component {...mergedProps} />;
        }}
      </ConnectedComponent>
    );

    return ComponentWithRequests;
  };
}

export default withRequests;
