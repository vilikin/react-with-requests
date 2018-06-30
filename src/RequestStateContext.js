import React from 'react';

let requestStateContext;

function getRequestStateContext() {
  if (requestStateContext) return requestStateContext;

  requestStateContext = React.createContext({});

  return requestStateContext;
}

export { getRequestStateContext };
