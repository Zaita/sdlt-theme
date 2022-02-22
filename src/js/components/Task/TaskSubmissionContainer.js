// @flow

import React, {Component} from "react";
import {connect} from "react-redux";
import type {RootState} from "../../store/RootState";
import {Dispatch} from "redux";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import type {Question} from "../../types/Questionnaire";
import {
  editCompletedTaskSubmission,
  loadTaskSubmission,
  loadResultForCertificationAndAccreditation,
  moveToPreviousQuestionInTaskSubmission,
  saveAnsweredQuestionInTaskSubmission,
  approveTaskSubmission,
  denyTaskSubmission,
  inProgressTaskSubmission,
  addTaskRecommendation,
  editTaskRecommendation
} from "../../actions/task";
import TaskSubmission from "./TaskSubmission";
import type {User} from "../../types/User";
import type {
  TaskSubmission as TaskSubmissionType,
  TaskRecommendation
} from "../../types/Task";
import {loadCurrentUser} from "../../actions/user";
import {loadSiteConfig} from "../../actions/siteConfig";
import type {SiteConfig} from "../../types/SiteConfig";

const mapStateToProps = (state: RootState) => {
  return {
    questionnaireSubmission: state.questionnaireState.submissionState,
    taskSubmission: state.taskSubmissionState.taskSubmission,
    siteTitle: state.siteConfigState.siteTitle,
    currentUser: state.currentUserState.user,
    siteConfig: state.siteConfigState.siteConfig,
  };
};

const mapDispatchToProps = (dispatch: Dispatch, props: *) => {
  return {
    dispatchLoadDataAction(uuid: string, secureToken: string, component: string) {
      dispatch(loadCurrentUser());
      dispatch(loadSiteConfig());
      dispatch(loadTaskSubmission({uuid, secureToken, component}));
    },
    dispatchLoadResultForCertificationAndAccreditation(uuid: string, secureToken: string) {
      dispatch(loadResultForCertificationAndAccreditation({uuid, secureToken}));
    },
    dispatchSaveAnsweredQuestionAction(answeredQuestion: Question) {
      dispatch(saveAnsweredQuestionInTaskSubmission({answeredQuestion}));
    },
    dispatchMoveToPreviousQuestionAction(targetQuestion: Question) {
      dispatch(moveToPreviousQuestionInTaskSubmission({targetQuestion}));
    },
    dispatchEditAnswersAction() {
      dispatch(editCompletedTaskSubmission());
    },
    dispatchApproveTaskSubmissionAction(uuid: string) {
      dispatch(approveTaskSubmission(uuid));
    },
    dispatchDenyTaskSubmissionAction(uuid: string) {
      dispatch(denyTaskSubmission(uuid));
    },
    dispatchSendBackForChangesTaskSubmissionAction(uuid: string) {
      dispatch(inProgressTaskSubmission(uuid));
    },
    dispatchAddTaskRecommendationAction(uuid: string, newTaskRecommendation:TaskRecommendation, taskRecommendations: Array<TaskRecommendation>) {
      dispatch(addTaskRecommendation(uuid, newTaskRecommendation, taskRecommendations))
    },
    dispatchEditTaskRecommendationAction(uuid: string, updatedTaskRecommendation:TaskRecommendation, taskRecommendations: Array<TaskRecommendation>) {
      dispatch(editTaskRecommendation(uuid, updatedTaskRecommendation, taskRecommendations))
    }
  };
};

type Props = {
  uuid: string,
  secureToken:string,
  component: string,
  taskSubmission?: TaskSubmissionType | null,
  siteConfig?: SiteConfig | null,
  currentUser?: User | null,
  dispatchLoadDataAction?: (uuid: string, secureToken: string, component: string) => void,
  dispatchApproveTaskSubmissionAction?: (uuid: string) => void,
  dispatchDenyTaskSubmissionAction?: (uuid: string) => void,
  dispatchSendBackForChangesTaskSubmissionAction?: (uuid: string) => void,
  dispatchSaveAnsweredQuestionAction?: (answeredQuestion: Question) => void,
  dispatchMoveToPreviousQuestionAction?: (targetQuestion: Question) => void,
  dispatchEditAnswersAction?: () => void,
  dispatchAddTaskRecommendationAction?: (uuid: string, newTaskRecommendation:TaskRecommendation, taskRecommendations: Array<TaskRecommendation>) => void,
  dispatchEditTaskRecommendationAction?: (uuid: string, updatedTaskRecommendation:TaskRecommendation, taskRecommendations: Array<TaskRecommendation>) => void,

};

class TaskSubmissionContainer extends Component<Props> {

  componentDidMount() {
    const {uuid, dispatchLoadDataAction, secureToken, component} = {...this.props};
    dispatchLoadDataAction(uuid, secureToken, component);
  }

  render() {
    const {
      siteConfig,
      currentUser,
      taskSubmission,
      dispatchSaveAnsweredQuestionAction,
      dispatchMoveToPreviousQuestionAction,
      dispatchEditAnswersAction,
      dispatchApproveTaskSubmissionAction,
      dispatchDenyTaskSubmissionAction,
      dispatchSendBackForChangesTaskSubmissionAction,
      dispatchAddTaskRecommendationAction,
      dispatchEditTaskRecommendationAction,
      secureToken,
      component
    } = {...this.props};

    if (!currentUser || !taskSubmission || !siteConfig) {
      return null;
    }

    // Decide what the permission of the current user
    let viewAs = "others";

    do {
      // Check if the current user is the submitter
      if (parseInt(currentUser.id) === parseInt(taskSubmission.submitter.id)) {
        viewAs = "submitter";
        break;
      }

      // Check if the current user is an approver
      if (taskSubmission.isCurrentUserAnApprover) {
        viewAs = "approver";
        break;
      }
    } while (false);

    // As logged-in user, only submitter and SA can edit answers
    const isCurrentUserSubmitter = parseInt(currentUser.id) === parseInt(taskSubmission.submitter.id);

    const canUpdateAnswers = (taskSubmission.status === "in_progress" ||
      taskSubmission.status === "start" ) && (currentUser.isSA || isCurrentUserSubmitter || taskSubmission.isTaskCollborator);
    const showEditButton =
      (taskSubmission.status === "complete" || taskSubmission.status === "waiting_for_approval"
      || taskSubmission.status === "denied")
      && (taskSubmission.questionnaireSubmissionStatus === "submitted")
      && (currentUser.isSA || ((isCurrentUserSubmitter || taskSubmission.isTaskCollborator)
      && !taskSubmission.lockWhenComplete));

    // used to display breadcrumbs
    let showSubmissionBreadcrumb = false;
    let showApprovalBreadcrumb = false;

    if (isCurrentUserSubmitter || taskSubmission.isTaskCollborator) {
      showSubmissionBreadcrumb = true;
    }

    if (!showSubmissionBreadcrumb) {
      if (taskSubmission.isCurrentUserAnApprover ||
        currentUser.isSA ||
        currentUser.isCISO ||
        taskSubmission.isBusinessOwner ||
        currentUser.isAccreditationAuthority ||
        currentUser.isCertificationAuthority) {
        showApprovalBreadcrumb = true;
      }
    }

    return (
      <div className="TaskSubmissionContainer">
        <Header
          pageTitle={taskSubmission.taskName}
          logopath={siteConfig.logoPath}
          productName={taskSubmission.questionnaireSubmissionProductName}
          isTaskApprover={taskSubmission.isCurrentUserAnApprover}
          questionnaireSubmissionUUID={taskSubmission.questionnaireSubmissionUUID}
          showApprovalBreadcrumb={showApprovalBreadcrumb}
          showSubmissionBreadcrumb={showSubmissionBreadcrumb}
        />
        <TaskSubmission
          taskSubmission={taskSubmission}
          saveAnsweredQuestion={dispatchSaveAnsweredQuestionAction}
          moveToPreviousQuestion={dispatchMoveToPreviousQuestionAction}
          editAnswers={dispatchEditAnswersAction}
          showEditButton={showEditButton}
          canUpdateAnswers={canUpdateAnswers}
          handleApproveButtonClick={this.handleApproveButtonClick.bind(this)}
          handleDenyButtonClick={this.handleDenyButtonClick.bind(this)}
          handleSendBackForChangesButtonClick={this.handleSendBackForChangesButtonClick.bind(this)}
          handleAddTaskRecommendationButtonClick={this.handleAddTaskRecommendationButtonClick.bind(this)}
          handleEditTaskRecommendationButtonClick={this.handleEditTaskRecommendationButtonClick.bind(this)}
          loadResultForCertificationAndAccreditation={this.loadResultForCertificationAndAccreditation.bind(this)}
          showBackLink={!!taskSubmission.questionnaireSubmissionUUID}
          viewAs={viewAs}
          siteConfig={siteConfig}
          secureToken={secureToken}
          component={component}
        />
        <Footer footerCopyrightText={siteConfig.footerCopyrightText}/>
      </div>
    );
  }

  handleApproveButtonClick() {
    const {user, isCurrentUserAnApprover, uuid} = {...this.props.taskSubmission};

    if (!user && !uuid && !isCurrentUserAnApprover) {
      return;
    }

    this.props.dispatchApproveTaskSubmissionAction(uuid);
  }

  handleSendBackForChangesButtonClick() {
    const {user, isCurrentUserAnApprover, uuid} = {...this.props.taskSubmission};

    if (!user && !uuid && !isCurrentUserAnApprover) {
      return;
    }

    this.props.dispatchSendBackForChangesTaskSubmissionAction(uuid);
  }

  handleDenyButtonClick() {
    const {user, isCurrentUserAnApprover, uuid} = {...this.props.taskSubmission};

    if (!user && !uuid && !isCurrentUserAnApprover) {
      return;
    }
    this.props.dispatchDenyTaskSubmissionAction(uuid);
  }

  handleAddTaskRecommendationButtonClick(recommendationObj) {
    const {user, isCurrentUserAnApprover, uuid, taskRecommendations} = {...this.props.taskSubmission};

    if (!user && !uuid && !isCurrentUserAnApprover && !taskRecommendations) {
      return;
    }

    this.props.dispatchAddTaskRecommendationAction(uuid, recommendationObj, taskRecommendations);
  }

  handleEditTaskRecommendationButtonClick(updatedRecommendationObj) {
    const {user, isCurrentUserAnApprover, uuid, taskRecommendations} = {...this.props.taskSubmission};

    if (!user && !uuid && !isCurrentUserAnApprover && !taskRecommendations) {
      return;
    }

    this.props.dispatchEditTaskRecommendationAction(uuid, updatedRecommendationObj, taskRecommendations);
  }

  loadResultForCertificationAndAccreditation() {
    const {uuid, dispatchLoadResultForCertificationAndAccreditation, secureToken} = {...this.props};
    dispatchLoadResultForCertificationAndAccreditation(uuid, secureToken);
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(TaskSubmissionContainer);
