import { Checkbox, FormControlLabel } from '@material-ui/core';
import React, { Component } from 'react';

export default class BoardCheckbox extends Component {
  render() {
    const { isFilteringDisabled, handleChange } = this.props;

    return (
      <FormControlLabel
        className="board-filter-label filter-checkbox"
        control={
          <Checkbox
            defaultChecked
            color="primary"
            onClick={handleChange}
            disabled={isFilteringDisabled}
          />
        }
        label={this.props.label}
      />
    );
  }
}
