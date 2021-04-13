// @flow
import {ThunkAction} from "redux-thunk";
import type {
  SetCurrentUserAction,
  LoadMembersAction
} from "./ActionType";
import ActionType from "./ActionType";
import UserDataService from "../services/UserDataService";
import ErrorUtil from "../utils/ErrorUtil";

export function loadCurrentUser(): ThunkAction {
  return async (dispatch) => {
    // TODO: loading
    try {
      const user = await UserDataService.fetchCurrentUser();
      const action: SetCurrentUserAction = {
        type: ActionType.USER.SET_CURRENT_USER,
        payload: user,
      };
      dispatch(action);
    }
    catch (error) {
      // TODO: errors
      ErrorUtil.displayError(error);
    }
  };
}

export function loadMember(): ThunkAction {
  return async (dispatch) => {
    try {
      const members = await UserDataService.fetchMembers();
      const action: LoadMembersAction = {
        type: ActionType.USER.LOAD_MEMBER,
        payload: members
      }
      dispatch(action);
    }
    catch (error) {
      // TODO: errors
      ErrorUtil.displayError(error);
    }
  };
}
