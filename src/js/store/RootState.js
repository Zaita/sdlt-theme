// @flow

import type {HomeState} from "./HomeState";
import type {QuestionnaireState} from "./QuestionnaireState";
import type {TaskSubmissionState} from "./TaskSubmissionState";
import type {SiteConfigState} from "./SiteConfigState";
import type {CurrentUserState} from "./CurrentUserState";
import type {ComponentSelectionState} from "./ComponentSelectionState";
import type {SecurityRiskAssessmentState} from "./SecurityRiskAssessmentState";
import type {LoadingState} from "./LoadingState";
import type {MemberState} from "./MemberState";
import type {} from "./ControlValidatioAuditState";
import type {
  MySubmissionListState,
  QuestionnaireSubmissionListState
} from "./QuestionnaireSubmissionListState";

export type RootState = {
  homeState: HomeState,
  questionnaireState: QuestionnaireState,
  taskSubmissionState: TaskSubmissionState,
  siteConfigState: SiteConfigState,
  currentUserState: CurrentUserState,
  componentSelectionState: ComponentSelectionState,
  mySubmissionListState: MySubmissionListState,
  questionnaireSubmissionListState: QuestionnaireSubmissionListState,
  securityRiskAssessmentState: SecurityRiskAssessmentState,
  controlValidatioAuditState: ControlValidatioAuditState,
  loadingState: LoadingState,
  memberState: MemberState
}
