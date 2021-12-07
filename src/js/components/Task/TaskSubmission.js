// @flow

import React, {Component} from "react";
import Questionnaire from "../Questionnaire/Questionnaire";
import AnswersPreview from "../Questionnaire/AnswersPreview";
import type {TaskSubmission as TaskSubmissionType} from "../../types/Task";
import type {Question} from "../../types/Questionnaire";
import editIcon from "../../../img/icons/edit-icon.svg";
import LightButton from "../Button/LightButton";
import RedButton from "../Button/RedButton";
import URLUtil from "../../utils/URLUtil";
import DarkButton from "../Button/DarkButton";
import pdfIcon from "../../../img/icons/download.svg";
import PDFUtil from "../../utils/PDFUtil";
import RiskResultContainer from "../Common/RiskResultContainer";
import TaskRecommendationContainer from "./TaskRecommendationContainer";
import SecurityRiskAssessmentUtil from "../../utils/SecurityRiskAssessmentUtil";
import {SubmissionExpired} from "../Common/SubmissionExpired";
import BackArrow from "../../../img/icons/back-arrow.svg";

type Props = {
  taskSubmission: TaskSubmissionType,
  saveAnsweredQuestion: (answeredQuestion: Question) => void,
  moveToPreviousQuestion: (targetQuestion: Question) => void,
  handleApproveButtonClick: () => void,
  handleSendBackForChangesButtonClick: () => void,
  handleDenyButtonClick: () => void,
  handleAddTaskRecommendationButtonClick: () => void,
  handleEditTaskRecommendationButtonClick: () => void,
  showBackButton: boolean,
  showEditButton: boolean,
  canUpdateAnswers: boolean,
  secureToken: string
};

class TaskSubmission extends Component<Props> {
  render() {
    const {
      taskSubmission,
      saveAnsweredQuestion,
      moveToPreviousQuestion,
      handleApproveButtonClick,
      handleDenyButtonClick,
      handleSendBackForChangesButtonClick,
      handleAddTaskRecommendationButtonClick,
      handleEditTaskRecommendationButtonClick,
      editAnswers,
      showBackLink,
      showEditButton,
      canUpdateAnswers,
      viewAs,
      secureToken
    } = {...this.props};

    const taskRecommendationContainer = (
      <TaskRecommendationContainer
        taskRecommendations={taskSubmission.taskRecommendations}
        viewAs={viewAs}
        status={taskSubmission.status}
        handleAddTaskRecommendationButtonClick={handleAddTaskRecommendationButtonClick}
        handleEditTaskRecommendationButtonClick={handleEditTaskRecommendationButtonClick}
      />
    );

    const backLink = showBackLink ? (
      <div
      className="back-link"
      onClick={() => URLUtil.redirectToQuestionnaireSummary(taskSubmission.questionnaireSubmissionUUID, secureToken)}
      >
        <img src={BackArrow}/> Back
      </div>
    ) : null;

    const isSRATaskFinalised = taskSubmission.taskType === 'risk questionnaire' && SecurityRiskAssessmentUtil.isSRATaskFinalised(taskSubmission.siblingSubmissions);

    const editButton = showEditButton && !isSRATaskFinalised ? (
      <LightButton
        title="Edit"
        onClick={editAnswers}
        iconImage={editIcon}
      />
    ) : null;

    const resultStatus = ["complete", "waiting_for_approval", "approved", "denied"];
    const pdfButton = (resultStatus.indexOf(taskSubmission.status) > -1) ? (
      <LightButton title={"PDF"} iconImage={pdfIcon} onClick={() => this.downloadPdf()}/>
    ) : null;

    const result = taskSubmission.result && (resultStatus.indexOf(taskSubmission.status) > -1) ? (
      <div className="result-container">
        <h4>Result</h4>
        <div className="result">{taskSubmission.result}</div>
      </div>
    ) : null;

    const riskResult = taskSubmission.riskResults && (resultStatus.indexOf(taskSubmission.status) > -1) ? (
      <RiskResultContainer
        riskResults={taskSubmission.riskResults}
        hideWeightsAndScore={taskSubmission.hideWeightsAndScore}
      />
    ) : null;

    const approveButton = (viewAs === "approver" && taskSubmission.status === "waiting_for_approval") ? (
      <DarkButton title={"Approve"} onClick={handleApproveButtonClick} classes={["button"]}/>
    ) : null;

    const sendBackForChangesButton = (viewAs === "approver" && taskSubmission.status === "waiting_for_approval") ? (
      <LightButton title={"Send back for changes"} onClick={handleSendBackForChangesButtonClick} classes={["button"]}/>
    ) : null;

    const denyButton = (viewAs === "approver" && taskSubmission.status === "waiting_for_approval") ? (
      <RedButton title={"Not approved"} onClick={handleDenyButtonClick} classes={["button"]}/>
    ) : null;

    let body = (
      <div>
        {result}
        <h4>Summary</h4>
        <AnswersPreview questions={taskSubmission.questions}/>
        {riskResult}
        {taskRecommendationContainer}
      </div>
    );

    if (canUpdateAnswers) {
      body = (
        <Questionnaire
          questions={taskSubmission.questions}
          serviceRegister={taskSubmission.serviceRegister}
          informationClassificationTaskResult={taskSubmission.informationClassificationTaskResult}
          riskProfileData={taskSubmission.riskProfileData}
          saveAnsweredQuestion={saveAnsweredQuestion}
          onLeftBarItemClick={moveToPreviousQuestion}
        />
      );
    }

    return (
      <div className="TaskSubmission">
        {taskSubmission.status === 'expired' && <SubmissionExpired/>}
        {
          taskSubmission.status !== 'expired' && (
            <div>
              {
                taskSubmission.taskType === 'risk questionnaire' &&
                isSRATaskFinalised ? SecurityRiskAssessmentUtil.getSraIsFinalisedAlert() : false
              }
              {backLink}
              {body}
              <div className="buttons">
                <div className="buttons-left">
                  {editButton}
                  {pdfButton}
                </div>
                <div className="buttons-right">
                  {
                    viewAs === "approver" &&
                    taskSubmission.status === "waiting_for_approval" &&
                    <span className="approver-action">Approver action: </span>
                  }
                  {sendBackForChangesButton}
                  {denyButton}
                  {approveButton}
                </div>
              </div>
            </div>
          )
        }
      </div>
    );
  }

  downloadPdf() {
    const {
      taskSubmission,
      currentUser,
      siteConfig
    } = {...this.props};

    if (!taskSubmission && !siteConfig && !currentUser) {
      return;
    }

    PDFUtil.generatePDF({
      questions: taskSubmission.questions,
      submitter: taskSubmission.submitter.email ? taskSubmission.submitter : currentUser,
      questionnaireTitle: taskSubmission.taskName,
      siteConfig: siteConfig,
      result: taskSubmission.result,
      riskResults: taskSubmission.riskResults,
    });
  }
}

export default TaskSubmission;
