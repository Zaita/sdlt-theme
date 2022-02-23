import React, { Component } from 'react'
import { FormLabel, MenuItem, Select } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

export default class BoardSelect extends Component {

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
    const { label, filterParameters, addClass } = this.props
    return (
      <div className='board-select'>
        <FormLabel className="board-filter-label">{label}</FormLabel>
        <Select
          SelectDisplayProps={{
            style: { paddingTop: 9, paddingBottom: 9, fontSize: 'small' }
          }}
          MenuProps={{
            anchorOrigin: {
              vertical: 'bottom',
              horizontal: 'center',
            },
            transformOrigin: {
              vertical: 'top',
              horizontal: 'center',
            },
            getContentAnchorEl: null,
            disablePortal: true
          }}
          className={addClass === 'sort-by' ? 'board-select-input sort-by' : 'board-select-input'} variant="outlined" focused defaultValue={filterParameters[0].title} onChange={this.handleChange}>
          {filterParameters.map((parameter) => (
            <MenuItem style={{ fontSize: 'small' }} key={parameter.id} value={parameter.title}>{parameter.title}</MenuItem>
          ))}
        </Select>
      </div>
    );
  }
}
