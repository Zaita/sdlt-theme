// @flow

import get from "lodash/get";
import toString from "lodash/toString";
import type {SecurityComponent} from "../types/SecurityComponent";
import toArray from "lodash/toArray";

export default class SecurityComponentParser {

  static parseFromJSONOArray(jsonArray: *): Array<SecurityComponent> {
    return toArray(jsonArray).map((jsonObject) => {
      let seletcedComponent = SecurityComponentParser.parseFromJSONObject(get(jsonObject, "SecurityComponent"));
      seletcedComponent.productAspect = toString(get(jsonObject, "ProductAspect", ""));
      return seletcedComponent;
    });
  }

  static parseFromJSONObject(jsonObject: *): SecurityComponent {
    return {
      id: toString(get(jsonObject, "ID", "")),
      name: toString(get(jsonObject, "Name", "")),
      description: toString(get(jsonObject, "Description")),
      controls: (get(jsonObject, "Controls") || []).map((control) => {
        return {
          id: toString(get(control, "ID", "")),
          name: toString(get(control, "Name", "")),
          description: toString(get(control, "Description", "")),
          implementationGuidance: toString(get(control, "ImplementationGuidance", ""))
        }
      })
    }
  }

  static parseCVAFromJSONObject(jsonArray: *): SecurityComponent {
    return jsonArray.map((jsonObject) => {
      return {
        id: toString(get(jsonObject, "id", "")),
        name: toString(get(jsonObject, "name", "")),
        productAspect:toString(get(jsonObject, "productAspect", "")),
        controls: (get(jsonObject, "controls") || []).map((control) => {
          return {
            id: toString(get(control, "id", "")),
            name: toString(get(control, "name", "")),
            selectedOption: toString(get(control, "selectedOption", "")),
            description: toString(get(control, "description", "")),
            implementationGuidance: toString(get(control, "implementationGuidance", "")),
            implementationEvidence: toString(get(control, "implementationEvidence", "")),
            implementationEvidenceUserInput: toString(get(control, "implementationEvidenceUserInput", "")),
            riskCategories: (get(control, "riskCategories") || []).map((riskCategory) => {
              return {
                id: toString(get(riskCategory, "id", "")),
                name: toString(get(riskCategory, "name", ""))
              }
            }),
            isKeyControl: Boolean(get(control, "isKeyControl", false))
          }
        }),
        jiraTicketLink: toString(get(jsonObject, "jiraTicketLink", "")),
      }
    });
  }
}
