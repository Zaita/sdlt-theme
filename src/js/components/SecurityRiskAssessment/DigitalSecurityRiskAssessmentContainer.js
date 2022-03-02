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
  loadImpactThreshold
} from "../../actions/securityRiskAssessment";
import {
  completeTaskSubmission
} from "../../actions/task";
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
    dispatchLoadDataAction(uuid: string, secureToken: string) {
      dispatch(loadCurrentUser());
      dispatch(loadSiteConfig());
      dispatch(loadSecurityRiskAssessment({ uuid, secureToken }));
      dispatch(loadImpactThreshold());
    },
    dispatchFinaliseAction(uuid: string, secureToken?: string | null, questionnaireUUID) {
      dispatch(completeTaskSubmission({ 'taskSubmissionUUID': uuid, 'secureToken': secureToken, 'questionnaireUUID': questionnaireUUID }));
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
  dispatchLoadDataAction?: (uuid: string, secureToken: string) => void,
  dispatchFinaliseAction?: (uuid: string, secureToken: string) => void,
};

class DigitalSecurityRiskAssessmentContainer extends Component<Props> {
  componentDidMount() {
    const { uuid, dispatchLoadDataAction, secureToken } = { ...this.props };
    dispatchLoadDataAction(uuid, secureToken);
  }

  render() {
    const {
      siteConfig,
      currentUser,
      securityRiskAssessmentData,
      secureToken,
      impactThresholdData,
      component
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
    } = { ...securityRiskAssessmentData };

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
                  riskRatingThresholds={sraData.riskRatingThresholds}
                  likelihoodScoreHelpText={sraTaskLikelihoodScoreHelpText}
                  likelihoodScoreThresholds={sraData.likelihoodThresholds}
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
                  notApplicableInformationText={sraTaskNotApplicableInformationText}
                  notImplementedInformationText={sraTaskNotImplementedInformationText}
                  plannedInformationText={sraTaskPlannedInformationText}
                  implementedInformationText={sraTaskImplementedInformationText}
                />
              </div>
              <div className="bottom-container">
                <div className="container-right">
                  <div className="message-container">
                    <span>Note: Changes are automatically saved</span>
                  </div>
                  <div className="button-container">
                    <LightButton classes={["button"]} title="Exit" onClick={() => {
                      URLUtil.redirectToQuestionnaireSummary(questionnaireSubmissionUUID, secureToken);
                    }} />
                    <DarkButton classes={["button button-submit"]} title="Submit" />
                  </div>
                </div>
              </div>
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
