// @flow
import React, { Component } from "react";
import type { LikelihoodThreshold } from "../../types/Task";
import helpIcon from "../../../img/icons/help-outline.svg";
import HelpModalContainer from "./RiskAssessmentHelpModalContainer";

type Props = {
  sraData: object,
  impactScoreThresholds: object,
  impactScoreHelpText: string,
  riskRatingHelpText: string,
  likelihoodScoreHelpText: string,
  likelihoodRatingThresholds: object,
  riskRatingThresholds: object
};

class RiskAssessmentTableContainer extends Component<Props> {
  /**
   * Render the security risk assessment matrix as an HTML table
   */
  renderTableHeader() {

    const {
      sraData,
      impactScoreThresholds,
      impactScoreHelpText,
      riskRatingHelpText,
      likelihoodScoreHelpText,
      likelihoodRatingThresholds,
      riskRatingThresholds
    } = {...this.props};

    return (
      <tr key="risk_assessment_header">
        <th>Risk category</th>
        <th>
          Current risk rating &nbsp;
          <HelpModalContainer
            title="Current Risk Rating"
            helpText={riskRatingHelpText}
            riskRatingThresholds={riskRatingThresholds}
          />
        </th>
        <th className="td-padding-left">
          Likelihood score &nbsp;
          <HelpModalContainer
            title="Likelihood score"
            helpText={likelihoodScoreHelpText}
            likelihoodScoreThresholds={likelihoodRatingThresholds}
          />
        </th>
        <th>
          Impact score &nbsp;
          <HelpModalContainer
            title="Impact score"
            helpText={impactScoreHelpText}
            impactScoreThresholds={impactScoreThresholds}
          />
        </th>
      </tr>
    );
  }

  renderTableBody() {
    const {
      sraData
    } = {...this.props};

    return (
      sraData.map((risk, index) =>{
        return (
          <tr key={index}>
            <td>{risk.riskName}</td>
            <td style={{
              backgroundColor:risk.riskDetail.currentRiskRating.colour,
            }}>
              {risk.riskDetail.currentRiskRating.name}
            </td>
            <td className="td-padding-left">
              <span className="ellipse" style={{
                backgroundColor:risk.riskDetail.currentLikelihood.colour
              }}></span>
              <span className="threshold-name">
                {risk.riskDetail.currentLikelihood.name}
              </span>
              <span>
                <b>{risk.riskDetail.currentLikelihood.score}</b> / {risk.riskDetail.MaxLikelihoodPenalty}
              </span>
              {
                risk.differenceBetweenLikelihoodScore > 0 && (
                  <span className="score-difference positive-red">
                    + {risk.differenceBetweenLikelihoodScore}
                  </span>
                )
              }
              {
                risk.differenceBetweenLikelihoodScore < 0 && (
                  <span className="score-difference negative-green">
                    - {risk.differenceBetweenLikelihoodScore * -1}
                  </span>
                )
              }
            </td>
            <td>
              <span className="ellipse" style={{
                backgroundColor:risk.riskDetail.currentImpact.colour
              }}></span>
              <span  className="threshold-name">{risk.riskDetail.currentImpact.name}</span>
              <span>
                <b>{risk.riskDetail.currentImpact.score}</b> / {risk.riskDetail.MaxImpactPenalty}
              </span>
              {
                risk.differenceBetweenImapctScore > 0 && (
                  <span className="score-difference positive-red">
                    + {risk.differenceBetweenImapctScore}
                  </span>
                )
              }
              {
                risk.differenceBetweenImapctScore < 0 && (
                  <span className="score-difference negative-green">
                    - {risk.differenceBetweenImapctScore * -1}
                  </span>
                )
              }
            </td>
          </tr>
        )
      })
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
