import React from 'react';
import ReactDOM from 'react-dom';
import LibraryComponent from '../src/index';

const Index = () => (
  <div>
    Hello React!
    <LibraryComponent test={1} />
  </div>
);

ReactDOM.render(<Index />, document.getElementById('root'));
