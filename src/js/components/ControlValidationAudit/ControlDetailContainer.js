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
  CTL_STATUS_4
} from "../../constants/values";
import Select from 'react-select';

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
    controlOwnerDetails
  } = { ...state.props.control };

  if (!currentUser || !siteConfig) {
    return null;
  }

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

  const keyControlMessageParts = IS_KEY_CONTROL_MESSAGE.match(/[^.]+[.]+/g);

  const implementationStatusOptions = [
    { value: CTL_STATUS_3, label: "Not applicable" },
    { value: CTL_STATUS_2, label: "Not implemented" },
    { value: CTL_STATUS_4, label: "Planned" },
    { value: CTL_STATUS_1, label: "Implemented"}
  ];

  const initialImplementationStatus = implementationStatusOptions.find(({ value }) => value === selectedOption);

  const regex = /{\d*}/g;
  const controlIdArray = id.match(regex);
  const controlID = (controlIdArray[1].match(/\d+/g)).pop();

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
                      transform: state.selectProps.menuIsOpen && "rotate(180deg)"
                    })
                  }}
                  onChange={(selectedOption) => dispatchUpdateCVAControlDetailAction({
                    "controlID": controlID,
                    "fieldName": "selectedOption",
                    "updatedValue": selectedOption.value
                  })}
                  isSearchable={false}
                />
            </div>

            <div className="control-owner-details-container">
              <h5>Control owner</h5>
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
            </div>
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
