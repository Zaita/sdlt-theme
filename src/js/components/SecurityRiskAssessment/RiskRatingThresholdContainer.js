// @flow
import React, {Component} from "react";
import type {RiskRatingThreshold} from "../../types/Task";

type Props = {
  riskRatingThresholds: Array<RiskRatingThreshold> | null,
};

class RiskRatingThresholdContainer extends Component<Props> {
  render() {
    const {riskRatingThresholds} = {...this.props};

    if(!riskRatingThresholds || riskRatingThresholds.length === 0) {
      return null;
    }

    return (
      <div className="RiskRatingLegend">
        <span className="impact-heading">Impact</span>

        <div className="table-responsive help-modal-table-container">

          <table className="table table-sm">
            <thead>
              <tr key="risk_rating_legend_header">
              {
                riskRatingThresholds.tableHeader.map((headerText, index) => {
                  return (
                    <th key={index}>
                      {headerText}
                    </th>
                  )
                })
              }
              </tr>
            </thead>
            <tbody>
              {
                riskRatingThresholds.tableRows.map((row, rowIndex) => {
                  return (
                    <tr key={'row_' + rowIndex}>
                      {
                        row.map((column, columnIndex) => {
                          return(
                            <td
                              key={'column_'+columnIndex}
                              style={column.color ? {backgroundColor: column.color} : null}
                            >
                            {column.name}
                            </td>
                          )
                        })
                      }
                    </tr>
                  )
                })
              }
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

export default RiskRatingThresholdContainer;
