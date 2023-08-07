import React, { Component } from "react";
import {
  Breadcrumbs as MuiBreadcrumbs,
  Link
} from "@mui/material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { withRouter } from "react-router-dom";
import URLUtil from "../../utils/URLUtil";

class Breadcrumbs extends Component {
  getApprovalsBreadcrumb = (showApprovalBreadcrumb) => {
    if (showApprovalBreadcrumb) {
      return (
        <Link onClick={() => URLUtil.redirectToApprovals()}>
          My approvals
        </Link>
      );
    } else {
      return (
        <Link onClick={() => URLUtil.redirectToSubmissions()}>
          My submissions
        </Link>
      );
    }
  }

  getProductNameBreadcrumb = (productName, isTaskApprover) => {
    if (!isTaskApprover) {
      return (
        <Link onClick={() => this.sendBackToQuestionnaireSummaryPage()}>
          {productName ? productName : "Product"}
        </Link>
      )
    }
  };

  getSraBreadcrumb = () => {
    return (
      <Link onClick={() => this.sendBackToSecurityRiskAssessment()}>
        {this.props.sraTaskName}
      </Link>
    )
  };

  getCvaBreadcrumb = () => {
    return (
      <Link onClick={() => this.sendBackToControlValidationAudit()}>
        {this.props.cvaTaskName}
      </Link>
    )
  };


  sendBackToQuestionnaireSummaryPage() {
    URLUtil.redirectToQuestionnaireSummary(this.props.questionnaireSubmissionUUID);
  }

  sendBackToSecurityRiskAssessment() {
    const {sraTaskSubmissionUUID, secureToken, component} = { ...this.props };
    URLUtil.redirectToSecurityRiskAssessment(sraTaskSubmissionUUID, secureToken, 'redirect', component)
  }

  sendBackToControlValidationAudit() {
    const {cvaTaskSubmissionUUID, secureToken, component} = { ...this.props };
    URLUtil.redirectToControlValidationAudit(cvaTaskSubmissionUUID, secureToken, 'redirect', component)
  }

  render() {
   const {
      match: { path },
      productName,
      showApprovalBreadcrumb,
      isTaskApprover
    } = this.props;

    return (
      <MuiBreadcrumbs separator={<NavigateNextIcon fontSize="inherit" />} aria-label="breadcrumb" color="inherit">
        <Link onClick={() => URLUtil.redirectToHome()}>Home</Link>

        {path == "/questionnaire/summary/:hash" ||
        path == "/task/submission/:uuid" ||
        path == "/security-risk-assessment/submission/:uuid" ||
        path == "/control-validation-audit/submission/:uuid" ||
        path == "/component-selection/submission/:uuid" ||
        path == "/control-detail-page/" ?
        this.getApprovalsBreadcrumb(showApprovalBreadcrumb) : null
        }

        {path == "/task/submission/:uuid" ||
        path == "/security-risk-assessment/submission/:uuid" ||
        path == "/control-validation-audit/submission/:uuid" ||
        path == "/component-selection/submission/:uuid" ||
        path == "/control-detail-page/" ?
        this.getProductNameBreadcrumb(productName, isTaskApprover) : null
        }

        {
          !this.props.comingFrom && (
            <MuiBreadcrumbs separator={<NavigateNextIcon fontSize="inherit" />} aria-label="breadcrumb"/>
          )
        }

        {
          this.props.comingFrom == "sra" && this.getSraBreadcrumb()
        }

        {
          this.props.comingFrom == "cva" && this.getCvaBreadcrumb()
        }
      </MuiBreadcrumbs>
    );
  }
}

export default withRouter(Breadcrumbs);
