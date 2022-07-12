// @flow

import React, {Component} from "react";
import {connect} from "react-redux";
import type {RootState} from "../../store/RootState";
import {Dispatch} from "redux";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import type {User} from "../../types/User";
import type {SiteConfig} from "../../types/SiteConfig";
import {loadCurrentUser} from "../../actions/user";
import type {JiraTicket, SecurityComponent} from "../../types/SecurityComponent";
import ComponentSelection from "./ComponentSelection";
import {
  addSelectedComponent,
  createJIRATickets,
  loadAvailableComponents,
  removeSelectedComponent,
  loadSelectedComponents,
} from "../../actions/componentSelection";
import URLUtil from "../../utils/URLUtil";
import ComponentSelectionReview from "./ComponentSelectionReview";
import DarkButton from "../Button/DarkButton";
import type {TaskSubmission} from "../../types/Task";
import {
  completeTaskSubmission,
  loadTaskSubmission,
  saveSelectedComponents,
  editCompletedTaskSubmission
} from "../../actions/task";
import editIcon from "../../../img/icons/edit.svg";
import LightButton from "../Button/LightButton";
import SecurityRiskAssessmentUtil from "../../utils/SecurityRiskAssessmentUtil";
import {loadSiteConfig} from "../../actions/siteConfig";
import {SubmissionExpired} from "../Common/SubmissionExpired";
import {SubmissionNotCompleted} from "../Common/SubmissionNotCompleted";
import BackArrow from "../../../img/icons/back-arrow.svg";

type OwnProps = {
  uuid: string,
  secureToken:string
};

type Props = OwnProps & {
  siteConfig?: SiteConfig | null,
  currentUser?: User | null,
  taskSubmission?: TaskSubmission | null,
  availableComponents?: Array<SecurityComponent>,
  selectedComponents?: Array<SecurityComponent>,
  dispatchLoadDataAction?: () => void,
  dispatchCreateJIRATicketsAction?: (jiraKey: string) => void,
  dispatchSaveLocalControlsAction?: () => void,
  dispatchAddComponentAction?: (id: string) => void,
  dispatchRemoveComponentAction?: (id: string) => void,
  dispatchFinishAction?: (uuid: string) => void,
  dispatchEditAnswersAction?: () => void,
  dispatchLoadSelectedComponents?: (selectedComponents: Array<SecurityComponent>) => void
}

const mapStateToProps = (state: RootState) => {
  return {
    siteConfig: state.siteConfigState.siteConfig,
    currentUser: state.currentUserState.user,
    taskSubmission: state.taskSubmissionState.taskSubmission,
    availableComponents: state.componentSelectionState.availableComponents,
    selectedComponents: state.componentSelectionState.selectedComponents
  };
};

const mapDispatchToProps = (dispatch: Dispatch, props: OwnProps) => {
  return {
    dispatchLoadDataAction() {
      const {uuid, secureToken} = {...props};
      dispatch(loadSiteConfig());
      dispatch(loadCurrentUser());
      dispatch(loadAvailableComponents());
      dispatch(loadTaskSubmission({uuid, secureToken, type: "componentSelection"}));
    },
    dispatchAddComponentAction(id: string, productAspect: string) {
      dispatch(addSelectedComponent(id, productAspect));
    },
    dispatchRemoveComponentAction(id: string, productAspect: string) {
      dispatch(removeSelectedComponent(id, productAspect));
    },
    dispatchCreateJIRATicketsAction(jiraKey: string) {
      dispatch(saveSelectedComponents(jiraKey));
    },
    dispatchSaveLocalControlsAction() {
      dispatch(saveSelectedComponents(""));
    },
    async dispatchFinishAction(uuid: string, secureToken: string) {
      await dispatch(completeTaskSubmission());
      URLUtil.redirectToQuestionnaireSummary(uuid, secureToken);
    },
    dispatchEditAnswersAction() {
      dispatch(editCompletedTaskSubmission({type: "componentSelection"}));
    }
  };
};

class ComponentSelectionContainer extends Component<Props> {
  constructor(props: *) {
    super(props);
    this.state = {
      isLastComponentSelectionCompleted: false,
      enableDoneButton: false
    };
  }

  componentDidMount() {
    const {dispatchLoadDataAction} = {...this.props};
    dispatchLoadDataAction();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.selectedComponents !== this.props.selectedComponents) {
      this.updateEnableDoneButton();
    }
  }

  updateEnableDoneButton()  {
    if (this.props.selectedComponents.length > 0) {
      this.setState({ enableDoneButton: true })
    } else {
      this.setState({ enableDoneButton: false })
    }
  }

  updateIsLastComponentSelectionCompleted = isLastComponentSelectionCompleted => {
    this.setState({ isLastComponentSelectionCompleted: isLastComponentSelectionCompleted })
  }

  sendBackToQestionnaire() {
    URLUtil.redirectToQuestionnaireSummary(this.props.taskSubmission.questionnaireSubmissionUUID, this.props.secureToken)
  }

  render() {
    const {
      siteConfig,
      siteTitle,
      secureToken,
      currentUser,
      taskSubmission,
      availableComponents,
      selectedComponents,
      dispatchAddComponentAction,
      dispatchRemoveComponentAction,
      dispatchCreateJIRATicketsAction,
      dispatchSaveLocalControlsAction,
      dispatchFinishAction,
      dispatchEditAnswersAction
    } = {...this.props};

    if (!currentUser || !taskSubmission || !siteConfig) {
      return null;
    }

    const isCurrentUserSubmitter = parseInt(currentUser.id) === parseInt(taskSubmission.submitter.id);
    const canEdit =  isCurrentUserSubmitter || currentUser.isSA || taskSubmission.isTaskCollborator;
    const isSRATaskFinalised = SecurityRiskAssessmentUtil.isSRATaskFinalised(taskSubmission.siblingSubmissions);
    const showEditControlButton =
      (taskSubmission.status === "complete" || taskSubmission.status === "waiting_for_approval" ||taskSubmission.status === "denied") &&
      (taskSubmission.questionnaireSubmissionStatus === "submitted") &&
      (canEdit) && !taskSubmission.lockWhenComplete;

    const backLink = (
      <div className="back-link" onClick={() => this.sendBackToQestionnaire()}>
        <img src={BackArrow} />
        Back
      </div>
    );

    const editControlButton = showEditControlButton && !isSRATaskFinalised ? (
      <LightButton
        title="EDIT CONTROLS"
        onClick={ dispatchEditAnswersAction}
        classes={["button"]}
        iconImage={editIcon}
      />
    ) : null;

    const doneButton = (
      <DarkButton
        title="Done"
        onClick={() =>
          dispatchFinishAction(taskSubmission.questionnaireSubmissionUUID,this.props.secureToken)
        }
        disabled={!this.state.enableDoneButton}
      />
    );

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

    let body = null;
    switch (taskSubmission.status) {
      case "start":
      case "in_progress":
         if (!canEdit){
           body = (
            <div className="ComponentSelectionReview">
              {backLink}
              <div className="section">
                <h4>Selected Components</h4>
                <br />
                <SubmissionNotCompleted/>
              </div>
            </div>
             );
           break;
         }
         else {
          body = (
            <ComponentSelection
              key={taskSubmission.productAspects}
              availableComponents={availableComponents}
              selectedComponents={selectedComponents}
              componentTarget={taskSubmission.componentTarget}
              productAspects={taskSubmission.productAspects}
              questionnaireSubmissionUUID={taskSubmission.questionnaireSubmissionUUID}
              controlSetSelectionTaskHelpText={taskSubmission.controlSetSelectionTaskHelpText}
              updateIsLastComponentSelectionCompleted={this.updateIsLastComponentSelectionCompleted}
              backLink={backLink}
              createJIRATickets={(jiraKey) => {
                dispatchCreateJIRATicketsAction(jiraKey);
              }}
              saveControls={() => {
                dispatchSaveLocalControlsAction();
              }}
              removeComponent={(id, productAspect) => {
                dispatchRemoveComponentAction(id, productAspect);
              }}
              addComponent={(id, productAspect) => {
                dispatchAddComponentAction(id, productAspect);
              }}
            />
          );
        break;
       }
      case "complete":
        body = (
          <ComponentSelectionReview
            isSRATaskFinalised={isSRATaskFinalised}
            selectedComponents={taskSubmission.selectedComponents}
            jiraTickets={taskSubmission.jiraTickets}
            componentTarget={taskSubmission.componentTarget}
            productAspects={taskSubmission.productAspects}
            backLink={backLink}
          />
        );
        break;
        case "expired":
          body = (<SubmissionExpired/>);
        break;
    }

    if (this.state.isLastComponentSelectionCompleted) {
      body = (
        <ComponentSelectionReview
          key={this.state.enableDoneButton}
          selectedComponents={selectedComponents}
          jiraTickets={taskSubmission.jiraTickets}
          componentTarget={taskSubmission.componentTarget}
          productAspects={taskSubmission.productAspects}
          backLink={backLink}
          doneButton={doneButton}
        />
      )
    }

    return (
      <div className="ComponentSelectionContainer">
        <Header
          pageTitle={taskSubmission.taskName}
          logopath={siteConfig.logoPath}
          productName={taskSubmission.questionnaireSubmissionProductName}
          questionnaireSubmissionUUID={taskSubmission.questionnaireSubmissionUUID}
          isTaskApprover={taskSubmission.isCurrentUserAnApprover}
          showSubmissionBreadcrumb={showSubmissionBreadcrumb}
          showApprovalBreadcrumb={showApprovalBreadcrumb}
        />
        {body}
        <Footer footerCopyrightText={siteConfig.footerCopyrightText}/>
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ComponentSelectionContainer);
