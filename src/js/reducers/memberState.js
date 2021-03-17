// @flow

import type {MemberState} from "../store/MemberState";
import type {LoadMembersAction} from "../actions/ActionType";
import ActionType from "../actions/ActionType";

const defaultState: MemberState = {
  members: null,
};

export function memberState(state: MemberState = defaultState, action: LoadMembersAction) {
  switch (action.type) {
    case ActionType.USER.LOAD_MEMBER:
      return action.payload;
    default:
      return state;
  }
}
