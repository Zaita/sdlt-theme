import React, { Component } from 'react';
import BoardCheckbox from './BoardCheckbox';
import BoardSearch from './BoardSearch';
import BoardSelect from './BoardSelect';
import { riskCategories, sortBy } from './data';

export default class BoardFilters extends Component {
  render() {
    const {
      updateSearchKeywords,
      isFilteringDisabled,
      toggleNotApplicable,
      updateSelectedRiskCategory
    } = this.props;

    return (
      <div className="board-filters">
        <BoardSearch
          label={"Key words"}
          handleChange={updateSearchKeywords}
          isFilteringDisabled={isFilteringDisabled}
        />
        <BoardSelect
          label={"Risk category"}
          filterParameters={riskCategories}
          isFilteringDisabled={isFilteringDisabled}
          handleChange={updateSelectedRiskCategory}
        />
        <BoardSelect
          label={"Sort by"}
          filterParameters={sortBy}
          addClass={"sort-by"}
          isFilteringDisabled={isFilteringDisabled}
        />
        <BoardCheckbox
          label={"Show not applicable"}
          handleChange={toggleNotApplicable}
          isFilteringDisabled={isFilteringDisabled}
        />
      </div>
    );
  }
}
