import React, { Component } from "react";
import {
  Breadcrumbs as MuiBreadcrumbs,
  Link
} from "@material-ui/core";
import NavigateNextIcon from "@material-ui/icons/NavigateNext";
import { withRouter } from "react-router-dom";
import URLUtil from "../../utils/URLUtil";

class Breadcrumbs extends Component {
  getApprovalsBreadcrumb = (showApprovalBreadcrumb) => {
    if (showApprovalBreadcrumb) {
      return (
        <Link onClick={() => URLUtil.redirectToApprovals()}>
          Your approvals
        </Link>
      );
    } else {
      return (
        <Link onClick={() => URLUtil.redirectToSubmissions()}>
          Your submissions
        </Link>
      );
    }
  }

  getProductNameBreadcrumb = (productName, isTaskApprover) => {
    if (!isTaskApprover) {
      return (
        <Link onClick={() => this.sendBackToQuestionnaireSummaryPage()}>
          {productName}
        </Link>
      )
    }
  };

  sendBackToQuestionnaireSummaryPage() {
    URLUtil.redirectToQuestionnaireSummary(this.props.questionnaireSubmissionUUID);
  }

  render() {
   const {
      match: { path },
      productName,
      showApprovalBreadcrumb,
      isTaskApprover
    } = this.props;

    return (
      <MuiBreadcrumbs separator={<NavigateNextIcon fontSize="inherit" />} aria-label="breadcrumb">
        <Link onClick={() => URLUtil.redirectToHome()}>Home</Link>

        {path == "/questionnaire/summary/:hash" ||
        path == "/task/submission/:uuid" ||
        path == "/security-risk-assessment/submission/:uuid" ||
        path == "/control-validation-audit/submission/:uuid" ||
        path == "/component-selection/submission/:uuid" ?
        this.getApprovalsBreadcrumb(showApprovalBreadcrumb) : null
        }

        {path == "/task/submission/:uuid" ||
        path == "/security-risk-assessment/submission/:uuid" ||
        path == "/control-validation-audit/submission/:uuid" ||
        path == "/component-selection/submission/:uuid" ?
        this.getProductNameBreadcrumb(productName, isTaskApprover) : null
        }

        <MuiBreadcrumbs separator={<NavigateNextIcon fontSize="inherit" />} aria-label="breadcrumb"/>
      </MuiBreadcrumbs>
    );
  }
}

export default withRouter(Breadcrumbs);
