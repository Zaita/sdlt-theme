import { Checkbox, FormControl } from '@material-ui/core'
import React, { Component } from 'react'
import BoardCheckbox from './BoardCheckbox'
import BoardSearch from './BoardSearch'
import BoardSelect from './BoardSelect'
import { riskCategories, sortBy } from './data'

export default class BoardFilters extends Component {
  render() {
    return (
      <div className='board-filters'>
        <BoardSearch label={'Key words'} />
        <BoardSelect label={'Risk category'} filterParameters={riskCategories} />
        <BoardSelect label={'Sort by'} filterParameters={sortBy} addClass={'sort-by'} />
        <BoardCheckbox label={'Show not applicable'} />
      </div>
    )
  }
}
