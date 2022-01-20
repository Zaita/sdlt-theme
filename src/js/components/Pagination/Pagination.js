import React, { Component } from "react";
import firstPageIcon from "../../../img/icons/first-page.svg";
import lastPageIcon from "../../../img/icons/last-page.svg";
import chevronLeftIcon from "../../../img/icons/chevron-left.svg";
import chevronRightIcon from "../../../img/icons/chevron-right-link.svg";
import Select from "react-select";

class Pagination extends Component {
  componentDidUpdate(prevProps) {
    const { limit, offset } = this.props;
    if (prevProps.limit !== limit || prevProps.offset !== offset) {
      this.props.dispatchList(limit, offset);
    }
  }

  handleFirstPageClick = () => {
    this.props.paginationActions.firstPage({
      limit: 10,
      offset: 0,
      index: 1,
      pageNumber: 1,
    });
  };

  handleNextPageClick = (runningTotal: number) => {
    this.props.paginationActions.nextPage({
      limit: this.props.limit,
      offset: ((this.props.page + 1) - 1) * this.props.limit,
      index: runningTotal + 1,
      pageNumber: this.props.page + 1,
    });
  };

  handlePreviousPageClick = () => {
    this.props.paginationActions.prevPage({
      limit: this.props.limit,
      offset: ((this.props.page - 1) - 1) * this.props.limit,
      index: Math.abs(this.props.limit - this.props.index),
      pageNumber: this.props.page - 1,
    });
  };

  handleLastPageClick = (totalCount: number) => {
    this.props.paginationActions.lastPage({
      limit: this.props.limit,
      offset: (Math.ceil(totalCount / this.props.limit) - 1) * this.props.limit,
      index: (Math.ceil(totalCount / this.props.limit) - 1) * this.props.limit,
      pageNumber: Math.ceil(totalCount / this.props.limit)
    });
  };

  handleChangeForSelectedRows = (limit) => {
    this.props.paginationActions.selectedRow({
      limit,
      offset: this.props.offset,
      index: this.props.index,
      pageNumber: this.props.page,
    });
  };

  render() {
    const {
      paginationInfo: { totalCount, hasNextPage, hasPreviousPage },
      listLength,
    } = this.props;

    const rowsPerPage = [
      { value: 10, label: "10" },
      { value: 20, label: "20" },
      { value: 30, label: "30" },
      { value: 40, label: "40" },
      { value: 50, label: "50" },
    ];

    const runningTotal = this.props.offset + listLength;
    let index = this.props.index;

    // reset index if on first page
    if(!hasPreviousPage) {
      index = 1;
    }

    return (
      <div className="pagination-container">
        <span className="rows-per-page">Rows per page</span>
        <div className="rows-per-page-select">
          <Select
            value={{label: this.props.limit}}
            options={rowsPerPage}
            defaultValue={rowsPerPage[0]}
            classNamePrefix="react-select"
            placeholder={rowsPerPage[0]}
            isSearchable={false}
            onChange={(selectedOption) =>
              this.handleChangeForSelectedRows(selectedOption.value)
            }
          />
        </div>
        <div className="pagination-navigation-count">
          {index + "-" + runningTotal + " of " + totalCount}
        </div>
        <div className="pagination-buttons">
          <img
            className={!hasPreviousPage ? "disable-pagination" : ""}
            src={firstPageIcon}
            onClick={hasPreviousPage ? () => this.handleFirstPageClick() : ""}
          />
          <img
            className={!hasPreviousPage ? "disable-pagination" : ""}
            src={chevronLeftIcon}
            onClick={hasPreviousPage ? () => this.handlePreviousPageClick() : ""}
          />
          <img
            className={!hasNextPage ? "disable-pagination" : ""}
            src={chevronRightIcon}
            onClick={hasNextPage ? () => this.handleNextPageClick(runningTotal) : ""}
          />
          <img
            className={!hasNextPage ? "disable-pagination": ""}
            src={lastPageIcon}
            onClick={hasNextPage ? () => this.handleLastPageClick(totalCount): ""}
          />
        </div>
      </div>
    );
  }
}

export default Pagination;
