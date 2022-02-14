import React, { Component } from 'react'
import { FormLabel, InputLabel, TextField } from '@material-ui/core';

export default class BoardSearch extends Component {
  constructor(props) {
    super(props);
    this.state = { value: '' };
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    // implement logic to filter kanban
    this.setState({ value: event.target.value });
  }

  render() {
    return (
      <div className='board-search'>
        <FormLabel className="board-filter-label">{this.props.label}</FormLabel>
        <TextField size="small" InputProps={{ style: { fontSize: 'small' } }} className="board-search-input" variant="outlined" onChange={this.handleChange} />
      </div>
    );
  }
}
