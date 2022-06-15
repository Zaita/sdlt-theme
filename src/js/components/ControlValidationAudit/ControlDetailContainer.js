// @flow
import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import type { RootState } from "../../store/RootState";
import { Dispatch } from "redux";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import { useLocation } from "react-router-dom";
import { loadSiteConfig } from "../../actions/siteConfig";
import { loadCurrentUser } from "../../actions/user";
import { updateCVAControlDetailData } from "../../actions/securityRiskAssessment";
import KeyControlIcon from "../../../img/icons/key-control-star.svg";
import BackArrow from "../../../img/icons/back-arrow.svg";
import URLUtil from "../../utils/URLUtil";
import {
  IS_KEY_CONTROL_MESSAGE,
  CTL_STATUS_1,
  CTL_STATUS_2,
  CTL_STATUS_3,
  CTL_STATUS_4,
  EVALUTION_RATING_1,
  EVALUTION_RATING_2,
  EVALUTION_RATING_3,
  EVALUTION_RATING_4
} from "../../constants/values";
import InformationTooltip from "../Common/InformationTooltip";
import Select from 'react-select';
import 'tinymce/themes/modern';
import { Editor } from "@tinymce/tinymce-react";
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

const mapStateToProps = (state: RootState) => {
  return {
    siteConfig: state.siteConfigState.siteConfig,
    currentUser: state.currentUserState.user
  };
};

const mapDispatchToProps = (dispatch: Dispatch, props: *) => {
  return {
    dispatchLoadDataAction() {
      dispatch(loadCurrentUser());
      dispatch(loadSiteConfig());
    },
    // update the control object before clicking on save button
    dispatchUpdateCVAControlDetailAction(controlID: string, fieldName: string, updatedValue: string) {
      dispatch(updateCVAControlDetailData(controlID, fieldName, updatedValue));
    }
  };
};

function ControlDetailContainer(props) {
  const location = useLocation();
  const state = location.state;

  if (!props || !state) {
    return null;
  }

  const {
    siteConfig,
    currentUser,
    dispatchLoadDataAction,
    dispatchUpdateCVAControlDetailAction
  } = { ...props };

  useEffect(() => {
    dispatchLoadDataAction();
  }, []);

  const {
    productName,
    sraTaskSubmissionUUID,
    cvaTaskSubmissionUUID,
    secureToken,
    showSubmissionBreadcrumb,
    showApprovalBreadcrumb,
    questionnaireSubmissionUUID,
    sraTaskName,
    cvaTaskName,
    comingFrom,
    productAspect
  } = { ...state.props };

  const {
    id,
    name,
    isKeyControl,
    description,
    selectedOption,
    controlOwnerDetails,
    implementationEvidenceHelpText,
    implementationEvidenceUserInput,
    implementationGuidance,
    implementationAuditHelpText,
    evalutionRating,
    auditMethodUserInput,
    auditNotesAndFindingsUserInput,
    auditRecommendationsUserInput
  } = { ...state.props.control };

  if (!currentUser || !siteConfig) {
    return null;
  }

  const auditMethodHelpText = 'The audit process is based on the GCDO Assurance framework, and the guidelines for auditing management systems ISO / IEC 19011:2011.\nDescribe the activities and methods used to perform the audit of the control (e.g. documentation review, interviews, evidence or observations, testing).';
  const auditNotesAndFindingsHelpText = 'Explain the rationale for the control evaluation rating and identify issues in this section.';
  const auditRecommendationsHelpText = 'Describe the remediation activities to address the identified control deficiencies with respect to the control evaluation and the risk ratings.';

  const backLinkUrl = () => {comingFrom == 'sra' ?
    URLUtil.redirectToSecurityRiskAssessment(sraTaskSubmissionUUID, secureToken, 'redirect', productAspect) :
    URLUtil.redirectToControlValidationAudit(cvaTaskSubmissionUUID, secureToken, 'redirect', productAspect) ;
  };

  const backLink = (
    <div className="back-link" onClick={backLinkUrl}>
      <img src={BackArrow} />
      Back
    </div>
  );

  const EditorField = ({heading, helpText, initialValue, fieldName}) => {
    const [isTextAreaFocus, setIsTextAreaFocus] = useState(false);

    const handleOnBlur = (event, fieldName) => {
      setIsTextAreaFocus(false);
      dispatchUpdateCVAControlDetailAction({
        controlID: controlID,
        fieldName: fieldName,
        updatedValue: event.target.getContent(),
      });
    }

    return (
      <div className="editor-container">
        <h5>{heading}</h5>
        <p className="help-text">{helpText}</p>
        <div className={`editor-text-field ${isTextAreaFocus ? "focus" : ""}`}>
          <Editor
            initialValue={initialValue}
            init={{
              selector: "textarea",
              height: "73",
              menubar: false,
              toolbar: false,
              statusbar: false,
              content_style:
                "body { font-size: 11px; line-height: 16px; }" +
                "html { scrollbar-color: #2371A6 #fff; }",
              skin_url:
                "resources/vendor/silverstripe/admin/thirdparty/tinymce/skins/silverstripe",
            }}
            onFocus={() => setIsTextAreaFocus(true)}
            onBlur={(event) => {
              handleOnBlur(event, fieldName);
            }}
          />
        </div>
      </div>
    );
  };

  const keyControlMessageParts = IS_KEY_CONTROL_MESSAGE.match(/[^.]+[.]+/g);

  const implementationStatusOptions = [
    { value: CTL_STATUS_3, label: "Not applicable" },
    { value: CTL_STATUS_2, label: "Not implemented" },
    { value: CTL_STATUS_4, label: "Planned" },
    { value: CTL_STATUS_1, label: "Implemented"}
  ];

  const initialImplementationStatus = implementationStatusOptions.find(({ value }) => value === selectedOption);
  const [implementationStatus, setImplementationStatus] = useState(initialImplementationStatus.value);

  const regex = /{\d*}/g;
  const controlIdArray = id.match(regex);
  const controlID = (controlIdArray[1].match(/\d+/g)).pop();

  const implementationAuditRolesArray = [
    { name: "Your project", value: "<strong>Your project</strong>" },
    { name: "Security Architect", value: "<strong>Security Architect</strong>" },
    { name: "External Vendor", value: "<strong>External Vendor</strong>" }
  ];

  let updatedImplementationAuditHelpText = implementationAuditHelpText;
  implementationAuditRolesArray.forEach((role) => {
    updatedImplementationAuditHelpText = updatedImplementationAuditHelpText.replaceAll(
      role.name,
      role.value
    );
  });

  const evaluationRatingTooltipInformation = (
    <div className="evaluation-rating-tooltip-info">
      <p>
        <span className="evaluation-rating-label">Effective:</span>
        The implementation of this control is effective.
      </p>
      <p>
        <span className="evaluation-rating-label">Partially effective:</span>
        The implementation of this control is moderately effective.
      </p>
      <p>
        <span className="evaluation-rating-label">Not effective:</span>
        The implementation of this control is not effective.
      </p>
    </div>
  );

  const evaluationRatingOptions = [
    { value: EVALUTION_RATING_4, label: "Effective" },
    { value: EVALUTION_RATING_3, label: "Partially effective" },
    { value: EVALUTION_RATING_2, label: "Not effective" },
  ];

  let initialEvaluationRating = evaluationRatingOptions.find(({ value }) => value === evalutionRating);

  if (!initialEvaluationRating) {
    initialEvaluationRating = {
      value: EVALUTION_RATING_1, label: "Select"
    }
  }

  const [evaluationRating, setEvaluationRating] = useState(initialEvaluationRating.value);
  let updatedEvaluationRating = evaluationRatingOptions.find(({ value }) => value === evaluationRating);

  return (
    <div className="ControlDetailContainer">
      <Header
        pageTitle={name}
        logopath={siteConfig.logoPath}
        productName={productName}
        questionnaireSubmissionUUID={questionnaireSubmissionUUID}
        showSubmissionBreadcrumb={showSubmissionBreadcrumb}
        showApprovalBreadcrumb={showApprovalBreadcrumb}
        sraTaskName={sraTaskName}
        cvaTaskName={cvaTaskName}
        sraTaskSubmissionUUID={sraTaskSubmissionUUID}
        cvaTaskSubmissionUUID={cvaTaskSubmissionUUID}
        comingFrom={comingFrom}
        component={productAspect}
      />

      <div className="ControlDetail">
        {backLink}

        {isKeyControl && (
          <div className="alert key-control-banner">
            <img
              className="key-control-icon"
              src={KeyControlIcon}
              alt="star icon"
            />
            <strong>{keyControlMessageParts[0]}</strong>&nbsp;
            {keyControlMessageParts[1]}
          </div>
        )}

        <div className="control-description-container">
          <h5>Description</h5>
          <div
            className="control-description help-text control-detail-link"
            dangerouslySetInnerHTML={{ __html: description }}
          />
        </div>

        <div className="control-implementation-container">
          <div className="control-implementation-status-and-owner-subcontainer">
            <div className="control-implementation-status-container">
              <h5>Implementation status</h5>
              <Select
                options={implementationStatusOptions}
                defaultValue={initialImplementationStatus}
                className="react-select-container"
                classNamePrefix="react-select"
                styles={{
                  dropdownIndicator: (provided, state) => ({
                    ...provided,
                    transform: state.selectProps.menuIsOpen && "rotate(180deg)",
                  }),
                }}
                onChange={(selectedOption) =>
                  dispatchUpdateCVAControlDetailAction(
                    {
                      controlID: controlID,
                      fieldName: "selectedOption",
                      updatedValue: selectedOption.value,
                    },
                    setImplementationStatus(selectedOption.value)
                  )
                }
                isSearchable={false}
              />
            </div>

            <div className="control-owner-details-container">
              <h5>Control owner</h5>
              {controlOwnerDetails.length > 0 && (
                <div className="help-text">
                  {controlOwnerDetails[0].name}
                  {controlOwnerDetails[0].email && (
                    <p className="control-owner-email">
                      &nbsp;(
                      <span className="control-detail-link">
                        <a href={"mailto:" + controlOwnerDetails[0].email}>
                          {controlOwnerDetails[0].email}
                        </a>
                      </span>
                      )
                    </p>
                  )}
                  <span className="control-owner-team">
                    {controlOwnerDetails[0].team}
                  </span>
                </div>
              )}
            </div>
          </div>

          <EditorField
            heading="Evidence of implementation"
            helpText={implementationEvidenceHelpText}
            initialValue={implementationEvidenceUserInput}
            fieldName="implementationEvidence"
          />

          <div className="implementation-guidance-container">
            <Accordion>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="implementation-guidance-content"
                id="implementation-guidance-header"
              >
                <Typography>How to implement this control</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <div
                  className="implementation-guidance-content control-detail-link"
                  dangerouslySetInnerHTML={{ __html: implementationGuidance }}
                />
              </AccordionDetails>
            </Accordion>
          </div>
        </div>

        <div className="control-audit-container">
          <div className="implementation-audit-and-evaluation-rating-subcontainer">
            <div className="implementation-audit-container">
              <h5>Implementation audit</h5>
              <div
                className="implementation-audit-content help-text"
                dangerouslySetInnerHTML={{
                  __html: updatedImplementationAuditHelpText,
                }}
              />
            </div>

            <div className="evaluation-rating-container">
              <div className="evaluation-rating-heading">
                <h5>Evaluation rating</h5>
                <InformationTooltip
                  content={evaluationRatingTooltipInformation}
                />
              </div>

              {implementationStatus != CTL_STATUS_1 && (
                <p className="help-text">
                  This control needs to be implemented first before it can be
                  audited.
                </p>
              )}

              {implementationStatus === CTL_STATUS_1 && (
                <Select
                  options={evaluationRatingOptions}
                  defaultValue={initialEvaluationRating}
                  value={updatedEvaluationRating}
                  className="react-select-container evaluation-dropdown-container"
                  classNamePrefix="react-select"
                  styles={{
                    dropdownIndicator: (provided, state) => ({
                      ...provided,
                      transform:
                        state.selectProps.menuIsOpen && "rotate(180deg)",
                    }),
                  }}
                  onChange={(evaluationRating) =>
                    dispatchUpdateCVAControlDetailAction(
                      {
                        controlID: controlID,
                        fieldName: "evalutionRating",
                        updatedValue: evaluationRating.value,
                      },
                      setEvaluationRating(evaluationRating.value)
                    )
                  }
                  isSearchable={false}
                />
              )}
            </div>
          </div>

          <EditorField
            heading="Audit method"
            helpText={auditMethodHelpText}
            initialValue={auditMethodUserInput}
            fieldName="auditMethodUserInput"
          />

          <EditorField
            heading="Audit notes and findings"
            helpText={auditNotesAndFindingsHelpText}
            initialValue={auditNotesAndFindingsUserInput}
            fieldName="auditNotesAndFindingsUserInput"
          />

          <EditorField
            heading="Audit recommendations"
            helpText={auditRecommendationsHelpText}
            initialValue={auditRecommendationsUserInput}
            fieldName="auditRecommendationsUserInput"
          />
        </div>
      </div>
    </div>
  );
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ControlDetailContainer);
