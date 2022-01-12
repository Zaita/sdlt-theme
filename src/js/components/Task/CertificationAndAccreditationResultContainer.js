// @flow

import React, {Component} from "react";
import approveIcon from "../../../img/icons/approve.svg";
import notApprovedIcon from "../../../img/icons/not-approved.svg";
import awaitingApprovalIcon from "../../../img/icons/awaiting-approval.svg";
import inProgressIcon from "../../../img/icons/in-progress.svg";
import startIcon from "../../../img/icons/start.svg";
import TaskRecommendationContainer from "./TaskRecommendationContainer";

type Props = {
  resultForCertificationAndAccreditation: Array<*>
};

const prettifyStatus = (status: string) => {
  if (!status) {
    return;
  }
  return status
    .split("_")
    .map((str) => {
      return str.charAt(0).toUpperCase() + str.slice(1);
    })
    .join(" ");
};

class CertificationAndAccreditationResultContainer extends Component<Props> {

  componentDidMount() {
    const {
      organisationName,
      serviceName,
      createdAt,
      securityArchitectName,
      businessOwnerName,
      productName,
      productDescription,
      accreditationLevel,
      accreditationDescription,
      accreditationType,
      accreditationPeriod,
      accreditationRenewalRecommendations,
      classificationLevel,
      riskProfileData,
      tasks,
      taskRecommendations,
      reportLogo
    } = {...this.props.resultForCertificationAndAccreditation};
  }

  render() {
    const {
      organisationName,
      serviceName,
      createdAt,
      securityArchitectName,
      businessOwnerName,
      productName,
      productDescription,
      accreditationLevel,
      accreditationDescription,
      accreditationType,
      accreditationPeriod,
      accreditationRenewalRecommendations,
      classificationLevel,
      riskProfileData,
      tasks,
      taskRecommendations,
      reportLogo
    } = {...this.props.resultForCertificationAndAccreditation};

    return (
      <div className="certification-and-accreditation-report-container">

        <div className="about-report-container">
          <div className="report-heading">
            <div className="report-heading-left-container">
              <h3>{serviceName}</h3>
              <p className="certification-accreditation-memo-heading">
                Certification and Accreditation Memo for {organisationName}
              </p>
            </div>
            <div className="report-heading-right-container">
              {this.props.isDisplayReportLogo && (<img src={reportLogo}/>)}
            </div>
          </div>

          <div className="report-intro-container">
            <p className="report-intro">Prepared at {createdAt} by {securityArchitectName}</p>
            <p className="report-intro">Delivered to {businessOwnerName} as part of the {productName} delivery.</p>
          </div>
        </div>

        <div className="about-product-container sub-container">
          <h5>About {productName}</h5>
          <div
            dangerouslySetInnerHTML={{
              __html: productDescription
            }}
          >
          </div>
        </div>

        <div className="certificate-recommendation-container sub-container">
          <h5>Certification Recommendation</h5>
          <p className="intro-container">It has been recommended by {securityArchitectName} that
          this change {productName} be certified against {accreditationLevel} with an accreditation
          level of: {accreditationType} for a period of no longer than {accreditationPeriod}.</p>
          <p>Re-certification after this period should be conditional on the following
          post go-live remediations being resolved:</p>
          <div
            dangerouslySetInnerHTML={{
              __html: accreditationRenewalRecommendations
            }}
          >
          </div>
        </div>

        <div className="information-classification-container sub-container">
        <h5>Information Classification</h5>
        <p className="intro-container">This memo certifies {serviceName} has been endorsed to store, transmit
        and receive data to an Information Classification up to {classificationLevel}.</p>
        </div>

        <div className="certificate-scope-container sub-container">
          <h5>Certification Scope</h5>
          <p className="intro-container">
            This certification is a {accreditationLevel} level certification for {serviceName}.
            It covers {serviceName} and the following dependencies only.
          </p>
          <div
            className="certificate-scope-description"
            dangerouslySetInnerHTML={{
              __html: accreditationDescription
            }}
          >
          </div>
        </div>

        <div className="risk-profile-container sub-container">
          <h5>Risk Profile</h5>
          <p className="intro-container">After completing a risk assessment process,
          it was determined that the residual risk ratings for this delivery are:</p>
          {this.renderRiskProfile(riskProfileData)}
        </div>

        <div className="recommendation-container sub-container">
          <h5>Recommendations against {productName}</h5>
          {this.renderTaskRecommendation(taskRecommendations)}
        </div>

        <div className="task-container sub-container">
          <h5>Tasks Completed</h5>
          <p className="intro-container">
            The certification of {serviceName} for {productName} was
            completed after {organisationName} completed the following assurance activities:
          </p>
          {this.renderTaskTable(tasks)}
        </div>
      </div>
    );
  }

  renderRiskProfile(riskProfileDataStr) {
    if (!riskProfileDataStr || (typeof riskProfileDataStr == 'undefined')) {
      return;
    }

    const riskProfileData = JSON.parse(riskProfileDataStr);

    return (
      <div className="risk-container">
        {
          riskProfileData.isDisplayMessage && (<div className="alert alert-danger">{riskProfileData.message}</div>)
        }

        {
          !riskProfileData.isDisplayMessage && riskProfileData.hasProductAspects && Object.entries(riskProfileData.result).map((item, index) => {
            return (
              <div key={index}>
                <div className="product-aspect-container">{item[0]}</div>
                {this.renderRiskProfileTable(item[1])}
              </div>
            )
          })
        }

        {
          !riskProfileData.isDisplayMessage && !riskProfileData.hasProductAspects && this.renderRiskProfileTable(riskProfileData.result)
        }

      </div>
    );
  }

  renderRiskProfileTable(items) {
    if (!items || items.length == 0) {
      return "";
    }

    return(
      <div className="risk-profile-table-container">
        <table className="table">
          <thead className="">
            <tr key="risk_profile_table_header">
              <th>Risk category</th>
              <th>Current risk rating</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => {
              return(
                <tr key={index}>
                  <td>{item.riskName}</td>
                  <td style={{backgroundColor: item.currentRiskRating.colour}}>
                    {item.currentRiskRating.name}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    )
  }

  renderTaskRecommendation(taskRecommendations) {
    if (!taskRecommendations || (typeof taskRecommendations == 'undefined')) {
      return;
    }

    if (taskRecommendations.length == 0) {
      return (<div className="intro-container">No recommendation available.</div>);
    }

    return (
      <div>
        {taskRecommendations.map(({taskName, taskApproverName, taskRecommendationData}, index) => {
          return(
            <div key={index}>
              <p className="intro-container">Recommendations from: <b>{taskName}</b> by {taskApproverName}</p>
              {this.renderRecommendationTable(taskRecommendationData)}
            </div>
          )
        })}
      </div>
    );
  }

  renderRecommendationTable(taskRecommendationData) {
    const taskRecommendations = JSON.parse(taskRecommendationData);
    return(
      <div className="recommendation-table-container">
      {taskRecommendations && taskRecommendations.length > 0 && (
        <table className="table">
          <thead className="">
            <tr key="recommendation_table_header">
              <th className="issue-title-col">Issue title</th>
              <th>Issue description</th>
              <th>Recommendation</th>
            </tr>
          </thead>
          <tbody>
            {taskRecommendations.map((taskRecommendation, index): TaskRecommendation => {
              return (
                <tr key={index+1}>
                  <td>{taskRecommendation.title}</td>
                  <td>{taskRecommendation.description}</td>
                  <td>{taskRecommendation.recommendation}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
      </div>
    )
  }

  renderTaskTable(tasks) {
    if (!tasks || (typeof tasks == 'undefined')) {
      return;
    }

    return(
      <div className="task-table-container">
        <table className="table">
          <thead className="">
            <tr key="task_table_header">
              <th>Task</th>
              <th>Approved by</th>
              <th>Task status</th>
            </tr>
          </thead>
          <tbody>
          {
            tasks.map(({taskName, taskApproverName, taskStatus}, index) => {
              let statusIcon = startIcon;

              if (taskStatus == "in_progress") {
                statusIcon = inProgressIcon;
              }

              if (taskStatus == "waiting_for_approval") {
                statusIcon = awaitingApprovalIcon;
              }

              if (taskStatus == "approved" || taskStatus == "complete") {
                statusIcon = approveIcon;
              }

              if (taskStatus == "denied") {
                statusIcon = notApprovedIcon;
              }

              let approvedBy = taskApproverName;

              if (!approvedBy) {
                approvedBy = "No approval needed";
              }

              return (
                <tr key={index}>
                  <td className="">
                    {taskName}
                  </td>
                  <td>{approvedBy}</td>
                  <td>
                    <img className="task-status-icon" src={statusIcon} />
                    <span className="task-status"> {prettifyStatus(taskStatus)}</span>
                  </td>
                </tr>
              );
            })
          }
          </tbody>
        </table>
      </div>
    );
  }
}

export default CertificationAndAccreditationResultContainer;
