import { Checkbox, FormControlLabel } from '@material-ui/core'
import React, { Component } from 'react'

export default class BoardCheckbox extends Component {
  render() {
    return (
      <FormControlLabel className="board-filter-label filter-checkbox" control={<Checkbox defaultChecked color="primary" />} label={this.props.label} />
    )
  }
}
