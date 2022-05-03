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
    const sraData = action.payload.sraData;
    const securityRiskAssessmentDataCopy = cloneDeep(state.securityRiskAssessmentData);

    securityRiskAssessmentDataCopy.selectedControls = selectedControls;
    securityRiskAssessmentDataCopy.sraData = sraData;

    return {
      ...state,
      securityRiskAssessmentData: securityRiskAssessmentDataCopy,
    };
  }

  return state;
}
