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
  showSubmissionBreadcrumb?: boolean
};

class Header extends Component<Props> {
  static defaultProps = {
    pageTitle: "",
    logopath: "",
    showLogoutButton: true,
    productName: "",
    isTaskApprover: false,
    showApprovalBreadcrumb: false,
    showSubmissionBreadcrumb: false
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

        <div className={isHomePage ? "" : "breadcrumbs-subheader"}>
          {!isHomePage ? (
            <React.Fragment>
              <Breadcrumbs
                productName={productName}
                questionnaireSubmissionUUID={questionnaireSubmissionUUID}
                showApprovalBreadcrumb={showApprovalBreadcrumb}
                isTaskApprover={isTaskApprover}
              />
              <div className="page-title">
                <h1>{pageTitle}</h1>
              </div>
            </React.Fragment>
          ) : null
          }
        </div>
      </header>
    );
  }
}

export default Header;
