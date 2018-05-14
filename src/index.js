import React, { Component } from 'react';
import PropTypes from 'prop-types';

class LibraryComponent extends Component {
  state = {
    stuffVisible: false,
  }

  change = () => {
    this.setState({
      stuffVisible: !this.state.stuffVisible,
    });
  }

  render() {
    return (
      <div>
        {
          this.state.stuffVisible &&
          <div>This is visible</div>
        }
        <input type="checkbox" onChange={this.change} />
      </div>
    );
  }
}

LibraryComponent.propTypes = {

};

export default LibraryComponent;
