// @flow

import React, { Component } from "react";
import { connect } from "react-redux";
import type { RootState } from "../../store/RootState";
import { Dispatch } from "redux";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import { loadCurrentUser } from "../../actions/user";
import LikelihoodLegendContainer from "./LikelihoodLegendContainer";
import ImpactThresholdContainer from "./ImpactThresholdContainer";
import RiskAssessmentTableContainer from "./RiskAssessmentTableContainer";
import RiskRatingThresholdContainer from "./RiskRatingThresholdContainer";
import type { User } from "../../types/User";
import {
  loadSecurityRiskAssessment,
  loadImpactThreshold,
  updateControlValidationAuditData
} from "../../actions/securityRiskAssessment";
import { completeTaskSubmission } from "../../actions/task";
import type { SecurityRiskAssessment } from "../../types/Task";
import URLUtil from "../../utils/URLUtil";
import LightButton from "../Button/LightButton";
import DarkButton from "../Button/DarkButton";
import { loadSiteConfig } from "../../actions/siteConfig";
import type { SiteConfig } from "../../types/SiteConfig";
import type { ImpactThreshold } from "../../types/ImpactThreshold";
import SecurityRiskAssessmentUtil from "../../utils/SecurityRiskAssessmentUtil";
import { SubmissionExpired } from "../Common/SubmissionExpired";
import BackArrow from "../../../img/icons/back-arrow.svg";
import ControlBoard from "../SecurityRiskAssessment/ControlBoard/ControlBoard";
import ReactModal from "react-modal";
import CloseIcon from "../../../img/icons/close.svg";

const mapStateToProps = (state: RootState) => {
  return {
    siteConfig: state.siteConfigState.siteConfig,
    currentUser: state.currentUserState.user,
    securityRiskAssessmentData: state.securityRiskAssessmentState.securityRiskAssessmentData,
    impactThresholdData: state.securityRiskAssessmentState.impactThresholdData
  };
};

const mapDispatchToProps = (dispatch: Dispatch, props: *) => {
  return {
    dispatchLoadDataAction(uuid: string, secureToken: string, component:string) {
      dispatch(loadCurrentUser());
      dispatch(loadSiteConfig());
      dispatch(loadSecurityRiskAssessment({ uuid, secureToken, component }));
      dispatch(loadImpactThreshold());
    },
    dispatchSaveAction(uuid: string, secureToken?: string | null, questionnaireUUID: string, component:string) {
      dispatch(completeTaskSubmission({ 'taskSubmissionUUID': uuid, 'secureToken': secureToken, 'questionnaireUUID': questionnaireUUID, 'component': component }));
    },
    // update the selectedOption when control cards are moved
    dispatchUpdateCVAControlStatus(selectedOptionDetail: object) {
      dispatch(updateControlValidationAuditData(selectedOptionDetail));
    }
  };
};

type Props = {
  uuid: string,
  secureToken: string,
  component: string,
  siteConfig?: SiteConfig | null,
  currentUser?: User | null,
  impactThresholdData?: Array<ImpactThreshold> | null,
  securityRiskAssessmentData?: SecurityRiskAssessment | null,
  dispatchLoadDataAction?: (uuid: string, secureToken: string, component: string) => void,
  dispatchFinaliseAction?: (uuid: string, secureToken: string) => void,
  dispatchUpdateCVAControlStatus?: (selectedOptionDetail: object) => void,
};

class DigitalSecurityRiskAssessmentContainer extends Component<Props> {
  componentDidMount() {
    const { uuid, dispatchLoadDataAction, secureToken, component } = { ...this.props };
    dispatchLoadDataAction(uuid, secureToken, component);
  }

  state = {
    showModal: false,
  };

  handleOpenSubmitModal = () => {
    this.setState({ showModal: true });
  };

  handleCloseSubmitModal = () => {
    this.setState({ showModal: false });
  };

  handleSubmit= () => {
    const {
      uuid, dispatchSaveAction, secureToken, component, securityRiskAssessmentData
    } = { ...this.props };
    dispatchSaveAction(uuid, secureToken, securityRiskAssessmentData.questionnaireSubmissionUUID, component)
    this.setState({ showModal: false });
  };

  renderSubmitModal(questionnaireSubmissionProductName, selectedControls) {
    const productName = questionnaireSubmissionProductName;
    let numberOfControlsInNotImplementedCol = 0;

    if (selectedControls.length) {
      const result = selectedControls.filter(
        (obj) => obj.productAspect === this.props.component
      );

      if (result.length) {
        numberOfControlsInNotImplementedCol = result[0].controls.filter(
          (control) => control.selectedOption === "Intended"
        ).length;
      }
    }

    return (
      <ReactModal
        portalClassName="submit-modal"
        isOpen={this.state.showModal}
        ariaHideApp={false}
        parentSelector={() => {
          return document.querySelector(".SecurityRiskAssessmentContainer");
        }}
      >
        <div className="modal-header">
          <span className="header-title">
            <h1>Confirm submission</h1>
          </span>
          <div className="close-icon-container" onClick={this.handleCloseSubmitModal}>
            <img src={CloseIcon} />
          </div>
        </div>
        <div className="content">
          <p>
            You are about to submit the security risk assessment for&nbsp;
            {productName ? productName : "Product"}.
          </p>
          {numberOfControlsInNotImplementedCol >= 1 && (
            <p>
              You still have {numberOfControlsInNotImplementedCol}&nbsp;
              {numberOfControlsInNotImplementedCol == 1 ? 'control' : 'controls'}
               &nbsp;that {numberOfControlsInNotImplementedCol == 1 ? 'has' : 'have'}
               &nbsp;not been implemented. You will not be able to make any changes once you submit.
            </p>
          )}
          <p className="confirmation-message">
            Are you sure you wish to continue?
          </p>
        </div>
        <div className="button-container">
          <LightButton
            title="No, don't submit"
            classes={["mr-3 confirm-submission-button"]}
            onClick={this.handleCloseSubmitModal}
          />
          <DarkButton
            title="Yes, continue to submit"
            classes={["confirm-submission-button"]}
            onClick={this.handleSubmit}
          />
        </div>
      </ReactModal>
    )
  }

  render() {
    const {
      siteConfig,
      currentUser,
      securityRiskAssessmentData,
      secureToken,
      impactThresholdData,
      component,
      dispatchUpdateCVAControlStatus
    } = { ...this.props };

    if (!currentUser || !siteConfig || !securityRiskAssessmentData) {
      return null;
    }

    const {
      uuid,
      taskName,
      questionnaireSubmissionUUID,
      submitterID,
      taskSubmissions,
      sraData,
      status,
      sraTaskHelpText,
      sraTaskRecommendedControlHelpText,
      sraTaskRiskRatingHelpText,
      sraTaskLikelihoodScoreHelpText,
      sraTaskImpactScoreHelpText,
      sraTaskNotApplicableInformationText,
      sraTaskNotImplementedInformationText,
      sraTaskPlannedInformationText,
      sraTaskImplementedInformationText,
      selectedControls,
      questionnaireSubmissionProductName,
      likelihoodRatingThresholds,
      riskRatingThresholds
    } = { ...securityRiskAssessmentData };

    const cvaTaskSubmission = taskSubmissions.filter((taskSubmission) => {
      return taskSubmission.taskType === "control validation audit";
    });
    const cvaTaskSubmissionUUID = cvaTaskSubmission[0].uuid;

    const isSRATaskFinalised = SecurityRiskAssessmentUtil.isSRATaskFinalised(taskSubmissions);
    const isSiblingTaskPending = SecurityRiskAssessmentUtil.isSiblingTaskPending(taskSubmissions);
    const isSubmitter = securityRiskAssessmentData.submitterID === currentUser.id;
    const canFinalise = isSubmitter || securityRiskAssessmentData.isTaskCollborator;

    const finaliseButton = !isSRATaskFinalised && !isSiblingTaskPending && canFinalise
      ? (
        <DarkButton title="FINALISE"
          classes={["button ml-3"]}
          onClick={() => {
            this.props.dispatchFinaliseAction(uuid, secureToken, questionnaireSubmissionUUID);
          }}
        />
      ) : null;

    const backLink = (
      <div className="back-link" onClick={() => {
        URLUtil.redirectToQuestionnaireSummary(questionnaireSubmissionUUID, secureToken);
      }}>
        <img src={BackArrow} />
        Back
      </div>
    );

    let showSubmissionBreadcrumb = false
    let showApprovalBreadcrumb = false;

    if (isSubmitter || securityRiskAssessmentData.isTaskCollborator) {
      showSubmissionBreadcrumb = true;
    }

    if (!showSubmissionBreadcrumb) {
      if (currentUser.isSA ||
        currentUser.isCISO ||
        securityRiskAssessmentData.isBusinessOwner ||
        currentUser.isAccreditationAuthority ||
        currentUser.isCertificationAuthority) {
        showApprovalBreadcrumb = true;
      }
    }

    return (
      <div className="SecurityRiskAssessmentContainer">

        <Header
          pageTitle={securityRiskAssessmentData.taskName}
          logopath={siteConfig.logoPath}
          productName={securityRiskAssessmentData.questionnaireSubmissionProductName}
          questionnaireSubmissionUUID={securityRiskAssessmentData.questionnaireSubmissionUUID}
          showSubmissionBreadcrumb={showSubmissionBreadcrumb}
          showApprovalBreadcrumb={showApprovalBreadcrumb}
          component={component}
        />

        {securityRiskAssessmentData.status === 'expired' && <SubmissionExpired />}

        {
          securityRiskAssessmentData.status !== 'expired' && (
            <div className="SecurityRiskAssessment">
              {backLink}
              <h4>Your risk assessment results</h4>
              <div className="help-text">
                {sraTaskHelpText}
              </div>
              <div className="help-text">
                <RiskAssessmentTableContainer
                  riskRatingHelpText={sraTaskRiskRatingHelpText}
                  likelihoodScoreHelpText={sraTaskLikelihoodScoreHelpText}
                  likelihoodRatingThresholds={likelihoodRatingThresholds}
                  riskRatingThresholds={riskRatingThresholds}
                  sraData={sraData}
                  impactScoreHelpText={sraTaskImpactScoreHelpText}
                  impactScoreThresholds={impactThresholdData}
                />
              </div>
              <h4>Recommended Controls</h4>
              <div className="help-text">
                {sraTaskRecommendedControlHelpText}
              </div>
              <div className="security-risk-assessment-control-board">
                <ControlBoard
                  productAspect={this.props.component}
                  notApplicableInformationText={sraTaskNotApplicableInformationText}
                  notImplementedInformationText={sraTaskNotImplementedInformationText}
                  plannedInformationText={sraTaskPlannedInformationText}
                  implementedInformationText={sraTaskImplementedInformationText}
                  selectedControls={selectedControls}
                  key={selectedControls.length > 0 ? `${selectedControls[0].id} ${selectedControls[0].name} ${selectedControls[0].productAspect}` : ''}
                  dispatchUpdateCVAControlStatus={(selectedOptionDetail) => {
                    dispatchUpdateCVAControlStatus(selectedOptionDetail);
                  }}
                  cvaTaskSubmissionUUID={cvaTaskSubmissionUUID}
                  productName={securityRiskAssessmentData.questionnaireSubmissionProductName}
                />
              </div>
              <div className="bottom-container">
                <div className="container-right">
                  <div className="message-container">
                    <span>Note: Changes are automatically saved</span>
                  </div>
                  <div className="button-container">
                    <LightButton
                      classes={["button"]}
                      title="Save and exit"
                      onClick={() => {
                        URLUtil.redirectToQuestionnaireSummary(questionnaireSubmissionUUID, secureToken);
                      }}
                    />
                    <DarkButton
                      classes={["button button-submit"]}
                      title="Submit"
                      onClick={() => this.handleOpenSubmitModal()}
                    />
                  </div>
                </div>
              </div>
              {this.renderSubmitModal(questionnaireSubmissionProductName, selectedControls)}
            </div>
          )
        }

        <Footer footerCopyrightText={siteConfig.footerCopyrightText} />
      </div>
    )
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(DigitalSecurityRiskAssessmentContainer);
