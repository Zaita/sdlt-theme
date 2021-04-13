// @flow

// Questionnaire Schema

import type {User} from "./User";
import type {TaskSubmissionDisplay} from "./Task";

export type AnswerInput = {
  id: string,
  label: string,
  type: string, //"text" | "email" | "textarea" | "product aspects" | "date" | "radio" | "checkbox" | "release date",
  required: boolean,
  minLength: number,
  placeholder: string,
  data: string | null,
  options: Array<{'value': string, 'label': string}>,
  defaultRadioButtonValue: string,
  defaultCheckboxValue: Array<any>
}

export type AnswerAction = {
  id: string,
  label: string,
  type: string, //"continue" | "goto" | "message" | "finish",
  isChose: boolean,
  message?: string,
  taskID?: string,
  goto?: string,
  result?: string
}

export type Question = {
  id: string,
  title: string,
  heading: string,
  description: string,
  type: "input" | "action",
  inputs?: Array<AnswerInput>,
  actions?: Array<AnswerAction>,
  isCurrent: boolean,
  hasAnswer: boolean,
  isApplicable: boolean
};

export type Submission = {
  questionnaireID: string,
  questionnaireTitle: string,
  submissionID: string,
  submissionUUID: string,
  submissionToken: string,
  businessOwnerApproverName: string,
  submitter: User,
  questions: Array<Question>,
  status: string, //"in_progress" | "waiting_for_approval" | "approved" | "rejected" | "expired"
  approvalStatus: {
    chiefInformationSecurityOfficer: string,
    businessOwner: string,
    securityArchitect: string
  },
  cisoApprover: {
    FirstName: string,
    Surname: string,
  },
  securityArchitectApprover: {
    FirstName: string,
    Surname: string,
  },
  taskSubmissions: Array<TaskSubmissionDisplay>,
  isApprovalOverrideBySecurityArchitect: boolean,
  hideWeightsAndScore: boolean,
  productName: string,
  riskResults: Array<RiskResult>,
  collaborators: Array<User>
};

// Submission Data
export type SubmissionInputData = {
  id: string,
  data: string | null
}

export type SubmissionActionData = {
  id: string,
  isChose: boolean
};

export type RiskResult = {
  riskName: string,
  weights: string,
  score: string,
  rating: string,
  color: string
};

export type SubmissionQuestionData = {
  isCurrent: boolean,
  hasAnswer: boolean,
  isApplicable: boolean,
  answerType: "input" | "action",
  inputs?: Array<SubmissionInputData>,
  actions?: Array<SubmissionActionData>
};

export type QuestionnaireSubmissionListItem = {
  id: string,
  uuid: string,
  questionnaireName: string,
  created: string,
  productName: string,
  status: string,
  startLink: string,
  summaryPageLink: string,
  businessOwner: string,
  securityArchitectApprover: string,
  CisoApprovalStatus: string,
  businessOwnerApprovalStatus: string,
  submitterName: string,
  releaseDate: string
};
