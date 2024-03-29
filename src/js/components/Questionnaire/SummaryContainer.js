// @flow

import React, {Component} from "react";
import {connect} from "react-redux";
import type {RootState} from "../../store/RootState";
import {Dispatch} from "redux";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import type {QuestionnaireSubmissionState} from "../../store/QuestionnaireState";
import type {MemberState} from "../../store/MemberState";
import {
  approveQuestionnaireSubmission,
  denyQuestionnaireSubmission,
  sendBackForChangesSubmission,
  notApproveQuestionnaireSubmissionforSA,
  editQuestionnaireSubmission,
  loadQuestionnaireSubmissionState,
  submitQuestionnaireForApproval,
  approveQuestionnaireSubmissionAsBusinessOwner,
  denyQuestionnaireSubmissionAsBusinessOwner,
  assignToSecurityArchitectQuestionnaireSubmission,
  addCollaboratorAction,
  grantCertificationAction,
  denyCertificationAction,
  issueAccreditationAction,
  denyAccreditationAction
} from "../../actions/questionnaire";
import {loadMember} from "../../actions/user";
import Summary from "./Summary";
import PDFUtil from "../../utils/PDFUtil";
import ReactModal from "react-modal";
import DarkButton from "../Button/DarkButton";
import LightButton from "../Button/LightButton";
import CSRFTokenService from "../../services/CSRFTokenService";
import type {Collaborator} from "../../types/User";

const mapStateToProps = (state: RootState) => {
  return {
    submissionState: state.questionnaireState.submissionState,
    loadingState: state.loadingState,
    members: state.memberState
  };
};

const mapDispatchToProps = (dispatch: Dispatch, props: *) => {
  return {
    // load the Submission data on the summary screen
    dispatchLoadSubmissionAction(submissionHash: string, secureToken: string) {
      dispatch(loadQuestionnaireSubmissionState(submissionHash, secureToken));
    },
    dispatchLoadMembersAction() {
      dispatch(loadMember());
    },
    // as a BO approve/ deny the submission
    dispatchBusinessOwnerApproveSubmissionAction(submissionID: string, secureToken: string) {
      dispatch(approveQuestionnaireSubmissionAsBusinessOwner(submissionID, secureToken));
    },
    dispatchBusinessOwnerDenySubmissionAction(submissionID: string, secureToken: string) {
      dispatch(denyQuestionnaireSubmissionAsBusinessOwner(submissionID, secureToken));
    },

    // user can edit answers and submit the questionnaire for approval
    dispatchSubmitForApprovalAction(submissionID: string) {
      dispatch(submitQuestionnaireForApproval(submissionID));
    },
    dispatchEditSubmissionAction(submissionID: string) {
      dispatch(editQuestionnaireSubmission(submissionID));
    },

    // as a SA and ciso approve/ deny the submission
    dispatchApproveSubmissionAction(submissionID: string, skipBoAndCisoApproval: boolean) {
      dispatch(approveQuestionnaireSubmission(submissionID, skipBoAndCisoApproval));
    },
    dispatchDenySubmissionAction(submissionID: string, skipBoAndCisoApproval: boolean) {
      dispatch(denyQuestionnaireSubmission(submissionID, skipBoAndCisoApproval));
    },

    dispatchSendBackForChangesSubmissionAction(submissionID: string) {
      dispatch(sendBackForChangesSubmission(submissionID));
    },

    // As a SA assign the submission to cureent logged in user
    dispatchAssignToMeAction(submissionID: string) {
      dispatch(assignToSecurityArchitectQuestionnaireSubmission(submissionID));
    },

    dispatchAddCollaboratorAction(submissionID: string, selectedCollaborators:Array<Collaborator>)
    {
      dispatch(addCollaboratorAction(submissionID, selectedCollaborators));
    },

    dispatchGrantCertificationAction(submissionID: string)
    {
      dispatch(grantCertificationAction(submissionID));
    },

    dispatchDenyCertificationAction(submissionID: string)
    {
      dispatch(denyCertificationAction(submissionID));
    },

    dispatchIssueAccreditationAction(submissionID: string, accreditationPeriod: string)
    {
      dispatch(issueAccreditationAction(submissionID, accreditationPeriod));
    },

    dispatchDenyAccreditationAction(submissionID: string)
    {
      dispatch(denyAccreditationAction(submissionID));
    }
  };
};

type ownProps = {
  submissionHash: string,
  secureToken: string
};

type reduxProps = {
  submissionState: QuestionnaireSubmissionState,
  members: MemberState,
  dispatchLoadSubmissionAction: (submissionHash: string, secureToken: string) => void,
  dispatchSubmitForApprovalAction: (submissionID: string) => void,
  dispatchApproveSubmissionAction: (submissionID: string) => void,
  dispatchDenySubmissionAction: (submissionID: string) => void,
  dispatchEditSubmissionAction: (submissionID: string) => void,
  approveQuestionnaireSubmissionFromBusinessOwner: (submissionID: string) => void,
  denyQuestionnaireSubmissionFromBusinessOwner: (submissionID: string) => void,
  dispatchGrantCertificationAction: (submissionID: string) => void,
  dispatchDenyCertificationAction: (submissionID: string) => void,
  dispatchIssueAccreditationAction: (submissionID: string, accreditationPeriod: string) => void,
  dispatchDenyAccreditationAction: (submissionID: string) => void,
  loadingState: object<*>
};

type Props = ownProps & reduxProps;

type State = {
  showModal: boolean
};

class SummaryContainer extends Component<Props, State> {

  constructor() {
    super();
    this.state = {
      showModal: false,
    };
  }

  componentDidMount() {
    const {submissionHash, dispatchLoadSubmissionAction, secureToken} = {...this.props};
    dispatchLoadSubmissionAction(submissionHash, secureToken);
    this.props.dispatchLoadMembersAction();

  }

  render() {
    const {secureToken, loadingState, members} = {...this.props};
    const {
      location,
      title,
      user,
      submission,
      isCurrentUserApprover,
      isCurrentUserABusinessOwnerApprover,
      siteConfig
      } = {...this.props.submissionState};

    if (!user || !submission || !siteConfig || !members) {
      return null;
    }

    if (loadingState['QUESTIONNAIRE/LOAD_QUESTIONNAIRE_SUBMISSION_STATE']) {
      return null;
    }

    // Decide what the permission of the current user
    let viewAs = "others";
    let showNotApproveButton = false;

    // Show "Not approve" button only if user is sa
    // and  hide if user is sa and ciso or business owner
    if (user.isSA && !user.isCISO && !isCurrentUserABusinessOwnerApprover) {
      showNotApproveButton = true;
    }

    do {
      // Check if the current user is the submitter
      if (user.id === submission.submitter.id) {
        viewAs = "submitter";
        break;
      }

      // Check if the current user is an businessOwner approver
      if (isCurrentUserABusinessOwnerApprover && submission.status == 'waiting_for_approval') {
        viewAs = "businessOwnerApprover";
        break;
      }

      // Check if the current user is an approver
      if (isCurrentUserApprover) {
        viewAs = "approver";
        break;
      }
    } while (false);

    // used to display breadcrumbs
    const collaborators = submission.collaborators;
    let isCollaborator = false;
    let showSubmissionBreadcrumb = false
    let showApprovalBreadcrumb = false;

    if (collaborators.some(e => e.value === parseInt(user.id))){
      isCollaborator = true;
    }

    if (viewAs == "submitter" || isCollaborator) {
      showSubmissionBreadcrumb = true;
    }

    if (!showSubmissionBreadcrumb) {
      if (user.isSA ||
        user.isCISO ||
        submission.isBusinessOwner ||
        user.isAccreditationAuthority ||
        user.isCertificationAuthority) {
        showApprovalBreadcrumb = true;
      }
    }

    return (
      <div className="SummaryContainer">
        <Header
          pageTitle={submission.productName ? submission.productName : "Product"}
          logopath={siteConfig.logoPath}
          productName={submission.productName}
          showSubmissionBreadcrumb={showSubmissionBreadcrumb}
          showApprovalBreadcrumb={showApprovalBreadcrumb}
        />
        <Summary submission={submission}
                 handlePDFDownloadButtonClick={this.handlePDFDownloadButtonClick.bind(this)}
                 handleSubmitButtonClick={this.handleSubmitButtonClick.bind(this)}
                 handleSendBackForChangesButtonClick={this.handleSendBackForChangesButtonClick.bind(this)}
                 handleApproveButtonClick={this.handleApproveButtonClick.bind(this)}
                 handleDenyButtonClick={this.handleDenyButtonClick.bind(this)}
                 handleEditButtonClick={this.handleOpenModal.bind(this)}
                 handleAssignToMeButtonClick={this.handleAssignToMeButtonClick.bind(this)}
                 handleCollaboratorAddButtonClick={this.handleCollaboratorAddButtonClick.bind(this)}
                 handleGrantCertificationButtonClick={this.handleGrantCertificationButtonClick.bind(this)}
                 handleDenyCertificationButtonClick={this.handleDenyCertificationButtonClick.bind(this)}
                 handleIssueAccreditationButtonClick={this.handleIssueAccreditationButtonClick.bind(this)}
                 handleDenyAccreditationButtonClick={this.handleDenyAccreditationButtonClick.bind(this)}
                 viewAs={viewAs}
                 user={user}
                 token={secureToken}
                 members={members}
                 showNotApproveButton={showNotApproveButton}
                 securityTeamEmail={siteConfig.securityTeamEmail}
        />
        <Footer footerCopyrightText={siteConfig.footerCopyrightText}/>
        <ReactModal
          isOpen={this.state.showModal}
          parentSelector={() => {return document.querySelector(".SummaryContainer");}}
        >
          <h3>
            Are you sure you want to edit this submission?
          </h3>
          <div className="content">
            This will cancel your current submission and require it to be resubmitted for approval.
          </div>
          <div>
            <DarkButton title="Yes" onClick={this.handleEditButtonClick.bind(this)}/>
            <LightButton title="No" onClick={this.handleCloseModal.bind(this)}/>
          </div>
        </ReactModal>
      </div>
    );
  }

  handlePDFDownloadButtonClick() {
    const {submission, siteConfig} = {...this.props.submissionState};

    if (!submission || !siteConfig) {
      return;
    }

    let riskResults;
    if(submission && submission.riskResults) {
      riskResults = submission.riskResults;
    }

    PDFUtil.generatePDF({
      questions: submission.questions,
      submitter: submission.submitter,
      questionnaireTitle: submission.questionnaireTitle,
      siteConfig: siteConfig,
      riskResults: riskResults ? riskResults : [],
    });
  }

  handleSubmitButtonClick() {
    const {user, submission} = {...this.props.submissionState};

    if (!user || !submission) {
      return;
    }

    this.props.dispatchSubmitForApprovalAction(submission.submissionID);
  }

  handleApproveButtonClick(skipBoAndCisoApproval: boolean = false) {
    const {secureToken} = {...this.props};
    const {
      user,
      submission,
      isCurrentUserApprover,
      isCurrentUserABusinessOwnerApprover
    } = {...this.props.submissionState};

    if (!user || !submission) {
      return;
    }

    if (isCurrentUserABusinessOwnerApprover && submission.status == 'waiting_for_approval') {
      this.props.dispatchBusinessOwnerApproveSubmissionAction(submission.submissionID, secureToken);
    } else if (isCurrentUserApprover) {
      this.props.dispatchApproveSubmissionAction(submission.submissionID, skipBoAndCisoApproval);
    }
  }

  handleDenyButtonClick(skipBoAndCisoApproval: boolean = false) {
    const {secureToken} = {...this.props};
    const {
      user,
      submission,
      isCurrentUserApprover,
      isCurrentUserABusinessOwnerApprover
    } = {...this.props.submissionState};

    if (!user || !submission) {
      return;
    }

    if (isCurrentUserABusinessOwnerApprover && submission.status == 'waiting_for_approval') {
      this.props.dispatchBusinessOwnerDenySubmissionAction(submission.submissionID, secureToken);
    } else if (isCurrentUserApprover) {
      this.props.dispatchDenySubmissionAction(submission.submissionID, skipBoAndCisoApproval);
    }
  }

  handleSendBackForChangesButtonClick() {
    const {user, submission, isCurrentUserApprover} = {...this.props.submissionState};

    if (!user || !submission) {
      return;
    }

    if (isCurrentUserApprover) {
      this.props.dispatchSendBackForChangesSubmissionAction(submission.submissionID);
    }
  }

  handleAssignToMeButtonClick() {
    const {user, submission} = {...this.props.submissionState};

    if (!user || !submission) {
      return;
    }

    this.props.dispatchAssignToMeAction(submission.submissionID);
  }


  handleEditButtonClick() {
    const {user, submission} = {...this.props.submissionState};

    if (!user || !submission) {
      return;
    }

    this.handleCloseModal();
    this.props.dispatchEditSubmissionAction(submission.submissionID);
  }

  // open a edit confirmation modal when user click on questionnaire edit button
  // on the questionnaire summary screen
  handleOpenModal() {
    this.setState({showModal: true});
  }

  // close a modal when user click on "No button" on the edit confirmation modal
  handleCloseModal() {
    this.setState({showModal: false});
  }

  handleCollaboratorAddButtonClick (selectedCollaborators: Array<Collaborator>) {
    const {user, submission} = {...this.props.submissionState};

    if (!user || !submission) {
      return;
    }

    this.props.dispatchAddCollaboratorAction(submission.submissionID, selectedCollaborators);
  }

  handleGrantCertificationButtonClick() {
    const {user, submission} = {...this.props.submissionState};

    if (!user || !submission) {
      return;
    }

    this.props.dispatchGrantCertificationAction(submission.submissionID);
  }

  handleDenyCertificationButtonClick() {
    const {user, submission} = {...this.props.submissionState};

    if (!user || !submission) {
      return;
    }

    this.props.dispatchDenyCertificationAction(submission.submissionID);
  }

  handleIssueAccreditationButtonClick(accreditationPeriod) {
    const {user, submission} = {...this.props.submissionState};

    if (!user || !submission) {
      return;
    }

    this.props.dispatchIssueAccreditationAction(submission.submissionID, accreditationPeriod);
  }

  handleDenyAccreditationButtonClick() {
    const {user, submission} = {...this.props.submissionState};

    if (!user || !submission) {
      return;
    }

    this.props.dispatchDenyAccreditationAction(submission.submissionID);
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(SummaryContainer);
