// @flow
import React, { Component } from "react";
import type { LikelihoodThreshold } from "../../types/Task";
import helpIcon from "../../../img/icons/help-outline.svg";
import HelpModalContainer from "./RiskAssessmentHelpModalContainer";

type Props = {
  calculatedSRAData: object,
  hasProductAspect: boolean
};

class RiskAssessmentTableContainer extends Component<Props> {
  /**
   * Render the security risk assessment matrix as an HTML table
   */
  renderTableHeader() {
    return (
      <tr key="risk_assessment_header">
        <th>Risk category</th>
        <th>
          Current risk rating &nbsp;
          <HelpModalContainer
            title="Current Risk Rating"
            helpText={this.props.riskRatingHelpText}
            riskRatingThresholds={this.props.riskRatingThresholds}
          />
        </th>
        <th>
          Likelihood score &nbsp;
          <img src={helpIcon} />
        </th>
        <th>
          Impact score &nbsp;
          <img src={helpIcon} />
        </th>
      </tr>
    );
  }

  renderTableBody() {
    return (
      <tr key="">
        <td>Information disclosure</td>
        <td>Critical</td>
        <td>Almost certain</td>
        <td>Extreme</td>
      </tr>
    );
  }

  render() {
    return (
      <div className="table-responsive table-continer">
        <table className="table">
          <thead className="">
            {this.renderTableHeader()}
          </thead>
          <tbody>
            {this.renderTableBody()}
          </tbody>
        </table>
      </div>
    );
  }
}

export default RiskAssessmentTableContainer;
