import ActionType from "./ActionType";
import { PaginationState } from "../store/PaginationState";

export function loadPaginationNextPage(payload: PaginationState) {
  return {
    type: ActionType.PAGINATION.FETCH_NEXT_PAGE,
    payload
  }
}

export function loadPaginationPrevPage(payload: PaginationState) {
  return {
    type: ActionType.PAGINATION.FETCH_PREV_PAGE,
    payload
  }
}

export function loadPaginationFirstPage(payload: PaginationState) {
  return {
    type: ActionType.PAGINATION.FETCH_FIRST_PAGE,
    payload
  }
}

export function loadPaginationLastPage(payload: PaginationState) {
  return {
    type: ActionType.PAGINATION.FETCH_LAST_PAGE,
    payload
  }
}

export function loadPaginationSelectedRow(payload: PaginationState) {
  return {
    type: ActionType.PAGINATION.SET_SELECTED_ROWS,
    payload
  }
}

export function loadPaginationReset() {
  return {
    type: ActionType.PAGINATION.RESET_PAGINATION,
  }
}

