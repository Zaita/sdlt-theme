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
            evalutionRating: toString(get(control, "evalutionRating", "")),
            description: toString(get(control, "description", "")),
            implementationGuidance: toString(get(control, "implementationGuidance", "")),
            implementationEvidence: toString(get(control, "implementationEvidence", "")),
            implementationEvidenceUserInput: toString(get(control, "implementationEvidenceUserInput", "")),
            auditMethodUserInput: toString(get(control, "auditMethodUserInput", "")),
            auditNotesAndFindingsUserInput: toString(get(control, "auditNotesAndFindingsUserInput", "")),
            auditRecommendationsUserInput: toString(get(control, "auditRecommendationsUserInput", "")),
            riskCategories: (get(control, "riskCategories") || []).map((riskCategory) => {
              return {
                id: toString(get(riskCategory, "id", "")),
                name: toString(get(riskCategory, "name", ""))
              }
            }),
            isKeyControl: Boolean(get(control, "isKeyControl", false)),
            controlOwnerDetails: (get(control, "controlOwnerDetails") || []).map((controlOwnerDetail) => {
              return {
                name: toString(get(controlOwnerDetail, "name", "")),
                email: toString(get(controlOwnerDetail, "email", "")),
                team: toString(get(controlOwnerDetail, "team", ""))
              }
            }),
            implementationEvidenceHelpText: toString(get(control, "implementationEvidenceHelpText", "")),
            implementationAuditHelpText: toString(get(control, "implementationAuditHelpText", ""))
          }
        }),
        jiraTicketLink: toString(get(jsonObject, "jiraTicketLink", "")),
      }
    });
  }

  static parseScoresAndPanelties(securityRiskAssessmentData: object) {
    const componentObj = {};

    securityRiskAssessmentData.map((riskObj) => {
      if(!riskObj.riskDetail.components) {
        return componentObj;
      }
      riskObj.riskDetail.components.map((component) => {
        let controlObj = {};
        const controls = component.implementedControls.concat(component.recommendedControls);

        if (component.id in componentObj) {
          controlObj = componentObj[component.id];
        }

        controls.map((control) => {
          const scoreObj = {
            riskId: riskObj.riskId,
            riskName: riskObj.riskName,
            componentId: component.id,
            componentName: component.name,
            controlId: control.id,
            controlName: control.name,
            normaliseLikelihood: control.likelihoodWeight,
            normaliseImpact: control.impactWeight,
            impactPenalty: control.impactPenalty,
            likelihoodPenalty: control.likelihoodPenalty,
          }

          if (control.id in controlObj) {
            const arr = controlObj[control.id];
            arr.push(scoreObj);
            controlObj[control.id] = arr;
          } else {
            controlObj[control.id] = [scoreObj];
          }
        });
        componentObj[component.id] = controlObj;
      });
    });

    return componentObj;
  }
}
