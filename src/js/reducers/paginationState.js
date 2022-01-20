import { PaginationState } from "../store/PaginationState";
import ActionType from "../actions/ActionType";

const defaultState: PaginationState = {
  pagination: {
    limit: 10,
    offset: 0,
    index: 1,
    pageNumber: 1,
  },
};

export function paginationState(state: PaginationState = defaultState, action) {
  switch (action.type) {
    case ActionType.PAGINATION.FETCH_NEXT_PAGE:
      return {
        ...state,
        pagination: action.payload,
      };
    case ActionType.PAGINATION.FETCH_PREV_PAGE:
      return {
        ...state,
        pagination: action.payload,
      };
    case ActionType.PAGINATION.FETCH_FIRST_PAGE:
      return {
        ...state,
        pagination: action.payload,
      };
    case ActionType.PAGINATION.FETCH_LAST_PAGE:
      return {
        ...state,
        pagination: action.payload,
      };
    case ActionType.PAGINATION.SET_SELECTED_ROWS:
      return {
        ...state,
        pagination: action.payload,
      };
    case ActionType.PAGINATION.RESET_PAGINATION:
      return {
        ...state,
        pagination: defaultState.pagination,
      };

    default:
      return state;
  }
}
