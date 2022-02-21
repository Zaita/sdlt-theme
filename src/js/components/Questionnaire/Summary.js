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
import inProgressIcon from "../../../img/icons/in-progress.svg";
import startIcon from "../../../img/icons/start.svg";
import submittedIcon from "../../../img/icons/submitted.svg";
import incompleteTasksIcon from "../../../img/icons/incomplete-tasks.svg";
import chevronRightIcon from "../../../img/icons/chevron-right-link.svg";
import submitSubmissionIcon from "../../../img/icons/submit-submission.svg";
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
import AddIcon from "../../../img/icons/add-circle.svg";
import CloseIcon from '@material-ui/icons/Close';
import ReactModal from "react-modal";
import IconButton from '@material-ui/core/IconButton';
import Select from 'react-select';
import moment from "moment";
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import TableAccordion from "./TableAccordion";

type Props = {
  submission: Submission | null,
  handlePDFDownloadButtonClick: () => void,
  handleSubmitButtonClick: () => void,
  handleAssignToMeButtonClick: () => void,
  handleApproveButtonClick: (skipBoAndCisoApproval: boolean) => void,
  handleDenyButtonClick: (skipBoAndCisoApproval: boolean) => void,
  handleSendBackForChangesButtonClick: () => void,
  handleEditButtonClick: () => void,
  handleGrantCertificationButtonClick: () => void,
  handleDenyCertificationButtonClick: () => void,
  handleIssueAccreditationButtonClick: () => void,
  handleDenyAccreditationButtonClick: () => void,
  handleCollaboratorAddButtonClick: (selectedCollaborators: Array<Collaborator>) => void,
  viewAs: "submitter" | "approver" | "others",
  token: string,
  user: User | null,
  members: Array<User> | null,
  securityTeamEmail: string
};

type State = {
  showModal: boolean,
  enableApproveButton: boolean
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

const prettifyApprovalStatus = (status: string, role:string) => {
  if (!status) {
    return;
  }

  if (status == "pending") {
    return "Awaiting approval";
  }

  if (status == "not_required") {
    return "Not required";
  }

  if (status == "approved" && role == "Certification Authority") {
    return "Certification granted";
  }

  if (status == "denied" && role == "Certification Authority") {
    return "Certification denied";
  }

  if (status == "approved" && role == "Accreditation Authority") {
    return "Accreditation issued";
  }

  if (status == "denied" && role == "Accreditation Authority") {
    return "Accreditation denied";
  }

  if (status == "denied") {
    return "Not approved";
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
    handleGrantCertificationButtonClick: () => {},
    handleDenyCertificationButtonClick: () => {},
    handleIssueAccreditationButtonClick: () => {},
    handleDenyAccreditationButtonClick: () => {},
    viewAs: "others",
    showNotApproveButton: false,
    token: "",
    user: null,
    members: null,
    securityTeamEmail: "",
  };

  constructor(props) {
    super(props);
    this.state = {
      skipBoAndCisoApproval: false,
      enableApproveButton: true,
      showModal: false,
      selectedCollaborators: props.submission.collaborators,
      accreditationPeriod: "",
    }
  }

  componentDidMount() {
    if (this.getAcknowledgeText() !== "") {
      this.setState({ enableApproveButton: false });
    }
  }

  getAcknowledgeText()
  {
    if (this.props.submission.isCertificationAndAccreditationTaskExists) {
      if (this.props.viewAs === 'businessOwnerApprover' && this.props.submission.businessOwnerAcknowledgementText) {
        return this.replaceAcknowledgementText(this.props.submission.businessOwnerAcknowledgementText);
      }

      if (this.props.viewAs === 'approver') {
        if (this.props.user.isCertificationAuthority && this.props.submission.certificationAuthorityAcknowledgementText) {
          return this.replaceAcknowledgementText(this.props.submission.certificationAuthorityAcknowledgementText);
        }

        if (this.props.user.isAccreditationAuthority && this.props.submission.accreditationAuthorityAcknowledgementText) {
          return this.replaceAcknowledgementText(this.props.submission.accreditationAuthorityAcknowledgementText);
        }
      }
    }

    return "";
  }

  handleChangeForAccreditationPeriod = accreditationPeriod => this.setState({accreditationPeriod});

  replaceAcknowledgementText(acknowledgementText) {
    let updatedAcknowledgementText = acknowledgementText;

    if (!this.props.user.isAccreditationAuthority) {
      return (
        <div dangerouslySetInnerHTML={{ __html: updatedAcknowledgementText}}/>
      );
    }

    const taskSubmissions = this.props.submission.taskSubmissions;

    const memoTaskSubmission = taskSubmissions.filter((taskSubmission) => {
      return taskSubmission.taskType === "certification and accreditation";
    });

    const answersFromMemo = JSON.parse(memoTaskSubmission[0].resultForCertificationAndAccreditation);

    const accreditationPeriodOptions = [
      { value: "1 month", label: "1 month" },
      { value: "3 months", label: "3 months" },
      { value: "6 months", label: "6 months" },
      { value: "9 months", label: "9 months" },
      { value: "12 months", label: "12 months" },
      { value: "18 months", label: "18 months" },
      { value: "24 months", label: "24 months" },
    ];

    const initialAccreditationPeriod = answersFromMemo.accreditationPeriod + " (recommended)";
    const accreditationPeriodDropdown = (
      <Select
        options={accreditationPeriodOptions}
        defaultValue={{label: initialAccreditationPeriod, value: answersFromMemo.accreditationPeriod}}
        className="react-select-container"
        classNamePrefix="react-select"
        placeholder={answersFromMemo.accreditationPeriod}
        maxMenuHeight={110}
        onChange={(selectedOption) => this.handleChangeForAccreditationPeriod(selectedOption.value)}
      />
    );

    const acknowledgementTextParts = updatedAcknowledgementText.split(answersFromMemo.accreditationPeriod);

    return (
      <div className="acknowledgement-text-for-accreditation-authority">
        <div
          className="acknowledgement-text-before-dropdown"
          dangerouslySetInnerHTML={{ __html: acknowledgementTextParts[0]}}
        />
        <div className="acknowledgement-text-dropdown">
          {accreditationPeriodDropdown}
        </div>
        <div
          className="acknowledgement-text-after-dropdown"
          dangerouslySetInnerHTML={{ __html: acknowledgementTextParts.slice(1)}}
        />
      </div>
    );
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
        <h3>Submission details</h3>
        {this.renderSubmissionDetails(submission)}
        {this.renderCollboratorsAndComponentsInfo(submission, members)}
        {this.renderTasks(submission)}
        {this.renderApprovals(submission)}
        <RiskResultContainer
          riskResults={submission.riskResults}
          hideWeightsAndScore={submission.hideWeightsAndScore}
        />
        {this.renderSkipCheckbox(submission, viewAs, user)}
        {this.renderAcknowledgements(submission, viewAs, user)}
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

  renderSubmissionDetails(submission: Submission) {
    const submitter = submission.submitter;
    let status = prettifyStatus(submission.status)
    let statusIcon = awaitingApprovalIcon;

    if (status == "Submitted" &&
      SubmissionDataUtil.existsIncompleteTaskSubmission(submission.taskSubmissions)) {
      status = "Tasks to complete"
      statusIcon = incompleteTasksIcon;
    } else if (status == "Submitted" &&
      !SubmissionDataUtil.existsIncompleteTaskSubmission(submission.taskSubmissions)) {
      status = "Ready to submit"
      statusIcon = submittedIcon
    }

    if (status == "In progress") {
      statusIcon = inProgressIcon;
    }

    if (status == "Approved") {
      statusIcon = approveIcon;
    }

    if (status == "Denied") {
      statusIcon = notApprovedIcon;
    }

    let productName = submission.productName;

    if (productName == '') {
      productName = "Product Name: Please add a product name";
    }

    return (
      <div className="submission-details-container">
        <div className="submission-detail-left-container">
          <div>
            <span className="product-name">{productName}</span>
          </div>
          <span>{submission.questionnaireTitle}</span>
          <div className="submitter-name-created-date-row">
            <span className="submission-details-label">Submission created: </span>
            <span className="submission-details-data">{moment(submission.created).format("DD/MM/YYYY")}</span>
          </div>
          <div>
            <span className="submission-details-label">Go live date: </span>
            <span className="submission-details-data">{submission.releaseDate ? moment(submission.releaseDate).format("DD/MM/YYYY") : ''}</span>
          </div>
        </div>
        <div className="submission-detail-right-container">
          <div>
            <span className="submission-status"><img src={statusIcon}/>{status}</span>
          </div>
          <div className="submitter-name-created-date-row">
            <span className="submission-details-label">Submitted by: </span>
            <span className="submission-details-data">{submitter.name}</span>
          </div>
          <div>
            <span className="submission-details-label">Email: </span>
            <span className="submission-details-data">{submitter.email}</span>
          </div>
        </div>
      </div>
    );
  }

  renderCollboratorsInfo(submission: Submission, members) {
    return (
      <div className="collaborators-container">
        <h4>Collaborators</h4>
        <div className="collaborator-message">
          You can add people to help complete your submission.
          Please contact the&nbsp;<a href ={"mailto:" + this.props.securityTeamEmail}>security team</a>&nbsp;for more information.
        </div>
        {submission.collaborators.length > 0 && (
          <div>
            {submission.collaborators.map(({label}, index) =>
              {
                return(<div className="collaborator-name" key={index}>{label}</div>)
              }
            )}
          </div>
        )}
        {this.props.viewAs === "submitter" && (
          <div>
            <button className="btn add-collaborators-btn" onClick={this.handleOpenModalForCollaborators.bind(this)}>
              <img src={AddIcon}/> Add collaborators
            </button>
          </div>
        )}
        {this.renderCollboratorsModal(submission, members)}
      </div>
    );
  }

  renderComponentsInfo(submission: Submission){
    const productAspects = submission.productAspects;
    return (
      <div className={productAspects.length > 0 ? 'components-container' : 'hide-components-container'}>
        <h4>Components</h4>
        <div>Please specify if there are multiple components impacted for this submission.
          This will help group your tasks per component.
        </div>
        <div>
          {productAspects.map((productAspect, index) =>
            {
              return(<div className="component-name" key={index}>{productAspect}</div>)
            }
          )}
        </div>
      </div>
    );
  }

  renderCollboratorsAndComponentsInfo(submission: Submission, members) {
    return (
        <div className="collaborators-components-container">
          {this.renderCollboratorsInfo(submission, members)}
          {this.renderComponentsInfo(submission)}
        </div>
    );
  }

  addProductAspectsToTaskSubmissions(pa: array, arr: array) {
    let newData = arr.map(item => {
      if (!item.createOnceInstancePerComponent) {
        return
      }
      let taskSubmissionsCopy = Object.assign({}, item);
      taskSubmissionsCopy.productAspect = pa;
      return taskSubmissionsCopy;
    }).filter(item => item !== undefined)
    return newData;
  }

  renderAccordionTasks(submission: Submission) {
    const taskSubmissions = submission.taskSubmissions;
    const productAspects = submission.productAspects;

    if (taskSubmissions.length === 0) {
      return null;
    }

    const unfinshedRQTaskMessage = this.unfinishedTaskSubmissionMessage() ? (
      <div className="alert alert-warning">{this.unfinishedTaskSubmissionMessage()}</div>
    ) : null;

    const arrayForAccordion = this.addProductAspectsToTaskSubmissions(productAspects, taskSubmissions)

    return (
      <React.Fragment>
        {arrayForAccordion.map(({
          uuid,
          taskName,
          taskType,
          status,
          approver,
          isTaskApprovalRequired,
          timeToComplete,
          timeToReview,
          canTaskCreateNewTasks,
          productAspect
        }) => {
          let statusIcon = startIcon;

          if (status == "start") {
            status = "To do";
          }

          if (status == "in_progress") {
            statusIcon = inProgressIcon;
          }

          if (status == "waiting_for_approval") {
            statusIcon = awaitingApprovalIcon;
          }

          if (status == "approved" || status == "complete") {
            statusIcon = approveIcon;
          }

          if (status == "denied") {
            statusIcon = notApprovedIcon;
          }

          const { token } = { ...this.props };

          let taskRedirectURL = URLUtil.redirectToTaskSubmission(uuid, token, "urlString");

          if (taskType === "risk questionnaire") {
            taskRedirectURL = URLUtil.redirectToTaskSubmission(uuid, token, "urlString", "website");
          }

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
              <img src={chevronRightIcon} />
            </Link>
          );

          let approvedBy = "";

          if (isTaskApprovalRequired) {
            approvedBy = approver.name;
          } else {
            approvedBy = "No approval needed";
          }

          return (
            <React.Fragment>
              {productAspect.map((pa, i) => {
                const taskSubmissionAndProductAspects = {
                  uuid,
                  approvedBy,
                  links,
                  statusIcon,
                  status,
                  pa,
                  taskName,
                  taskType,
                  timeToComplete,
                  timeToReview,
                  canTaskCreateNewTasks,
                  prettifyStatus,
                  unfinshedRQTaskMessage
                }

                return <TableAccordion key={uuid} {...taskSubmissionAndProductAspects} />
              })}
            </React.Fragment>
          )
        })}
      </React.Fragment>
    )
  }

  renderTasks(submission: Submission) {
    const taskSubmissions = submission.taskSubmissions;
    const productAspects = submission.productAspects;
    const hasProductAspects = productAspects.length > 0 ? true : false;

    const isSRATaskFinalised = SecurityRiskAssessmentUtil.isSRATaskFinalised(submission.taskSubmissions);

    if (taskSubmissions.length === 0) {
      return null;
    }

    const unfinshedRQTaskMessage = this.unfinishedTaskSubmissionMessage() ? (
      <div className="alert alert-warning">{this.unfinishedTaskSubmissionMessage()}</div>
    ) : null;

    return (
      <div className="tasks-container">
        <h4>Tasks</h4>
        <div className="task-instruction-message">
          Please complete the tasks below. Note the tasks marked with a red asterisk
          (<span className="multiple-tasks-created">*</span>) may create new tasks, depending on your answers.
        </div>
          {unfinshedRQTaskMessage}
          {isSRATaskFinalised ? SecurityRiskAssessmentUtil.getSraIsFinalisedAlert() : null}
        <div className="table-responsive table-continer">
          <table className="table">
            <thead className="task-thead">
              <tr className="task-table-header">
                <th>Task</th>
                <th className="completion-time-col">Time to complete</th>
                <th>Approved by</th>
                <th>Time to review</th>
                <th>Task status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {taskSubmissions.map(({
                uuid,
                taskName,
                taskType,
                status,
                approver,
                isTaskApprovalRequired,
                timeToComplete,
                timeToReview,
                canTaskCreateNewTasks,
                createOnceInstancePerComponent
              }) => {

              let statusIcon = startIcon;

              if (status == "start") {
                status = "To do";
              }

              if (status == "in_progress") {
                statusIcon = inProgressIcon;
              }

              if (status == "waiting_for_approval") {
                statusIcon = awaitingApprovalIcon;
              }

              if (status == "approved" || status == "complete") {
                statusIcon = approveIcon;
              }

              if (status == "denied") {
                statusIcon = notApprovedIcon;
              }

              const {token} = {...this.props};

              let taskRedirectURL = URLUtil.redirectToTaskSubmission(uuid, token, "urlString");

              if (taskType === "risk questionnaire") {
                taskRedirectURL = URLUtil.redirectToTaskSubmission(uuid, token, "urlString", "website");
              }

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
                  <img src={chevronRightIcon}/>
                </Link>
              );

              let approvedBy = "";

              if (isTaskApprovalRequired) {
                approvedBy = approver.name;
              } else {
                approvedBy = "No approval needed";
              }

              const taskTableData = () => {
                return (
                  <React.Fragment>
                    <td className="task-table-title-data">
                      {taskName}
                      {canTaskCreateNewTasks ? (<span className='multiple-tasks-created'> *</span>) : null}
                    </td>
                    <td>{timeToComplete}</td>
                    <td>{approvedBy}</td>
                    <td>{timeToReview}</td>
                    <td>
                      <img src={statusIcon} />
                      <span className="task-status">{prettifyStatus(status)}</span>
                    </td>
                    <td>
                      {unfinshedRQTaskMessage && taskType === 'security risk assessment' ? null : links}
                    </td>
                  </React.Fragment>
                )
              }

              if (!createOnceInstancePerComponent) {
                return (
                  <tr key={uuid}>
                    {taskTableData()}
                  </tr>
                )
              } else if (hasProductAspects) {
                return (
                  this.renderAccordionTasks(submission)
                )
              } else {
                return (
                  <tr key={uuid}>
                    {taskTableData()}
                  </tr>
                )
              }
            })}
          </tbody>
        </table>
      </div>
      {/**TODO: Add FAQ link */}
      {/* <div className = "task-faq">
      <a href="#"> Learn more about the task descriptions and statuses</a>
        <img src={chevronRightIcon}/>
      </div> */}
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
    const certificationAuthorityApprover = submission.certificationAuthorityApprover;
    const accreditationAuthorityApprover = submission.accreditationAuthorityApprover;

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

    let approvalStatusDetails = [
      {"role": "Security Architect", "name": securityArchitectName, "status": securityArchitectApprovalStatus},
      {"role": "Chief Information Security Officer", "name": cisoApproverName, "status": cisoApprovalStatus},
      {"role": "Business Owner", "name": businessOwnerName, "status": businessOwnerApprovalStatus}
    ];

    if (this.props.submission.isCertificationAndAccreditationTaskExists) {
      const certificationAuthorityApprovalStatus = prettifyApprovalStatus(approvalStatus.certificationAuthority, 'Certification Authority');
      let certificationAuthorityApproverName = "Unassigned";
      if (certificationAuthorityApprover.firstName) {
        certificationAuthorityApproverName = certificationAuthorityApprover.firstName + " " + certificationAuthorityApprover.surname;
      }

      const accreditationAuthorityApprovalStatus = prettifyApprovalStatus(approvalStatus.accreditationAuthority, 'Accreditation Authority');
      let accreditationAuthorityApproverName = "Unassigned";
      if (accreditationAuthorityApprover.firstName) {
        accreditationAuthorityApproverName = accreditationAuthorityApprover.firstName + " " + accreditationAuthorityApprover.surname;
      }

      approvalStatusDetails.push(
        {"role": "Certification Authority", "name":certificationAuthorityApproverName, "status": certificationAuthorityApprovalStatus},
        {"role": "Accreditation Authority", "name":accreditationAuthorityApproverName, "status": accreditationAuthorityApprovalStatus}
      );
    }

    return (
      <div className="submission-approval-container">
        <h4>Submission approvals</h4>
        <div className="table-responsive table-continer">
          <table className="table">
            <thead className="submission-approval-thead">
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

                if (status == "Approved" || status == "Certification granted" || status == "Accreditation issued") {
                  statusIcon = approveIcon;
                }

                if (status == "Not approved" || status == "Certification denied" ||
                  status == "Accreditation denied" || status == "Not required") {
                    statusIcon = notApprovedIcon;
                }

                return (
                  <tr key={index+1}>
                    <td className="table-title-data">{approvalStatusDetail.role}</td>
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
          <div className="sub-container">
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

  renderAcknowledgements(submission: Submission, viewAs: string, user: User) {
    if (!submission.isCertificationAndAccreditationTaskExists) {
      return null;
    }

    const acknowledgementText = this.getAcknowledgeText();

    if (acknowledgementText !== "" ) {
        return (
          <div className="acknowledgement-container">
            <h4>Acknowledgements</h4>
            <div className="sub-container">
              <div className="form-check">
                <input
                type="checkbox"
                className="form-check-input"
                checked={this.state.enableApproveButton}
                onChange={event => {
                  this.setState({
                    enableApproveButton: event.target.checked
                  });
                }} />
                <label className="form-check-label">{acknowledgementText}</label>
              </div>
            </div>
          </div>
        );
    }

    return null;
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
      handleEditButtonClick,
      handleGrantCertificationButtonClick,
      handleDenyCertificationButtonClick,
      handleIssueAccreditationButtonClick,
      handleDenyAccreditationButtonClick
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
        <LightButton title="Edit"
                     iconImage={editIcon}
                     classes={["button"]}
                     onClick={handleEditButtonClick}
        />
      );

      // Render send for approval button for submitter only in specific submission status
      const sendForApprovalButton = (
        <DarkButton title="Submit for approval"
                    iconImage={submitSubmissionIcon}
                    classes={["button"]}
                    disabled={SubmissionDataUtil.existsIncompleteTaskSubmission(submission.taskSubmissions)}
                    onClick={handleSubmitButtonClick}
        />
      );

      if (submission.status === "submitted") {
        return (
          <div className="buttons">
            <div className="buttons-left">
              {editAnswersButton}
              {downloadPDFButton}
            </div>
            <div className="buttons-right">
              {sendForApprovalButton}
            </div>
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
                    disabled={!this.state.enableApproveButton}
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

      const grantCertification = (
        <DarkButton title="Grant Certification"
                    classes={["button"]}
                    disabled={!this.state.enableApproveButton}
                    onClick={() => handleGrantCertificationButtonClick()}
        />
      );

      const denyCertification = (
        <RedButton title="Deny Certification"
                    classes={["button"]}
                    onClick={() => handleDenyCertificationButtonClick()}
        />
      );

      const issueAccreditation = (
        <DarkButton title="Issue Accreditation"
                    classes={["button"]}
                    disabled={!this.state.enableApproveButton}
                    onClick={() => handleIssueAccreditationButtonClick(this.state.accreditationPeriod)}
        />
      );

      const denyAccreditation = (
        <RedButton title="Deny Accreditation"
                    classes={["button"]}
                    onClick={() => handleDenyAccreditationButtonClick()}
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
              {denyButton}
              {approveButton}
            </div>
          </div>
        );
      }

      if (user.isCertificationAuthority && (submission.status === "awaiting_certification_and_accreditation" || submission.status === "awaiting_certification")) {
        return (
          <div className="buttons">
            <div className="buttons-left">
              {viewAnswersButton}
              {downloadPDFButton}
            </div>
            <div className="buttons-right">
              <span className="approver-action">Approver action: </span>
              {denyCertification}
              {grantCertification}
            </div>
          </div>
        );
      }

      if (user.isAccreditationAuthority && (submission.status === "awaiting_certification_and_accreditation" || submission.status === "awaiting_accreditation")) {
        return (
          <div className="buttons">
            <div className="buttons-left">
              {viewAnswersButton}
              {downloadPDFButton}
            </div>
            <div className="buttons-right">
              <span className="approver-action">Approver action: </span>
              {denyAccreditation}
              {issueAccreditation}
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
}

export default Summary;
