import React from 'react';

let connectionContext;

function getConnectionContext() {
  if (connectionContext) return connectionContext;

  connectionContext = React.createContext({});

  return connectionContext;
}

export { getConnectionContext };
