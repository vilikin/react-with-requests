import React from 'react';
import RequestStateConsumer from '../RequestStateConsumer';

function withRequests(requests) {
  return (Component) => {
    const ComponentWithRequests = props => (
      <RequestStateConsumer requests={requests} {...props}>
        {(requestStateProps) => {
          const mergedProps = {
            ...props,
            ...requestStateProps,
          };

          return <Component {...mergedProps} />;
        }}
      </RequestStateConsumer>
    );

    return ComponentWithRequests;
  };
}

export default withRequests;
