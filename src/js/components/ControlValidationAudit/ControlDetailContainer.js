 // @flow
import React, {Component, useEffect, useState} from "react";
import {connect} from "react-redux";
import type {RootState} from "../../store/RootState";
import {Dispatch} from "redux";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import { useLocation } from "react-router-dom";
import { loadSiteConfig } from "../../actions/siteConfig";
import { loadCurrentUser } from "../../actions/user";

const mapStateToProps = (state: RootState) => {
  return {
    siteConfig: state.siteConfigState.siteConfig,
    currentUser: state.currentUserState.user
  };
};

const mapDispatchToProps = (dispatch: Dispatch, props: *) => {
  return {
    dispatchLoadDataAction () {
      dispatch(loadCurrentUser());
      dispatch(loadSiteConfig());
    }
  };
};

function ControlDetailContainer(props) {
  const location = useLocation();
  const state = location.state;
  let showSubmissionBreadcrumb = true;

  if (!props || !state) {
    return null;
  }

  const {
    siteConfig,
    currentUser,
    dispatchLoadDataAction
  } = { ...props };

  useEffect(() => {
    dispatchLoadDataAction();
  }, [])

  const {
    control,
    productName
  } = { ...state.props };

  if (!currentUser || !siteConfig) {
    return null;
  }

  return (
    <div className="SecurityRiskAssessmentContainer">
      <Header
        pageTitle={control.name}
        logopath={siteConfig.logoPath}
        productName={"test product"}
        questionnaireSubmissionUUID={"a57317ee-8825-4764-982e-13a5d8d84db1"}
        showSubmissionBreadcrumb={true}
        showApprovalBreadcrumb={false}
      />
      <div className="SecurityRiskAssessment">
        test
      </div>
    </div>
  );
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ControlDetailContainer);
