console.log("THIS IS DEMO!");

import React from "react";
import ReactDOM from "react-dom";
import LibraryComponent from '../src/index'

const Index = () => {
  return <div>
      Hello React!
      <LibraryComponent/>
    </div>;
};

ReactDOM.render(<Index />, document.getElementById("root"));