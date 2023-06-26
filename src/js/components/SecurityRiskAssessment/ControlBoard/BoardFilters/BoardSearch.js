import React, { Component } from 'react';
import { FormLabel, TextField } from '@mui/material';

export default class BoardSearch extends Component {
  render() {
    const { isFilteringDisabled, handleChange } = this.props;
    
    return (
      <div className="board-search">
        <FormLabel className="board-filter-label">{this.props.label}</FormLabel>
        <TextField
          size="small"
          InputProps={{
            style: { fontSize: "small" },
            disabled: isFilteringDisabled
          }}
          className="board-search-input"
          variant="outlined"
          color="primary"
          focused
          onChange={handleChange}
        />
      </div>
    );
  }
}
