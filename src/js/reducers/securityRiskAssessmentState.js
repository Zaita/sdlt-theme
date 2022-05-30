// @flow

import type {SecurityRiskAssessmentState} from "../store/SecurityRiskAssessmentState";
import ActionType from "../actions/ActionType";
import type {SecurityRiskAssessment} from "../types/Task";
import { cloneDeep } from 'lodash';

const defaultStartState: SecurityRiskAssessmentState = {
  securityRiskAssessmentData: null,
  impactThresholdData: null
};

export function securityRiskAssessmentState(state: SecurityRiskAssessmentState = defaultStartState, action: *): SecurityRiskAssessmentState {

  if (action.type === ActionType.SRA.LOAD_SECURITY_RISK_ASSESSMENT_SUCCESS) {
    return {
      ...state,
      securityRiskAssessmentData: action.payload
    };
  }

  if (action.type === ActionType.SRA.LOAD_IMPACT_THRESHOLD) {
    return {
      ...state,
      impactThresholdData: action.payload,
    };
  }

  if (action.type === ActionType.SRA.UPDATE_CVA_CONTROL_STATUS) {
    const selectedControls = action.payload.selectedControls;
    const newSraData = action.payload.sraData;
    const oldSraData = state.securityRiskAssessmentData.sraData;
    const securityRiskAssessmentDataCopy = cloneDeep(state.securityRiskAssessmentData);

    newSraData.map ((newRiskDetailobj, index) => {
      const oldRiskDetailObj = oldSraData.filter(
        (oldObj) => oldObj.riskId === newRiskDetailobj.riskId
      ).pop();
      let differenceBetweenLikelihoodScore = 0;
      let differenceBetweenImapctScore = 0;

      if (oldRiskDetailObj) {
        differenceBetweenLikelihoodScore =
          newRiskDetailobj.riskDetail.currentLikelihood.score -
          oldRiskDetailObj.riskDetail.currentLikelihood.score;
        differenceBetweenImapctScore =
          newRiskDetailobj.riskDetail.currentImpact.score -
          oldRiskDetailObj.riskDetail.currentImpact.score;
      }

      newRiskDetailobj.differenceBetweenLikelihoodScore = parseFloat(differenceBetweenLikelihoodScore.toFixed(2));
      newRiskDetailobj.differenceBetweenImapctScore = parseFloat(differenceBetweenImapctScore.toFixed(2));
      newSraData[index] = newRiskDetailobj;
    });

    securityRiskAssessmentDataCopy.selectedControls = selectedControls;
    securityRiskAssessmentDataCopy.sraData = newSraData;

    return {
      ...state,
      securityRiskAssessmentData: securityRiskAssessmentDataCopy,
    };
  }

  if (action.type === ActionType.SRA.UPDATE_CVA_CONTROL_DETAIL_DATA) {
    const controlID = action.payload.controlID;
    const fieldName = action.payload.fieldName;
    const updatedValue = action.payload.updatedValue;
    const securityRiskAssessmentDataCopy = cloneDeep(state.securityRiskAssessmentData);
    const selectedControls = securityRiskAssessmentDataCopy.selectedControls;

    if (selectedControls.length > 0) {
      const control = selectedControls[0].controls.filter(
        (control) => control.id == controlID
      );

      if (control.length > 0) {
        control[0][fieldName] = updatedValue;

        return {
          ...state,
          securityRiskAssessmentData: securityRiskAssessmentDataCopy
        };
      }
    }
  }

  return state;
}
