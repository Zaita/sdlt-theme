// @flow
// this file is used on both Risk questionnaire and task
import React, {Component} from "react";
import type {RiskResult} from "../../types/Questionnaire";

type Props = {
  riskResults: Array<RiskResult> | null,
};

class RiskResultContainer extends Component<Props> {
  render() {
    const {riskResults} = {...this.props};

    if (!riskResults || riskResults.length === 0) {
      return null;
    }

    return (
      <div className="risk-result-container">
        <h4>Initial Risk Rating</h4>

        <div className="table-responsive table-continer">
          <table className="table">
            <thead className="">
              <tr key="risk_table_header">
                <th>Risk</th>
                <th>Initial Rating</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {riskResults.map((riskResult, index): RiskResult => {
                return (
                  <tr key={index+1}>
                    <td>
                      {riskResult.riskName}
                    </td>
                    <td style={{backgroundColor:'#' + riskResult.colour, width:'10%', color: '#000000'}}>
                      {riskResult.rating}
                    </td>
                    <td style={{width: '59%'}}>
                      {riskResult.description}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

export default RiskResultContainer;
