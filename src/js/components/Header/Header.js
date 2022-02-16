// @flow

import React, {Component} from "react";
import LogoutButton from "../Button/LogoutButton";
import AwaitingApprovalsButton from "../Button/AwaitingApprovalsButton";
import MySubmissionButton from "../Button/MySubmissionButton";
import HomeButton from "../Button/HomeButton";
import Breadcrumbs from "./Breadcrumbs";

type Props = {
  pageTitle: string,
  showLogoutButton?: boolean,
  logopath?: string,
  productName?: string,
  isTaskApprover?: boolean,
  showApprovalBreadcrumb?: boolean,
  showSubmissionBreadcrumb?: boolean,
  subHeaderImagePath?: string,
};

class Header extends Component<Props> {
  static defaultProps = {
    pageTitle: "",
    logopath: "",
    showLogoutButton: true,
    productName: "",
    isTaskApprover: false,
    showApprovalBreadcrumb: false,
    showSubmissionBreadcrumb: false,
    subHeaderImagePath: ""
  };

  render() {
    const {
      pageTitle,
      logopath,
      showLogoutButton,
      productName,
      isTaskApprover,
      questionnaireSubmissionUUID,
      showApprovalBreadcrumb,
      showSubmissionBreadcrumb,
      subHeaderImagePath
    } = { ...this.props };

    let isHomePage = false;

    if (window.location.hash == `#/`) {
      isHomePage  = true;
    }

    return (
      <header className="Header">
        <div className="main-header">
          <a href="/">
            <img src={logopath} className="logo" />
          </a>

          <div className="header-buttons">
            <HomeButton />
            <MySubmissionButton showSubmissionBreadcrumb={showSubmissionBreadcrumb}/>
            <AwaitingApprovalsButton showApprovalBreadcrumb={showApprovalBreadcrumb}/>
            {showLogoutButton && <LogoutButton />}
          </div>
        </div>

        {isHomePage ? (
          <div
            className="homepage-subheader"
            style={{ backgroundImage: `url("${subHeaderImagePath}")` }}
          />
        ) : (
          <div className="breadcrumbs-subheader">
            <Breadcrumbs
              productName={productName}
              questionnaireSubmissionUUID={questionnaireSubmissionUUID}
              showApprovalBreadcrumb={showApprovalBreadcrumb}
              isTaskApprover={isTaskApprover}
            />
            <h1>{pageTitle}</h1>
          </div>
        )}
      </header>
    );
  }
}

export default Header;
