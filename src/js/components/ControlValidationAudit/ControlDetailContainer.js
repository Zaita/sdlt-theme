// @flow
import React, { useEffect, useRef, useState } from "react";
import { connect } from "react-redux";
import type { RootState } from "../../store/RootState";
import { Dispatch } from "redux";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import { useLocation } from "react-router-dom";
import { loadSiteConfig } from "../../actions/siteConfig";
import { loadCurrentUser } from "../../actions/user";
import { updateCVAControlDetailData } from "../../actions/controlValidationAudit";
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
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import DarkButton from "../Button/DarkButton";
import EditorField from "../Common/EditorField";
import { RouterPrompt } from "./RouterPrompt";
import { isEqual } from "lodash";

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
    // update the control object:  clicking on save button
    dispatchUpdateCVAControlDetailAction(
      updatedControl: object,
      controlID: string,
      componentID: string,
      productAspect: string,
      cvaTaskSubmissionUUID: string,
      sraTaskSubmissionUUID: string,
      comingFrom: string
    ) {
      dispatch(updateCVAControlDetailData({updatedControl, controlID, componentID, productAspect, cvaTaskSubmissionUUID, sraTaskSubmissionUUID, comingFrom}));
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

  const [currentControlData, setCurrentControlData] = useState({...state.props.control});
  const auditMethodHelpText = 'The audit process is based on the GCDO Assurance framework, and the guidelines for auditing management systems ISO / IEC 19011:2011.\nDescribe the activities and methods used to perform the audit of the control (e.g. documentation review, interviews, evidence or observations, testing).';
  const auditNotesAndFindingsHelpText = 'Explain the rationale for the control evaluation rating and identify issues in this section.';
  const auditRecommendationsHelpText = 'Describe the remediation activities to address the identified control deficiencies with respect to the control evaluation and the risk ratings.';
  const [openModal, setOpenModal] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  const resetModalState = (action) => {
    if (action === "cancel") {
      setOpenModal(false);
      return;
    }
    setOpenModal(false);
    setUnsavedChanges(false);
  }

  const handleCloseSubmitModal = () => {
    saveCVAControlDetail(state.props.control);
    setOpenModal(false);
  };

  const handleSubmit = () => {
    saveCVAControlDetail(currentControlData);
    resetModalState();
  };

  const backLinkUrl = () => {
    if (unsavedChanges) {
      setOpenModal(true);
      return;
    }

    if (comingFrom == 'sra' && !unsavedChanges) {
      URLUtil.redirectToSecurityRiskAssessment(sraTaskSubmissionUUID, secureToken, 'redirect', productAspect)
    } else if (comingFrom !=='sra' && !unsavedChanges) {
      URLUtil.redirectToControlValidationAudit(cvaTaskSubmissionUUID, secureToken, 'redirect', productAspect)
    }
  };

  const backLink = (
    <div className="back-link" onClick={backLinkUrl}>
      <img src={BackArrow} />
      Back
    </div>
  );

  const updateCVAControlDetail = (fieldName, fieldValue) => {
    setCurrentControlData({ ...currentControlData, [fieldName]: fieldValue });
  };

  const saveCVAControlDetail = (currentControlData) => {
    const regx = /{\d*}/g;
    const idArray = currentControlData.id.match(regx);
    const controlID = (idArray[1].match(/\d+/g)).pop();
    const componentID = (idArray[0].match(/\d+/g)).pop();
    currentControlData.id = controlID;
    dispatchUpdateCVAControlDetailAction(currentControlData, controlID, componentID, productAspect, cvaTaskSubmissionUUID, sraTaskSubmissionUUID, comingFrom);
  }

  const keyControlMessageParts = IS_KEY_CONTROL_MESSAGE.match(/[^.]+[.]+/g);

  const implementationStatusOptions = [
    { value: CTL_STATUS_3, label: "Not applicable" },
    { value: CTL_STATUS_2, label: "Not implemented" },
    { value: CTL_STATUS_4, label: "Planned" },
    { value: CTL_STATUS_1, label: "Implemented"}
  ];

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

  useEffect(() => {
    if (isEqual(currentControlData, state?.props?.control)) {
      setUnsavedChanges(false);
    }
    else {
      setUnsavedChanges(true);
    }

  }, [currentControlData, state?.props?.control]);

  // useEffect(() => {
  //   const handleTabClose = (event) => {
  //     event.preventDefault();
  //     return (event.returnValue = 'Are you sure you want to exit?');
  //   };

  //   window.addEventListener('beforeunload', handleTabClose);

  //   return () => {
  //     resetModalState();
  //     window.removeEventListener('beforeunload', handleTabClose);
  //   };
  // }, []);

  // //listen for browser back button
  // useEffect(() => {
  //   window.addEventListener("popstate", () => {
  //     setBrowserBackButton(true);
  //   });
  //   return () => {
  //     window.removeEventListener("popstate", () => {
  //       setBrowserBackButton(false);
  //     });
  //   };
  // }, []);

  return (
    <div className="ControlDetailContainer">
      <RouterPrompt
        when={openModal}
        handleCloseSubmitModal={() => handleCloseSubmitModal()}
        handleSubmit={() => handleSubmit()}
        resetModalState={resetModalState}
      />
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
                defaultValue={implementationStatusOptions.find(
                  ({ value }) => value === selectedOption
                )}
                className="react-select-container"
                classNamePrefix="react-select"
                isSearchable={false}
                styles={{
                  dropdownIndicator: (provided, state) => ({
                    ...provided,
                    transform: state.selectProps.menuIsOpen && "rotate(180deg)",
                  }),
                }}
                onChange={(selectedOption) =>
                  updateCVAControlDetail("selectedOption", selectedOption.value)
                }
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
            initialValue={currentControlData.implementationEvidenceUserInput}
            fieldName="implementationEvidenceUserInput"
            onBlurUpdate={updateCVAControlDetail}
            setUnsavedChanges={(boolean) => setUnsavedChanges(boolean)}
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

              {currentControlData.selectedOption != CTL_STATUS_1 && (
                <p className="help-text">
                  This control needs to be implemented first before it can be
                  audited.
                </p>
              )}

              {currentControlData.selectedOption === CTL_STATUS_1 && (
                <Select
                  options={evaluationRatingOptions}
                  defaultValue={initialEvaluationRating}
                  className="react-select-container evaluation-dropdown-container"
                  classNamePrefix="react-select"
                  isSearchable={false}
                  styles={{
                    dropdownIndicator: (provided, state) => ({
                      ...provided,
                      transform:
                        state.selectProps.menuIsOpen && "rotate(180deg)",
                    }),
                  }}
                  onChange={(evaluationRating) =>
                    updateCVAControlDetail(
                      "evalutionRating",
                      evaluationRating.value
                    )
                  }
                />
              )}
            </div>
          </div>

          <EditorField
            heading="Audit method"
            helpText={auditMethodHelpText}
            initialValue={currentControlData.auditMethodUserInput}
            fieldName="auditMethodUserInput"
            onBlurUpdate={updateCVAControlDetail}
            setUnsavedChanges={(boolean) => setUnsavedChanges}
          />

          <EditorField
            heading="Audit notes and findings"
            helpText={auditNotesAndFindingsHelpText}
            initialValue={currentControlData.auditNotesAndFindingsUserInput}
            fieldName="auditNotesAndFindingsUserInput"
            onBlurUpdate={updateCVAControlDetail}
            setUnsavedChanges={(boolean) => setUnsavedChanges}
          />

          <EditorField
            heading="Audit recommendations"
            helpText={auditRecommendationsHelpText}
            initialValue={currentControlData.auditRecommendationsUserInput}
            fieldName="auditRecommendationsUserInput"
            onBlurUpdate={updateCVAControlDetail}
            setUnsavedChanges={(boolean) => setUnsavedChanges}
          />
        </div>
        <div className="bottom-container">
          <div className="button-container">
            <DarkButton
              title="Save"
              onClick={() => saveCVAControlDetail(currentControlData)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ControlDetailContainer);
