// @flow

import GraphQLRequestHelper from "../utils/GraphQLRequestHelper";
import get from "lodash/get";
import toString from "lodash/toString";
import {DEFAULT_NETWORK_ERROR} from "../constants/errors";
import type {Task, TaskSubmission} from "../types/Task";
import UserParser from "../utils/UserParser";
import TaskParser from "../utils/TaskParser";
import type {ImpactThreshold} from "../types/ImpactThreshold";
export default class SecurityRiskAssessmentTaskDataService {

  static async fetchSecurityRiskAssessmentTasK(args: { uuid: string, secureToken?: string }): Promise<TaskSubmission> {
    const {uuid, secureToken} = {...args};
    const query = `
query {
  readTaskSubmission(UUID: "${uuid}", SecureToken: "${secureToken || ""}") {
    UUID
    TaskName
    QuestionnaireSubmission {
      UUID
      ProductName
      IsBusinessOwner
      TaskSubmissions {
        UUID
        Status
        TaskType
      }
    }
    IsTaskCollborator
    SraTaskHelpText
    SraTaskRecommendedControlHelpText
    SraTaskRiskRatingHelpText
    SraTaskLikelihoodScoreHelpText
    SraTaskImpactScoreHelpText
    Submitter {
      ID
    }
    Status
    SecurityRiskAssessmentData
  }
}`;

    const responseJSONObject = await GraphQLRequestHelper.request({query});

    const submissionJSONObject = get(responseJSONObject, "data.readTaskSubmission.0", null);
    if (!submissionJSONObject) {
      throw DEFAULT_NETWORK_ERROR;
    }
    const securityRiskAssessmentData = JSON.parse(get(submissionJSONObject, 'SecurityRiskAssessmentData', ''));
    const data: TaskSubmission = {
      uuid: submissionJSONObject && submissionJSONObject.UUID ? submissionJSONObject.UUID : '',
      taskName: toString(get(submissionJSONObject, "TaskName", "")),
      status: toString(get(submissionJSONObject, "Status", "")),
      sraTaskHelpText: toString(get(submissionJSONObject, "SraTaskHelpText", "")),
      sraTaskRecommendedControlHelpText: toString(get(submissionJSONObject, "SraTaskRecommendedControlHelpText", "")),
      sraTaskRiskRatingHelpText: toString(get(submissionJSONObject, "SraTaskRiskRatingHelpText", "")),
      sraTaskLikelihoodScoreHelpText: toString(get(submissionJSONObject, "SraTaskLikelihoodScoreHelpText", "")),
      sraTaskImpactScoreHelpText: toString(get(submissionJSONObject, "SraTaskImpactScoreHelpText", "")),
      submitterID: toString(get(submissionJSONObject, "Submitter.ID", "")),
      isTaskCollborator: get(submissionJSONObject, "IsTaskCollborator", "false") === "true",
      questionnaireSubmissionUUID: toString(get(submissionJSONObject, "QuestionnaireSubmission.UUID", "")),
      questionnaireSubmissionProductName: toString(get(submissionJSONObject, "QuestionnaireSubmission.ProductName", "")),
      isBusinessOwner: get(submissionJSONObject, "QuestionnaireSubmission.IsBusinessOwner", "false") === "true",
      taskSubmissions: TaskParser.parseAlltaskSubmissionforQuestionnaire(submissionJSONObject),
      sraData: securityRiskAssessmentData
    };

    return data;
  }

  static async fetchImpactThreshold(): Promise<ImpactThreshold> {
    const query = `
query {
  readImpactThreshold {
    Name
    Value
    Colour
    Operator
  }
}`;

    const responseJSONObject = await GraphQLRequestHelper.request({query});
    const impactThresholdJSONObject = get(responseJSONObject, "data.readImpactThreshold", null);
    if (!impactThresholdJSONObject) {
      throw DEFAULT_NETWORK_ERROR;
    }

    const data:ImpactThreshold = impactThresholdJSONObject.map((impactThreshold) => {
      return {
        name: _.toString(_.get(impactThreshold, "Name", "")),
        color: _.toString(_.get(impactThreshold, "Colour", "")),
        operator: _.toString(_.get(impactThreshold, "Operator", "")),
        value: _.toString(_.get(impactThreshold, "Value", "")),
      }
    });

    return data;
  }
}
