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
import ArrowBackSVG from "@material-ui/icons/ArrowBack";
import EditPencilSVG from "@material-ui/icons/Edit";
import DownloadSVG from "@material-ui/icons/GetApp";
import CertificationAndAccreditationResultContainer from "./CertificationAndAccreditationResultContainer";

type Props = {
  taskSubmission: TaskSubmissionType,
  saveAnsweredQuestion: (answeredQuestion: Question, component: string) => void,
  moveToPreviousQuestion: (targetQuestion: Question, component: string) => void,
  handleApproveButtonClick: () => void,
  handleSendBackForChangesButtonClick: () => void,
  handleDenyButtonClick: () => void,
  loadResultForCertificationAndAccreditation: () => void,
  handleAddTaskRecommendationButtonClick: () => void,
  handleEditTaskRecommendationButtonClick: () => void,
  showBackButton: boolean,
  showEditButton: boolean,
  canUpdateAnswers: boolean,
  secureToken: string,
  component: string
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
      loadResultForCertificationAndAccreditation,
      editAnswers,
      showBackLink,
      showEditButton,
      canUpdateAnswers,
      viewAs,
      secureToken,
      component
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

    const backLinkSelector = () => {
      if (displayPreviousQuestionBackLink) {
        return previousQuestionBackLink();
      } else {
        return backLink();
      }
    }


    const currentQuestion = taskSubmission.questions.find(question => question.isCurrent);
    const currentQuestionIndex = taskSubmission.questions.indexOf(currentQuestion);
    const previousQuestion = taskSubmission.questions[currentQuestionIndex - 1];
    const displayPreviousQuestionBackLink = taskSubmission.taskType == "risk questionnaire" && currentQuestionIndex !== 0 && taskSubmission.status !== "complete";

    const backLink = () => {
      return (
        <div className="back-link" onClick={() => this.sendBackToQestionnaire()}>
          <ArrowBackSVG/>          
          Back
        </div>
      );
    };

    const previousQuestionBackLink = () => {
      return (
        <div
          className="back-link"
          onClick={() => moveToPreviousQuestion(previousQuestion, component)}
        >
          <ArrowBackSVG/>
          Back
        </div>
      );
    };

    const backLinkTaskApprover = () => {
      return (
        <div
          className="back-link"
          onClick={() => URLUtil.redirectToApprovals()}
        >
          <ArrowBackSVG/>
          Back
        </div>
      );
    };

    const isSRATaskFinalised = taskSubmission.taskType === 'risk questionnaire' && SecurityRiskAssessmentUtil.isSRATaskFinalised(taskSubmission.siblingSubmissions);

    const editButton = showEditButton && !isSRATaskFinalised && taskSubmission.taskType !== "certification and accreditation"? (
      <LightButton
        title="Edit"
        onClick={() => {editAnswers(component)}}
        svgImage={<EditPencilSVG/>}
      />
    ) : null;

    const resultStatus = ["complete", "waiting_for_approval", "approved", "denied"];
    const pdfButton = (
      resultStatus.includes(taskSubmission.status) ||
      resultStatus.includes(taskSubmission.taskStatusForComponent)
    ) ? (
      <LightButton title={"PDF"} svgImage={<DownloadSVG/>} onClick={() => this.downloadPdf()}/>
    ) : null;

    const doneButton = (
      resultStatus.includes(taskSubmission.status) ||
      resultStatus.includes(taskSubmission.taskStatusForComponent)
    ) ? (
      <LightButton title={"Done"} onClick={() => this.sendBackToQestionnaire()}/>
    ) : null;

    const result = taskSubmission.result && (resultStatus.indexOf(taskSubmission.status) > -1) ? (
      <div className="result-container">
        <h4>Result</h4>
        <div className="result">{taskSubmission.result}</div>
      </div>
    ) : null;

    const riskResult = taskSubmission.riskResults && (resultStatus.indexOf(taskSubmission.taskStatusForComponent) > -1) ? (
      <RiskResultContainer
        riskResults={taskSubmission.riskResults}
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
        {
          taskSubmission.taskType !== "certification and accreditation" &&
          <AnswersPreview questions={taskSubmission.questions} component={component}/>
        }
        {
          !taskSubmission.isDisplayPreventMessage &&
          taskSubmission.taskType === "certification and accreditation" &&
          <div className="task-review-container">
            <CertificationAndAccreditationResultContainer
              resultForCertificationAndAccreditation={taskSubmission.resultForCertificationAndAccreditation}
              isDisplayReportLogo={true}
            />
          </div>
        }
        {riskResult}
        {taskRecommendationContainer}
      </div>
    );

    if (taskSubmission.taskType === "certification and accreditation" && taskSubmission.isDisplayPreventMessage) {
      body = (
        <div
          className="prevent-message-container alert alert-danger"
          dangerouslySetInnerHTML={{
            __html: taskSubmission.preventMessage
          }}
        >
        </div>
      );
   }

    else if (canUpdateAnswers) {
      body = (
        <Questionnaire
          questions={taskSubmission.questions}
          serviceRegister={taskSubmission.serviceRegister}
          informationClassificationTaskResult={taskSubmission.informationClassificationTaskResult}
          riskProfileData={taskSubmission.riskProfileData}
          resultForCertificationAndAccreditation={taskSubmission.resultForCertificationAndAccreditation}
          loadResultForCertificationAndAccreditation={loadResultForCertificationAndAccreditation}
          saveAnsweredQuestion={saveAnsweredQuestion}
          onLeftBarItemClick={moveToPreviousQuestion}
          handleTaskSaveDraftButtonClick={this.handleTaskSaveDraftButtonClick.bind(this)}
          component={component}
          questionnaireTitle={taskSubmission.taskName}
          taskSubmissionTaskType={taskSubmission.taskType}
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
              {backLinkSelector()}
              {body}
              <div className={`buttons ${viewAs != "approver" ? 'buttons-hideborder': ''}`}>
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
                  {doneButton}
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

    if (taskSubmission.taskType === "certification and accreditation") {
      PDFUtil.downloadCertificate({
        siteConfig: siteConfig,
        resultForCertificationAndAccreditation: taskSubmission.resultForCertificationAndAccreditation
      });
    } else {
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

  handleTaskSaveDraftButtonClick() {
    this.sendBackToQestionnaire();
  }

  sendBackToQestionnaire() {
    URLUtil.redirectToQuestionnaireSummary(this.props.taskSubmission.questionnaireSubmissionUUID, this.props.secureToken)
  }
}

export default TaskSubmission;
