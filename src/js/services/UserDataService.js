// @flow

import type {User} from "../types/User";
import GraphQLRequestHelper from "../utils/GraphQLRequestHelper";
import _ from "lodash";
import UserParser from "../utils/UserParser";

export default class UserDataService {

  static async fetchCurrentUser(): Promise<User> {
    const query = `
query {
  readMember(Type: "Current") {
    ID
    Email
    FirstName
    Surname
    IsSA
    IsCISO
  }
}`;
    const responseJSONObject = await GraphQLRequestHelper.request({query});

    const currentMemberJSONObject = _.get(responseJSONObject, "data.readMember.0", null);
    if (!currentMemberJSONObject) {
      throw new Error("Authenticate error");
    }

    const user = UserParser.parseUserFromJSON(currentMemberJSONObject);
    if (!user.id) {
      throw new Error("Authenticate error");
    }

    return user;
  }

  static async fetchMembers(): Promise<User> {
    const query = `
query {
  readMember(Type: "All") {
    ID
    FirstName
    Surname
  }
}`;
    const responseJSONObject = await GraphQLRequestHelper.request({query});

    const memberJSONObject = _.get(responseJSONObject, "data.readMember", null);
    if (!memberJSONObject) {
      throw new Error("Authenticate error");
    }

    const members = UserParser.parserMemberFromJSON(memberJSONObject);
    return members;
  }
}
