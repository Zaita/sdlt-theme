// @flow
import React, { useEffect } from "react";
import { connect } from "react-redux";
import type { RootState } from "../../store/RootState";
import { Dispatch } from "redux";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import { useLocation } from "react-router-dom";
import { loadSiteConfig } from "../../actions/siteConfig";
import { loadCurrentUser } from "../../actions/user";
import { IS_KEY_CONTROL_MESSAGE } from "../../constants/values";
import KeyControlIcon from "../../../img/icons/key-control-star.svg";

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

  const { siteConfig, currentUser, dispatchLoadDataAction } = { ...props };

  useEffect(() => {
    dispatchLoadDataAction();
  }, []);

  const { productName } = { ...state.props };
  const { name, isKeyControl } = { ...state.props.control };

  if (!currentUser || !siteConfig) {
    return null;
  }

  const keyControlMessageParts = IS_KEY_CONTROL_MESSAGE.match(/[^.]+[.]+/g);

  return (
    <div className="ControlDetailContainer">
      <Header
        pageTitle={name}
        logopath={siteConfig.logoPath}
        productName={"test product"}
        questionnaireSubmissionUUID={"a57317ee-8825-4764-982e-13a5d8d84db1"}
        showSubmissionBreadcrumb={true}
        showApprovalBreadcrumb={false}
      />

      <div className="ControlDetail">
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
      </div>
    </div>
  );
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ControlDetailContainer);
