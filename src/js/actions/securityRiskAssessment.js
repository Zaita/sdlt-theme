import {ThunkAction} from "redux-thunk";
import ActionType from "./ActionType";
import SecurityRiskAssessmentTaskDataService from "../services/SecurityRiskAssessmentTaskDataService";
import ErrorUtil from "../utils/ErrorUtil";
import CSRFTokenService from "../services/CSRFTokenService";

export function loadSecurityRiskAssessment(args: {uuid: string, secureToken?: string, component?: string}): ThunkAction {
  const {uuid, secureToken, component} = {...args};

  return async (dispatch) => {
    await dispatch({ type: ActionType.SRA.LOAD_SECURITY_RISK_ASSESSMENT_REQUEST});
    try {
      const payload = await SecurityRiskAssessmentTaskDataService.fetchSecurityRiskAssessmentTasK({
        uuid,
        secureToken,
        component
      });
      const action = {
        type: ActionType.SRA.LOAD_SECURITY_RISK_ASSESSMENT_SUCCESS,
        payload,
      };

      await dispatch(action);
    }
    catch (error) {
      await dispatch({type: ActionType.SRA.LOAD_SECURITY_RISK_ASSESSMENT_FAILURE, error: error});
      ErrorUtil.displayError(error);
    }
  };
}

export function loadImpactThreshold() {
    return async (dispatch) => {
    try {
      const payload = await SecurityRiskAssessmentTaskDataService.fetchImpactThreshold();

      const action = {
        type: ActionType.SRA.LOAD_IMPACT_THRESHOLD,
        payload,
      };

      await dispatch(action);
    }
    catch (error) {
      ErrorUtil.displayError(error);
    }
  };
}

export function updateControlValidationAuditData(args: {
  selectedOption: string,
  controlID: string,
  productAspect: string,
  componentID: string,
  uuid: string
}): ThunkAction {
  return async (dispatch) => {
    try {
      const csrfToken = await CSRFTokenService.getCSRFToken();
      const payload = await SecurityRiskAssessmentTaskDataService.updateCVAControlStatus(args, csrfToken);

      const action = {
        type: ActionType.SRA.UPDATE_CVA_CONTROL_STATUS,
        payload,
      };

      await dispatch(action);
    }
    catch (error) {
      ErrorUtil.displayError(error);
    }
  };
}
