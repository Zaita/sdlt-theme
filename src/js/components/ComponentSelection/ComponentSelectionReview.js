// @flow

import React from "react";
import type {JiraTicket, SecurityComponent} from "../../types/SecurityComponent";
import SecurityRiskAssessmentUtil from "../../utils/SecurityRiskAssessmentUtil";
import ComponentSelectionUtil from "../../utils/ComponentSelectionUtil";

type Props = {
  selectedComponents: Array<SecurityComponent>,
  jiraTickets: Array<JiraTicket>,
  componentTarget: string,
  productAspects: Array<*>
};

export default class ComponentSelectionReview extends React.Component<Props> {

  render() {
    const {
      selectedComponents,
      jiraTickets,
      componentTarget,
      isSRATaskFinalised,
      productAspects,
      doneButton,
      backLink
    } = { ...this.props };

    const hasProductAspects = productAspects && productAspects.length > 0;

    return (
      <div className="ComponentSelectionReview">
        {isSRATaskFinalised ? SecurityRiskAssessmentUtil.getSraIsFinalisedAlert() : false}
        {backLink}
        <h4>Summary</h4>
        <div className="AnswersPreview">
          <div className="components">
            {hasProductAspects && productAspects.map((productAspect, index) => {
              let isComponentSelected =
                ComponentSelectionUtil.doescomponentExistForProductAspect(productAspect,selectedComponents);
              return (
                <div className="row" key={index}>
                  <div className="col">
                    <b>{index + 1}. Select control set for the {productAspect} component</b>
                  </div>
                  <div className="vertical-divider" />
                  <div className="col">
                    {!isComponentSelected && (
                      <span className="default-answer">Current Solution</span>
                    )}
                    {selectedComponents.map((component, index) => {
                      if (component.productAspect === productAspect) {
                        return (
                          <ul className="control-list" key={index}>
                            <li key={component.id + `_${productAspect}` + `_${component.name}`}>
                              <b>{component.name}</b>
                            </li>
                            <li key={component.id + `_${productAspect}` + `_${component.description}`}>
                              {component.description}
                            </li>
                          </ul>
                        );
                      }
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {(productAspects === undefined || productAspects === "" || productAspects.length === 0) &&
            <div className="components">
              <div className="row">
                <div className="col">
                  <b>1. Select control set for the Current Solution</b>
                </div>
                <div className="vertical-divider" />
                <div className="col">
                  {selectedComponents.length === 0 && (
                    <span className="default-answer">Current Solution</span>
                  )}
                  {selectedComponents.map((component, index) => {
                    return (
                      <ul className="control-list" key={index}>
                        <li key={component.id + `_${component.name}`}>
                          <b>{component.name}</b>
                        </li>
                        <li key={component.id + `${component.description}`}>
                          {component.description}
                        </li>
                      </ul>
                    )
                  })}
                </div>
              </div>
            </div>
          }
        </div>

        {componentTarget === "JIRA Cloud" && (
          <div className="components">
            <div className="row">
              <div className="col">
                <b>Created Jira Tickets</b>
              </div>
              <div className="vertical-divider" />
              <div className="col">
                <ul>
                  {jiraTickets.map((ticket: JiraTicket) => {
                    return (
                      <li key={ticket.id}><a href={ticket.link} target="_blank">{ticket.link}</a></li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>
        )}

        {doneButton && <div className="buttons">{doneButton}</div>}
      </div>
    );
  }
}
