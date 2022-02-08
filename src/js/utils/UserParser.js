// @flow
import type {User} from "../types/User";
import type {Collaborator} from "../types/User";
import get from "lodash/get";
import toString from "lodash/toString";
import toArray from "lodash/toArray";
export default class UserParser {
  static parseUserFromJSON(userJSON: string | Object): User {
    const jsonObject = (typeof userJSON === "string" ? JSON.parse(userJSON) : userJSON);
    const name = get(jsonObject, "FirstName") ? toString(get(jsonObject, "FirstName", "")) + ' ' + toString(get(jsonObject, "Surname", "")) : ""

    return {
      id: toString(get(jsonObject, "ID")),
      name: name,
      email: get(jsonObject, "Email"),
      isSA: toString(get(jsonObject, "IsSA")) === "true",
      isCISO: toString(get(jsonObject, "IsCISO")) === "true",
      isCertificationAuthority: toString(get(jsonObject, "IsCertificationAuthority")) === "true",
      isAccreditationAuthority: toString(get(jsonObject, "IsAccreditationAuthority")) === "true",
    }
  }

  // this is use for collaborator (dropdown)
  static parserMemberFromJSON(userJSON: string | Object): Collaborator {
    return toArray(userJSON).map((user) => {
      const name = get(user, "FirstName") ? toString(get(user, "FirstName", "")) +
          ' ' + toString(get(user, "Surname", "")) : ""
      return {
        value: get(user, "ID"),
        label: name
      }
    });
  }

  // this is use for collaborator (selected value)
  static parserCollaboratorsFromJSON (collaboratorJSON: string | Object) : Collaborator {
    const collaboratorJsonObject = (typeof collaboratorJSON === "string" ? JSON.parse(collaboratorJSON) : collaboratorJSON);
    return toArray(collaboratorJsonObject).map((collaborator) => {
      const name = get(collaborator, "Name") ? toString(get(collaborator, "Name", "")) : "";
      return {
        value: get(collaborator, "ID"),
        label: name
      }
    });
  }
}
