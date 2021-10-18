// @flow

import React, {Component} from "react";
import {Link} from "react-router-dom";
import type {Submission} from "../../types/Questionnaire";
import LightButton from "../Button/LightButton";
import DarkButton from "../Button/DarkButton";
import RedButton from "../Button/RedButton";
import pdfIcon from "../../../img/icons/download.svg";
import editIcon from "../../../img/icons/edit-icon.svg";
import approveIcon from "../../../img/icons/approve.svg";
import notApprovedIcon from "../../../img/icons/not-approved.svg";
import awaitingApprovalIcon from "../../../img/icons/awaiting-approval.svg";
import _ from "lodash";
import URLUtil from "../../utils/URLUtil";
import SubmissionDataUtil from "../../utils/SubmissionDataUtil";
import type {User} from "../../types/User";
import type {Collaborator} from "../../types/User";
import RiskResultContainer from "../Common/RiskResultContainer";
import {
  DEFAULT_SRA_UNFINISHED_TASKS_MESSAGE
} from "../../constants/values";
import SecurityRiskAssessmentUtil from "../../utils/SecurityRiskAssessmentUtil";
import {SubmissionExpired} from "../Common/SubmissionExpired";
import AddIcon from '@material-ui/icons/AddCircleOutline';
import CloseIcon from '@material-ui/icons/Close';
import ReactModal from "react-modal";
import IconButton from '@material-ui/core/IconButton';
import Select from 'react-select'

type Props = {
  submission: Submission | null,
  handlePDFDownloadButtonClick: () => void,
  handleSubmitButtonClick: () => void,
  handleAssignToMeButtonClick: () => void,
  handleApproveButtonClick: (skipBoAndCisoApproval: boolean) => void,
  handleDenyButtonClick: (skipBoAndCisoApproval: boolean) => void,
  handleSendBackForChangesButtonClick: () => void,
  handleEditButtonClick: () => void,
  handleCollaboratorAddButtonClick: (selectedCollaborators: Array<Collaborator>) => void,
  viewAs: "submitter" | "approver" | "others",
  token: string,
  user: User | null,
  members: Array<User> | null
};

type State = {
  showModal: boolean
};

const prettifyStatus = (status: string) => {
  if (!status) {
    return;
  }
  return status
    .split("_")
    .map((str) => {
      return str.charAt(0).toUpperCase() + str.slice(1);
    })
    .join(" ");
};

const prettifyApprovalStatus = (status: string) => {
  if (!status) {
    return;
  }

  if (status == "pending") {
    return "Awaiting approval";
  }

  if (status == "denied") {
    return "Not approved"
  }

  if (status == "not_required") {
    return "Not required"
  }

  return prettifyStatus(status);
}

class Summary extends Component<Props> {

  static defaultProps = {
    submission: null,
    handlePDFDownloadButtonClick: () => {},
    handleSubmitButtonClick: () => {},
    handleSendBackForChangesButtonClick: () => {},
    handleApproveButtonClick: () => {},
    handleDenyButtonClick: () => {},
    handleEditButtonClick: () => {},
    handleAssignToMeButtonClick: () => {},
    handleCollaboratorAddButtonClick: () => {},
    viewAs: "others",
    showNotApproveButton: false,
    token: "",
    user: null,
    members: null
  };

  constructor(props) {
    super(props);
    this.state = {
      skipBoAndCisoApproval: false,
      showModal: false,
      selectedCollaborators: props.submission.collaborators
    }
  }

  unfinishedTaskSubmissionMessage()
  {
    const taskSubmissions = this.props.submission.taskSubmissions;
    let unfinishedMessage = '';

    const filteredTask = taskSubmissions.filter((taskSubmission)=> {
      return taskSubmission.taskType === 'risk questionnaire'
    });

    if (filteredTask.length > 0) {
      const riskQuestionnaireTask = filteredTask[0];
      const isRQCompleted = (riskQuestionnaireTask.status === 'complete' || riskQuestionnaireTask.status == "approved");
      if(riskQuestionnaireTask && !isRQCompleted) {
        unfinishedMessage = `Please complete "${riskQuestionnaireTask.taskName}" to see the Security Risk Assessment`;
      }
    }

    return unfinishedMessage;
  }

  hasSelectableComponents(sub)
  {
    let taskSubmissions = sub.taskSubmissions,
      hasSelectableComponents = false;

    taskSubmissions.forEach((submission, index) => {
      let isComponentSelection = (submission.taskType === 'selection');
      if(isComponentSelection) {
        hasSelectableComponents = true;
      }
    });

    return hasSelectableComponents;
  }

  // when click add button in modal, add in the database
  handleAddCollaboratorsModalButtonClick() {
    this.props.handleCollaboratorAddButtonClick(this.state.selectedCollaborators);
    this.handleCloseModalForCollaborators();
  }

  // Open the collaborators modal when click on add collaborators link on summary page
  handleOpenModalForCollaborators() {
    this.setState({showModal: true});
  }

  handleCloseModalForCollaborators() {
    this.setState({showModal: false});
    this.setState({selectedCollaborators: this.props.submission.collaborators});
  }

  handleChangeForCollaborators(selectedCollaborators: Array<Collaborator>) {
    this.setState({selectedCollaborators: selectedCollaborators});
  }

  render() {
    const {submission, viewAs, user, members} = {...this.props};
    if (!submission || !members) {
      return null;
    }

    if (submission.status === "in_progress" && viewAs === "submitter") {
      return (
        <div className="Summary">
          <h4>
            Questionnaire Submission has not been completed...
          </h4>
        </div>
      );
    }

    if (submission.status === "expired") {
      return (
        <SubmissionExpired/>
      );
    }

    return (
      <div className="Summary">
        {this.renderSubmitterAndCollaboratorInfo(submission, members)}
        {this.renderTasks(submission)}
        {this.renderApprovals(submission)}
        <RiskResultContainer
          riskResults={submission.riskResults}
          hideWeightsAndScore={submission.hideWeightsAndScore}
        />
        {this.renderSkipCheckbox(submission, viewAs, user)}
        {this.renderButtons(submission)}
      </div>
    );
  }

  renderCollboratorsModal(submission, members) {
    return (
      <ReactModal
        isOpen={this.state.showModal}
        ariaHideApp={false}
        parentSelector={() => {return document.querySelector(".Summary");}}
      >
        <div className="collaborator-model-title">
          <span><h4>Add Collaborators</h4></span>
          <IconButton
            aria-label="close"
            component="span"
            className="collaborator-model-close icon-gray"
            onClick={this.handleCloseModalForCollaborators.bind(this)}
          >
            <CloseIcon />
          </IconButton>
        </div>
        <div className="content">
          Start typing names, to add them as collaborators for your submission.
        </div>
        <div className="content">
          <Select
            options={members}
            defaultValue={submission.collaborators}
            isMulti={true}
            maxMenuHeight={200}
            onChange={this.handleChangeForCollaborators.bind(this)}
          />
        </div>
        <div>
          <DarkButton title="Add" onClick={this.handleAddCollaboratorsModalButtonClick.bind(this)}/>
        </div>
      </ReactModal>
    )
  }

  renderCollboratorsInfo(submission: Submission, members) {
    return (
      <div>
        <h4>Collaborators</h4>
        <div><b>Add people to help complete your submission.</b></div>
        {submission.collaborators.length > 0 && (
          <div className="collaborators-name-container">
            {submission.collaborators.map(({label}, index) =>
              {
                return(<div key={index}>{label}</div>)
              }
            )}
          </div>
        )}
        {this.props.viewAs === "submitter" && (
          <div>
            <button className="btn add-collaborators-btn" onClick={this.handleOpenModalForCollaborators.bind(this)}>
              <AddIcon className="icon-blue"/>
              Add collaborators
            </button>
          </div>
        )}
        {this.renderCollboratorsModal(submission, members)}
      </div>
    );
  }

  renderSubmitterInfo(submission: Submission) {
    const submitter = submission.submitter;
    return (
      <div>
        <h4>Request Information</h4>
        <div><b>Product Name:</b> {submission.productName} </div>
        <div><b>Submitted by:</b> {submitter.name}</div>
        <div><b>Email:</b> {submitter.email}</div>
        <div><b>Status:</b> {prettifyStatus(submission.status)}</div>
      </div>
    );
  }

  renderSubmitterAndCollaboratorInfo(submission: Submission, members) {
    return (
      <div>
        <div className="card-group">
          <div className="card mr-2 request-info">
            {this.renderSubmitterInfo(submission)}
          </div>
          <div className="card ml-2 request-info">
            {this.renderCollboratorsInfo(submission, members)}
          </div>
        </div>
      </div>
    );
  }

  renderTasks(submission: Submission) {
    const taskSubmissions = submission.taskSubmissions;
    const isSRATaskFinalised = SecurityRiskAssessmentUtil.isSRATaskFinalised(submission.taskSubmissions);

    if (taskSubmissions.length === 0) {
      return null;
    }

    const unfinshedRQTaskMessage = this.unfinishedTaskSubmissionMessage() ? (
      <div className="alert alert-warning">{this.unfinishedTaskSubmissionMessage()}</div>
    ) : null;

    return (
      <div className="tasks">
        <h4>Tasks</h4>
        {unfinshedRQTaskMessage}
        {isSRATaskFinalised ? SecurityRiskAssessmentUtil.getSraIsFinalisedAlert() : null}

        {taskSubmissions.map(({uuid, taskName, taskType, status, approver}) => {
          let taskNameAndStatus = taskName + ' (' + prettifyStatus(status) + ')';

          if (status === "start") {
            taskNameAndStatus = taskName + ' (Please complete me)';
          }

          if (status === "approved"  && approver.name) {
            taskNameAndStatus = taskName + ' (' + prettifyStatus(status) + ' by ' + approver.name + ')';
          }

          if (status === "denied" && approver.name) {
            taskNameAndStatus = taskName + ' (Not Approved by ' + approver.name + ')';
          }

          const {token} = {...this.props};

          let taskRedirectURL = URLUtil.redirectToTaskSubmission(uuid, token, "urlString");

          if (taskType === "selection") {
            taskRedirectURL = URLUtil.redirectToComponentSelectionSubmission(uuid, token, "urlString");
          }

          if (taskType === "security risk assessment") {
            taskRedirectURL = URLUtil.redirectToSecurityRiskAssessment(uuid, token, "urlString");
          }

          if (taskType === "control validation audit") {
            taskRedirectURL = URLUtil.redirectToControlValidationAudit(uuid, token, "urlString");
          }

          const links = (
            <Link to={taskRedirectURL}>
              {taskNameAndStatus}
            </Link>
          );

          return (
            <div key={uuid}>
              {unfinshedRQTaskMessage && taskType === 'security risk assessment' ? null : links}
            </div>
          );
        })}
      </div>
    );
  }

  renderButtons(submission: Submission) {
    const {
      user,
      viewAs,
      showNotApproveButton,
      token,
      handleSubmitButtonClick,
      handlePDFDownloadButtonClick,
      handleSendBackForChangesButtonClick,
      handleApproveButtonClick,
      handleOptionalApproveButtonClick,
      handleAssignToMeButtonClick,
      handleDenyButtonClick,
      handleEditButtonClick
    } = {...this.props};

    const downloadPDFButton = (
      <LightButton title="PDF"
                   iconImage={pdfIcon}
                   classes={["button"]}
                   onClick={handlePDFDownloadButtonClick}/>
    );

    const viewAnswersButton = user ? (
      <LightButton title="VIEW ANSWERS"
                   classes={["button"]}
                   onClick={() => URLUtil.redirectToQuestionnaireReview(submission.submissionUUID, token)}
      />
    ) : '';


    // Display buttons for submitter
    if (viewAs === "submitter") {
      // Render edit answers button for submitter in all cases
      const editAnswersButton = (
        <LightButton title="EDIT ANSWERS"
                     iconImage={editIcon}
                     classes={["button"]}
                     onClick={handleEditButtonClick}
        />
      );

      // Render send for approval button for submitter only in specific submission status
      const sendForApprovalButton = (
        <DarkButton title="SEND FOR APPROVAL"
                    classes={["button"]}
                    disabled={SubmissionDataUtil.existsIncompleteTaskSubmission(submission.taskSubmissions)}
                    onClick={handleSubmitButtonClick}
        />
      );

      if (submission.status === "submitted") {
        return (
          <div className="buttons">
            <div>
              {editAnswersButton}
              {downloadPDFButton}
              {sendForApprovalButton}
            </div>
            <div/>
          </div>
        );
      }

      if (submission.status === "waiting_for_security_architect_approval" ||
        submission.status === "awaiting_security_architect_review") {
        return (
          <div className="buttons">
            <div>
              {editAnswersButton}
              {downloadPDFButton}
            </div>
            <div/>
          </div>
        );
      }

      return (
        <div className="buttons">
          <div>
            {downloadPDFButton}
          </div>
          <div/>
        </div>
      );
    }

    // Display buttons for approvers
    if (viewAs === "approver" || viewAs === "businessOwnerApprover") {
      const assignToMeButton = (
        <LightButton title="Assign to Me"
                    classes={["button"]}
                    onClick={handleAssignToMeButtonClick}
        />
      );
      const sendBackForChangesButton = (
        <LightButton title="Send back for changes"
                    classes={["button"]}
                    onClick={() => handleSendBackForChangesButtonClick()}
        />
      );

      let approveButtonTitle = "Approve";

      if (user.isSA) {
        approveButtonTitle = "Endorsed";
      }

      if (user.isCISO) {
        approveButtonTitle = "Recommend Approval";
      }

      if (viewAs === "businessOwnerApprover") {
        approveButtonTitle = "Accept risks and approve";
      }

      const approveButton = (
        <DarkButton title={approveButtonTitle}
                    classes={["button"]}
                    onClick={() => handleApproveButtonClick(this.state.skipBoAndCisoApproval)}
        />
      );

      let denyButtonTitle = "Not approved";
      if (user.isSA) {
        denyButtonTitle = "Not endorsed";
      }
      if (user.isCISO) {
        denyButtonTitle = "Recommend Rejection";
      }

      const denyButton = (
        <RedButton title={denyButtonTitle}
                     classes={["button"]}
                     onClick={() => handleDenyButtonClick(this.state.skipBoAndCisoApproval)}
        />
      );

      if (submission.status === "submitted") {
        return (
          <div className="buttons">
            <div>
              {viewAnswersButton}
              {downloadPDFButton}
            </div>
            <div/>
          </div>
        );
      }

      if (submission.status === "awaiting_security_architect_review") {
        return (
          <div className="buttons">
            <div className="buttons-left">
              {viewAnswersButton}
              {downloadPDFButton}
            </div>
            <div className="buttons-right">
              {assignToMeButton}
            </div>
            <div/>
          </div>
        );
      }

      if (submission.status === "waiting_for_security_architect_approval") {
        return (
          <div className="buttons">
            <div className="buttons-left">
              {viewAnswersButton}
              {downloadPDFButton}
            </div>
            <div className="buttons-right">
              <span className="approver-action">Approver action: </span>
              {sendBackForChangesButton}
              {denyButton}
              {approveButton}
            </div>
          </div>
        );
      }

      return (
        <div className="buttons">
          <div className="buttons-left">
            {viewAnswersButton}
            {downloadPDFButton}
          </div>
          <div className="buttons-right">
            <span className="approver-action">Approver action: </span>
            {denyButton}
            {approveButton}
          </div>
        </div>
      );
    }

    // Display buttons for others (either a submitter not an approver)
    return (
      <div className="buttons">
        <div>
          {viewAnswersButton}
          {downloadPDFButton}
        </div>
        <div/>
      </div>
    );
  }

  renderApprovals(submission: Submission) {
    // TODO: Refactor - consider using constants instead of string literal
    if (submission.status === "in_progress" ||
      submission.status === "submitted"
    ) {
      return null;
    }


    const approvalStatus = submission.approvalStatus;
    const securityArchitectApprover = submission.securityArchitectApprover;
    const cisoApprover = submission.cisoApprover;

    const securityArchitectApprovalStatus = prettifyApprovalStatus(approvalStatus.securityArchitect);
    let securityArchitectName = "Unassigned";

    if (securityArchitectApprover.firstName) {
      securityArchitectName = securityArchitectApprover.firstName + " " + securityArchitectApprover.surname;
    }

    const cisoApprovalStatus = prettifyApprovalStatus(approvalStatus.chiefInformationSecurityOfficer);
    let cisoApproverName = "Unassigned";

    if (cisoApprover.firstName) {
      cisoApproverName = cisoApprover.firstName + " " + cisoApprover.surname;
    }

    const businessOwnerApprovalStatus = prettifyApprovalStatus(approvalStatus.businessOwner)
    const businessOwnerName = submission.businessOwnerApproverName ? submission.businessOwnerApproverName : "Unassigned";

    const approvalStatusDetails = [
      {"role": "Security Architect", "name": securityArchitectName, "status": securityArchitectApprovalStatus},
      {"role": "Chief Information Security Officer", "name": cisoApproverName, "status": cisoApprovalStatus},
      {"role": "Business Owner", "name": businessOwnerName, "status": businessOwnerApprovalStatus}
    ];

    return (
      <div className="submission-approval-container">
        <h4>Submission approvals</h4>
        <div className="table-responsive table-continer">
          <table className="table">
            <thead className="">
              <tr key="approval_table_header">
                <th>Role</th>
                <th>Name</th>
                <th>Approval status</th>
              </tr>
            </thead>
            <tbody>
              {approvalStatusDetails.map((approvalStatusDetail, index) => {
                const status = approvalStatusDetail.status;
                let statusIcon = awaitingApprovalIcon;

                if (status == "Approved") {
                  statusIcon = approveIcon;
                }

                if (status == "Not approved") {
                    statusIcon = notApprovedIcon;
                }

                return (
                  <tr key={index+1}>
                    <td>{approvalStatusDetail.role}</td>
                    <td className={approvalStatusDetail.name == "Unassigned" ? "unassigned-approver" : ""}>
                      {approvalStatusDetail.name}
                    </td>
                    <td>
                      <img src={statusIcon} />
                      <span className="approval-status"> {status} </span>
                    </td>
                  </tr>
                );
                })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  renderSkipCheckbox(submission: Submission, viewAs: string, user: User) {
    if ((user && !user.isSA) || !submission.isApprovalOverrideBySecurityArchitect) {
      return null;
    }
    if (viewAs === 'approver' && user.isSA &&
      submission.status === "waiting_for_security_architect_approval") {
        return (
          <div className="approvals">
            <h4>Skip Business Owner and CISO approval</h4>
            <label>
              <input
              type="checkbox"
              checked={this.state.skipBoAndCisoApproval}
              onChange={event => {
                this.setState({
                  skipBoAndCisoApproval: event.target.checked
                });
              }} />
              &nbsp; This deliverable does not modify the current risk rating for this
              project. Business Owner and CISO approval is not required
            </label>
          </div>
        );
    }

    return null;
  }
}

export default Summary;
