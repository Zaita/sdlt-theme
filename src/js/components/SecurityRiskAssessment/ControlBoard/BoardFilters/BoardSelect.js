import React, { Component } from 'react'
import { FormLabel, MenuItem, Select } from '@mui/material';
import ChevronIcon from '@mui/icons-material/ChevronRight';

export default class BoardSelect extends Component {
  render() {
    const {
      label,
      filterParameters,
      addClass,
      isFilteringDisabled,
      handleChange,
    } = this.props;

    return (
      <div className='board-select'>
        <FormLabel className="board-filter-label">{label}</FormLabel>
        <Select
          SelectDisplayProps={{
            style: { paddingTop: 9, paddingBottom: 9, fontSize: 'small', backgroundColor: 'white'}
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
          IconComponent={ChevronIcon}
          className={addClass === 'sort-by' ? 'board-select-input sort-by' : 'board-select-input'}
          variant="outlined"
          defaultValue={label === 'Sort by' ? filterParameters[1].title : filterParameters[0].title}
          onChange={handleChange}
          disabled={isFilteringDisabled}
        >
          {filterParameters.map((parameter) => (
            <MenuItem
              style={{ fontSize: 'small' }}
              key={parameter.id}
              value={parameter.title}>
              {parameter.title}
            </MenuItem>
          ))}
        </Select>
      </div>
    );
  }
}
