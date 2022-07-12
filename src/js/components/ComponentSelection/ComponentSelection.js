// @flow

import React, {Component} from "react";
import type {SecurityComponent} from "../../types/SecurityComponent";
import LeftBar from "../LeftBar/LeftBar";
import LeftBarItem from "../LeftBar/LeftBarItem";
import toString from "lodash/toString";
import DarkButton from "../Button/DarkButton";
import LightButton from "../Button/LightButton";
import ComponentInfo from "./ComponentInfo";
import ComponentSelectionUtil from "../../utils/ComponentSelectionUtil";
import BackArrow from "../../../img/icons/back-arrow.svg";
import ChevronIcon from "../../../img/icons/chevron-right.svg";

type Props = {
  availableComponents: Array<SecurityComponent>,
  selectedComponents: Array<SecurityComponent>,
  componentTarget: taskSubmission.ComponentTarget,
  createJIRATickets: (jiraKey: string) => void,
  removeComponent: (id: string) => void,
  addComponent: (id: string) => void,
  saveControls: () => void,
  isStandaloneTask: boolean,
  productAspects: Array<*>,
  questionnaireSubmissionUUID: string
};

type State = {
  jiraKey: string,
  selectedProductAspect: string
};

export default class ComponentSelection extends Component<Props, State> {

  constructor(props: *) {
    super(props);
    this.state = {
      jiraKey: "",
      selectedProductAspect:
        (props.productAspects && props.productAspects.length) ? props.productAspects[0] : ""
    };
  }

  updateSelectedProductAspect = selectedProductAspect => {
    this.setState({ selectedProductAspect: selectedProductAspect })
  }

  render() {
    const {
      availableComponents,
      selectedComponents,
      createJIRATickets,
      removeComponent,
      addComponent,
      saveControls,
      componentTarget,
      productAspects,
      isStandaloneTask,
      controlSetSelectionTaskHelpText,
      updateIsLastComponentSelectionCompleted,
      backLink
    } = {...this.props};

    const { jiraKey,selectedProductAspect } = {...this.state};

    const updateSelectedComponents = event => {
      if (event.target.checked) {
        selectedComponents.map((c)=>removeComponent(c.id, selectedProductAspect))
        addComponent(event.target.value, selectedProductAspect);
      } else {
        removeComponent(event.target.value, selectedProductAspect);
      }
    }

    return (
      <div className="ComponentSelection">
        {backLink}
        <div className="title">Components</div>
        <div className="main-wrapper">
          <LeftBar
            key={this.state.selectedProductAspect}
            selectedComponents={selectedComponents}
            availableComponents={availableComponents}
            title={"Available Components"}
            removeComponent={removeComponent}
            addComponent={addComponent}
            productAspects={productAspects}
            selectedProductAspect={this.state.selectedProductAspect}
            componentTarget={componentTarget}
            updateSelectedProductAspect={this.updateSelectedProductAspect}>
          </LeftBar>

          <div className="main-content">
            <div className="heading">
              {selectedProductAspect
                ? productAspects.indexOf(selectedProductAspect) + 1 +
                  ". Select control set for the " + selectedProductAspect + " component"
                : "1. Select control set for the Current Solution"}
            </div>
            <p className="help-text">
              {controlSetSelectionTaskHelpText}
            </p>
            <div className="selected-components">
              <table className="table">
                <thead>
                  <tr>
                    <th></th>
                    <th>Control set</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {availableComponents.map((component, key) => {
                    const checked = selectedComponents.filter((selectedComponent) => {
                      return (
                        selectedComponent.id === component.id &&
                        selectedComponent.productAspect === selectedProductAspect
                      );
                    }).length > 0;

                    return (
                      <tr key={key}>
                        <td>
                          <input
                            name="aspect"
                            value={component.id}
                            type="radio"
                            checked={checked}
                            onChange={updateSelectedComponents}
                          />
                        </td>
                        <td className="td-component-name">{component.name}</td>
                        <td className="td-component-description">{component.description}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="save-components-container">
              <p className="save-message">
                {selectedProductAspect
                  ? "Note: Your selection will be saved when you continue to the next component."
                  : "Note: Your selection will be saved when you continue."
                }
              </p>

              <div className="buttons-wrapper">
                {selectedComponents.length > 0 && componentTarget === "JIRA Cloud" && (
                  <React.Fragment>
                    <input
                      type="text"
                      style={{ height: "100%", marginRight: "10px" }}
                      placeholder="JIRA Project Key"
                      onChange={(event) => {
                        const value = toString(event.target.value).trim();
                        this.setState({ jiraKey: value });
                      }}
                    />
                    <DarkButton
                      title="CREATE JIRA TICKETS"
                      classes={["mr-3"]}
                      onClick={() => {
                        createJIRATickets(jiraKey);
                      }}
                    />
                  </React.Fragment>
                )}
                {selectedProductAspect &&
                  productAspects.indexOf(selectedProductAspect) < productAspects.length - 1 && (
                  <DarkButton
                    title="Next"
                    rightIconImage={ChevronIcon}
                    onClick={() => {
                      this.setState({
                        selectedProductAspect:
                          productAspects[productAspects.indexOf(selectedProductAspect) + 1],
                      });
                      saveControls();
                      updateIsLastComponentSelectionCompleted(false)
                    }}
                  />
                )}
                {selectedProductAspect &&
                  productAspects.indexOf(selectedProductAspect) === productAspects.length - 1 && (
                  <DarkButton
                    title="Next"
                    rightIconImage={ChevronIcon}
                    onClick={() => {
                      saveControls();
                      updateIsLastComponentSelectionCompleted(true)
                    }}
                  />
                )}
                {(productAspects === undefined || productAspects === "" || productAspects.length === 0) && (
                  <DarkButton
                    title="Submit"
                    rightIconImage={ChevronIcon}
                    onClick={() => {
                      saveControls();
                      updateIsLastComponentSelectionCompleted(true)
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
