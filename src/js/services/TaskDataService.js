// @flow

import GraphQLRequestHelper from "../utils/GraphQLRequestHelper";
import get from "lodash/get";
import toString from "lodash/toString";
import uniq from "lodash/uniq";
import {DEFAULT_NETWORK_ERROR} from "../constants/errors";
import type {Question, SubmissionQuestionData} from "../types/Questionnaire";
import QuestionParser from "../utils/QuestionParser";
import type {Task, TaskSubmission, TaskSubmissionListItem, TaskRecommendation} from "../types/Task";
import UserParser from "../utils/UserParser";
import TaskParser from "../utils/TaskParser";
import SecurityComponentParser from "../utils/SecurityComponentParser";
import JiraTicketParser from "../utils/JiraTicketParser";
import type {PaginationInfo} from "../types/Pagination";

type BatchUpdateTaskSubmissionDataArgument = {
  uuid: string,
  questionIDList: Array<string>,
  answerDataList: Array<SubmissionQuestionData>,
  csrfToken: string,
  secureToken?: string,
};

export default class TaskDataService {

  static async fetchTaskSubmission(args: { uuid: string, secureToken?: string, component?: string }): Promise<TaskSubmission> {
    const {uuid, secureToken, component} = {...args};
    const query = `
query {
  readTaskSubmission(UUID: "${uuid}", SecureToken: "${secureToken || ""}") {
    ID
    UUID
    TaskName
    TaskType
    Status
    Result
    LockAnswersWhenComplete
    IsTaskCollborator
    QuestionnaireSubmission {
      ID
      UUID
      QuestionnaireStatus
      ProductName
      IsBusinessOwner
      TaskSubmissions {
        UUID
        Status
        TaskType
      }
    }
    Submitter {
      ID
      Email
      FirstName
      Surname
      IsSA
      IsCISO
    }
    QuestionnaireData
    AnswerData
    RiskProfileData
    ResultForCertificationAndAccreditation
    SelectedComponents {
      ID
      ProductAspect
      SecurityComponent {
        ID
        Name
        Description
        Controls {
          ID
          Name
          Description
          ImplementationGuidance
        }
      }
    }
    JiraTickets {
      ID
      JiraKey
      TicketLink
    }
    IsTaskApprovalRequired
    IsCurrentUserAnApprover
    CreateOnceInstancePerComponent
    RiskResultData
    IsDisplayPreventMessage
    PreventMessage
    TaskRecommendationData
    ComponentTarget
    ProductAspects
    HideWeightsAndScore
    InformationClassificationTaskResult
  }
  readServiceInventory {
    ID
    ServiceName
  }
}`;

    const responseJSONObject = await GraphQLRequestHelper.request({query});
    const submissionJSONObject = get(responseJSONObject, "data.readTaskSubmission.0", null);
    const serviceRegister = get(responseJSONObject, "data.readServiceInventory", null);

    if (!submissionJSONObject) {
      throw DEFAULT_NETWORK_ERROR;
    }

    let answerData = toString(get(submissionJSONObject, "AnswerData", ""));
    const taskStatus = toString(get(submissionJSONObject, "Status", ""));
    let taskStatusForComponent = taskStatus;

    // add task type condition as well
    if (component && answerData) {
      const answerDataArray = JSON.parse(answerData);
      if (answerDataArray.length > 0) {
        const answerDataObj = answerDataArray.find(answer => answer.productAspect === component);

        if(answerDataObj) {
          answerData = JSON.stringify(answerDataObj.result);
          taskStatusForComponent = answerDataObj.status;
        }
      }
    }

    const data: TaskSubmission = {
      id: toString(get(submissionJSONObject, "ID", "")),
      uuid: toString(get(submissionJSONObject, "UUID", "")),
      taskName: toString(get(submissionJSONObject, "TaskName", "")),
      taskType: toString(get(submissionJSONObject, "TaskType", "")),
      taskStatusForComponent: taskStatusForComponent,
      status: taskStatus,
      result: toString(get(submissionJSONObject, "Result", "")),
      informationClassificationTaskResult: toString(get(submissionJSONObject, "InformationClassificationTaskResult", "")),
      submitter: UserParser.parseUserFromJSON(get(submissionJSONObject, "Submitter")),
      lockWhenComplete: Boolean(get(submissionJSONObject, "LockAnswersWhenComplete", false)),
      questionnaireSubmissionUUID: toString(get(submissionJSONObject, "QuestionnaireSubmission.UUID", "")),
      questionnaireSubmissionID: toString(get(submissionJSONObject, "QuestionnaireSubmission.ID", "")),
      questionnaireSubmissionStatus: toString(get(submissionJSONObject, "QuestionnaireSubmission.QuestionnaireStatus", "")),
      questionnaireSubmissionProductName: toString(get(submissionJSONObject, "QuestionnaireSubmission.ProductName", "")),
      isBusinessOwner: get(submissionJSONObject, "QuestionnaireSubmission.IsBusinessOwner", "false") === "true",
      questions: QuestionParser.parseQuestionsFromJSON({
        schemaJSON: toString(get(submissionJSONObject, "QuestionnaireData", "")),
        answersJSON: answerData,
      }),
      selectedComponents: SecurityComponentParser.parseFromJSONOArray(get(submissionJSONObject, "SelectedComponents", [])),
      jiraTickets: JiraTicketParser.parseFromJSONArray(get(submissionJSONObject, "JiraTickets", [])),
      isCurrentUserAnApprover:  get(submissionJSONObject, "IsCurrentUserAnApprover", "false") === "true",
      isTaskApprovalRequired: get(submissionJSONObject, "IsTaskApprovalRequired", false) === "true",
      riskResults: _.has(submissionJSONObject, 'RiskResultData') ? JSON.parse(get(submissionJSONObject, "RiskResultData", "[]")) : "[]",
      taskRecommendations: _.has(submissionJSONObject, 'TaskRecommendationData') ? JSON.parse(_.defaultTo(get(submissionJSONObject, "TaskRecommendationData", "[]"), "[]")) : "[]",
      productAspects:  _.has(submissionJSONObject, 'ProductAspects') ? JSON.parse(get(submissionJSONObject, "ProductAspects", [])) : [],
      componentTarget: toString(get(submissionJSONObject, "ComponentTarget", "")),
      hideWeightsAndScore: _.get(submissionJSONObject, "HideWeightsAndScore", "false") === "true",
      isTaskCollborator: _.get(submissionJSONObject, "IsTaskCollborator", "false") === "true",
      isDisplayPreventMessage: _.get(submissionJSONObject, "IsDisplayPreventMessage", "false") === "true",
      createOnceInstancePerComponent: Boolean(get(submissionJSONObject, "CreateOnceInstancePerComponent", false)),
      preventMessage: toString(get(submissionJSONObject, "PreventMessage", "")),
      siblingSubmissions: TaskParser.parseAlltaskSubmissionforQuestionnaire(submissionJSONObject),
      serviceRegister: TaskParser.parseServiceRegister(serviceRegister),
      riskProfileData:  _.has(submissionJSONObject, 'RiskProfileData') ? JSON.parse(get(submissionJSONObject, "RiskProfileData", [])) : [],
      resultForCertificationAndAccreditation:  _.has(submissionJSONObject, 'ResultForCertificationAndAccreditation') ? JSON.parse(get(submissionJSONObject, "ResultForCertificationAndAccreditation", [])) : []
    };

    return data;
  }

  static async fetchResultForCertificationAndAccreditation(args: { uuid: string, secureToken?: string }): Promise<TaskSubmission> {
    const {uuid, secureToken} = {...args};
    const query = `
query {
  readTaskSubmission(UUID: "${uuid}", SecureToken: "${secureToken || ""}") {
    ID
    UUID
    ResultForCertificationAndAccreditation
  }
}`;

    const responseJSONObject = await GraphQLRequestHelper.request({query});
    const submissionJSONObject = get(responseJSONObject, "data.readTaskSubmission.0", null);

    if (!submissionJSONObject) {
      throw DEFAULT_NETWORK_ERROR;
    }

    const data: TaskSubmission = {
      id: toString(get(submissionJSONObject, "ID", "")),
      uuid: toString(get(submissionJSONObject, "UUID", "")),
      resultForCertificationAndAccreditation:  _.has(submissionJSONObject, 'ResultForCertificationAndAccreditation') ? JSON.parse(get(submissionJSONObject, "ResultForCertificationAndAccreditation", [])) : []
    };

    return data;
  }

  static async batchUpdateTaskSubmissionData(args: BatchUpdateTaskSubmissionDataArgument): Promise<void> {
    const {uuid, questionIDList, answerDataList, csrfToken, secureToken, component} = {...args};

    if (questionIDList.length !== answerDataList.length) {
      throw DEFAULT_NETWORK_ERROR;
    }

    let mutations = [];
    for (let index = 0; index < questionIDList.length; index++) {
      const questionID = questionIDList[index];
      const answerData = answerDataList[index];
      const answerDataStr = window.btoa(unescape(encodeURIComponent(JSON.stringify(answerData))));

      let singleQuery = `
updateQuestion${questionID}: updateTaskSubmission(
  UUID: "${uuid}",
  QuestionID: "${questionID}",
  AnswerData: "${answerDataStr}",
  SecureToken: "${secureToken || ""}",
  Component: "${component || ""}",
) {
  UUID
  Status

}`;
      mutations.push(singleQuery);
    }

    let query = `
mutation {
  ${mutations.join("\n")}
}
`;

    const json = await GraphQLRequestHelper.request({query, csrfToken});
    const updatedData = get(json, "data", null);
    if (!updatedData) {
      throw DEFAULT_NETWORK_ERROR;
    }
  }

  static async completeTaskSubmission(args: {
    uuid: string,
    result: string,
    csrfToken: string,
    secureToken: string,
    component: string,
  }): Promise<{ uuid: string }> {
    const {uuid, result, csrfToken, secureToken, component} = {...args};
    let query = `
mutation {
 completeTaskSubmission(UUID: "${uuid}", Result: "${result}", SecureToken: "${secureToken || ""}", Component: "${component || ""}") {
   UUID
   Status
 }
}`;

    const json = await GraphQLRequestHelper.request({query, csrfToken});
    if (!get(json, "data.completeTaskSubmission.UUID", null)) {
      throw DEFAULT_NETWORK_ERROR;
    }
    return {uuid};
  }

  static async editTaskSubmission(args: { uuid: string, csrfToken: string, secureToken?: string, component?: string }): Promise<{ uuid: string }> {
    const {uuid, csrfToken, secureToken, component} = {...args};

    const query = `
mutation {
 editTaskSubmission(UUID: "${uuid}", SecureToken: "${secureToken || ""}", Component: "${component || ""}") {
   UUID
   Status
 }
}`;

    const json = await GraphQLRequestHelper.request({query, csrfToken});
    if (!get(json, "data.editTaskSubmission.UUID", null)) {
      throw DEFAULT_NETWORK_ERROR;
    }
    return {uuid};
  }

  static async fetchStandaloneTask(args: { taskId: string }): Promise<Task> {
    const {taskId} = {...args};
    const query = `
query {
  readTask(ID: "${taskId}") {
    ID
    Name
    TaskType
    QuestionsDataJSON
  }
}`;

    const responseJSONObject = await GraphQLRequestHelper.request({query});
    const taskJSONObject = get(responseJSONObject, "data.readTask", null);
    if (!taskJSONObject) {
      throw DEFAULT_NETWORK_ERROR;
    }
    const task = TaskParser.parseFromJSONObject(taskJSONObject);

    return task;
  }

  static async updateTaskSubmissionWithSelectedComponents(
    args: {
      uuid: string,
      csrfToken: string,
      components: Array,
      jiraKey: string
    }
  ): Promise<{ uuid: string }> {
    const {uuid, csrfToken, components, jiraKey} = {...args};
    const query = `
mutation {
 updateTaskSubmissionWithSelectedComponents(
 UUID: "${uuid}",
 Components: "${window.btoa(JSON.stringify(components))}",
 JiraKey: "${jiraKey}"
 ) {
   UUID
   Status
 }
}`;

    const json = await GraphQLRequestHelper.request({query, csrfToken});
    if (!get(json, "data.updateTaskSubmissionWithSelectedComponents.UUID", null)) {
      throw DEFAULT_NETWORK_ERROR;
    }
    return {uuid};
  }

  static async approveTaskSubmission(argument: { uuid: string, csrfToken: string }): Promise<{ uuid: string }> {
    const {uuid, csrfToken} = {...argument};
    const query = `
mutation {
 updateTaskStatusToApproved(UUID: "${uuid}") {
   Status
   UUID
 }
}`;
    const json = await GraphQLRequestHelper.request({query, csrfToken});
    const status = toString(
      get(json, "data.updateTaskStatusToApproved.Status", null));
    if (!status || !uuid) {
      throw DEFAULT_NETWORK_ERROR;
    }
    return {status};
  }

  static async denyTaskSubmission(argument: { uuid: string, csrfToken: string }): Promise<{ uuid: string }> {
    const {uuid, csrfToken} = {...argument};
    const query = `
mutation {
 updateTaskStatusToDenied(UUID: "${uuid}") {
   Status
   UUID
 }
}`;
    const json = await GraphQLRequestHelper.request({query, csrfToken});
    const status = toString(
      get(json, "data.updateTaskStatusToDenied.Status", null)
    );
    if (!status || !uuid) {
      throw DEFAULT_NETWORK_ERROR;
    }
    return {status};
  }

    static async updateTaskRecommendation(argument: { uuid: string, csrfToken: string, taskRecommendations: Array<TaskRecommendation> }): Promise<{ uuid: string }> {
      const {uuid, csrfToken, taskRecommendations} = {...argument};
      const query = `
  mutation {
    updateTaskRecommendation(
      UUID: "${uuid}",
      TaskRecommendationData: "${window.btoa(unescape(encodeURIComponent(JSON.stringify(taskRecommendations))))}"
    ) {
     TaskRecommendationData
     UUID
   }
  }`;
      const json = await GraphQLRequestHelper.request({query, csrfToken});
      const taskRecommendationData = _.has(json, 'TaskRecommendationData') ? JSON.parse(get(submissionJSONObject, "TaskRecommendationData", "[]")) : "[]";
      if (!taskRecommendationData || !uuid) {
        throw DEFAULT_NETWORK_ERROR;
      }
      return {taskRecommendationData};
    }

  // load data for Awaiting Approvals
  static async fetchTaskSubmissionList(userID: string, pageType: string, limit: number, offset: number): Promise<Array<TaskSubmissionListItem>> {
    const query = `query {
      paginatedReadTaskSubmissions(UserID: "${userID}", PageType: "${pageType}", limit: ${limit}, offset: ${offset}) {
        edges {
          node {
            ID
            UUID
            Created
            TaskName
            QuestionnaireSubmission {
              ProductName
            }
            Submitter {
              FirstName
              Surname
            }
            Status
          }
        }
        pageInfo {
          hasNextPage
          hasPreviousPage
          totalCount
        }
      }
    }`;

    const json = await GraphQLRequestHelper.request({query});
    const data = get(json, 'data.paginatedReadTaskSubmissions.edges', []);
    const pageInfoData = get(json, 'data.paginatedReadTaskSubmissions.pageInfo', []);

    // TODO: parse data
    if (!Array.isArray(data)) {
      throw 'error';
    }

    const pageInfo : PaginationInfo = {
      totalCount: get(pageInfoData, 'totalCount', 0),
      hasNextPage: Boolean(get(pageInfoData, 'hasNextPage', false)),
      hasPreviousPage: Boolean(get(pageInfoData, 'hasPreviousPage', false))
    }

    const taskSubmissionList = data.map((item: any) : TaskSubmissionListItem => {
      let obj = {};
      obj['id'] = get(item, 'node.ID', '');
      obj['uuid'] = get(item, 'node.UUID', '');
      obj['created'] = get(item, 'node.Created', '');
      obj['taskName'] = get(item, 'node.TaskName', '');
      obj['productName'] = get(item, 'node.QuestionnaireSubmission.ProductName', '');
      obj['submitterName'] = toString(get(item, "node.Submitter.FirstName", ""))+ ' ' + toString(get(item, "node.Submitter.Surname", ""));
      obj['status'] = get(item, 'node.Status', '');
      return obj;
    });

    return {
      taskSubmissionList,
      pageInfo,
    }
  }
}
