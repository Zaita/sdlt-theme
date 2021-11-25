import React, {Component} from "react";
import Pagination from "./Pagination";
import {
  loadPaginationNextPage,
  loadPaginationPrevPage,
  loadPaginationFirstPage,
  loadPaginationLastPage,
  loadPaginationSelectedRow,
} from "../../actions/pagination";
import {Dispatch} from "redux";
import {connect} from "react-redux";
import type {RootState} from "../../store/RootState";

class PaginationContainer extends Component {
  render() {
    const {
      paginationState: { pagination },
      paginationActions,
    } = this.props;

    return (
      <Pagination
        paginationInfo={this.props.paginationInfo}
        listLength={this.props.listLength}
        dispatchList={this.props.dispatchList}
        limit={pagination.limit}
        offset={pagination.offset}
        page={pagination.pageNumber}
        index={pagination.index}
        paginationActions={paginationActions}
      />
    );
  }
}

const mapStateToProps = (state: RootState) => {
  return {
    paginationState: state.paginationState,
  };
};

const mapDispatchToProps = (dispatch: Dispatch, props: *) => {
  return {
    paginationActions: {
      nextPage: (payload) => dispatch(loadPaginationNextPage(payload)),
      prevPage: (payload) => dispatch(loadPaginationPrevPage(payload)),
      firstPage: (payload) => dispatch(loadPaginationFirstPage(payload)),
      lastPage: (payload) => dispatch(loadPaginationLastPage(payload)),
      selectedRow: (payload) => dispatch(loadPaginationSelectedRow(payload)),
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PaginationContainer);
