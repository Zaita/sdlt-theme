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
import URLUtil from "../../utils/URLUtil";

type Props = {
  availableComponents: Array<SecurityComponent>,
  selectedComponents: Array<SecurityComponent>,
  componentTarget: taskSubmission.ComponentTarget,
  createJIRATickets: (jiraKey: string) => void,
  removeComponent: (id: string) => void,
  addComponent: (id: string) => void,
  finishWithSelection: () => void,
  saveControls: () => void,
  extraButtons?: *,
  isStandaloneTask: boolean,
  productAspects: Array<*>,
  questionnaireSubmissionUUID: string
};

type State = {
  jiraKey: string
};

export default class ComponentSelection extends Component<Props, State> {

  constructor(props: *) {
    super(props);
    this.state = {
      jiraKey: ""
    };
  }

  sendBackToQestionnaire() {
    URLUtil.redirectToQuestionnaireSummary(this.props.questionnaireSubmissionUUID, this.props.secureToken)
  }

  render() {
    const {
      availableComponents,
      selectedComponents,
      createJIRATickets,
      removeComponent,
      addComponent,
      finishWithSelection,
      saveControls,
      extraButtons,
      componentTarget,
      productAspects,
      isStandaloneTask
    } = {...this.props};
    const {jiraKey} = {...this.state};
    const isGroupbyProductAspect = productAspects && productAspects.length > 0 && selectedComponents.length > 0;

    const backLink = <div className="back-link" onClick={() => this.sendBackToQestionnaire()}>
      <img src={BackArrow}/>
      Back
    </div>;

    return (
      <div className="ComponentSelection">
        {backLink}
        <div className="title">Components</div>
        <div className="main-wrapper">
          <LeftBar
            selectedComponents={selectedComponents}
            availableComponents={availableComponents}
            title={"Available Components"}
            removeComponent={removeComponent}
            addComponent={addComponent}
            productAspects={productAspects}
            componentTarget={componentTarget}
          >
          </LeftBar>

          <div className="main-content">
            <div className="heading">
              Selected Components
            </div>
            <div className="selected-components">
              {isGroupbyProductAspect > 0 && productAspects.map ((productAspect, index) => {
                return (
                  <div key={index}>
                    {ComponentSelectionUtil.doescomponentExistForProductAspect(productAspect, selectedComponents) &&
                      <h4 key={index}>{productAspect}</h4>
                    }
                    {selectedComponents.map((component, index) => {
                      const isDisable = component.hasOwnProperty('isSaved') && component.isSaved && componentTarget == "JIRA Cloud";
                      if (component.productAspect === productAspect) {
                        return (
                          <ComponentInfo
                            key={component.id + (component.productAspect ? `_${component.productAspect}`: "")}
                            id={component.id}
                            name={component.name}
                            description={component.description}
                            removeComponent={() => {
                              removeComponent(component.id, component.productAspect);
                            }}
                            childControls={component.controls}
                            isDisable={isDisable}
                          />
                        );
                      }
                    })}
                  </div>
                );
              })}

              {(productAspects === undefined || productAspects === ''|| productAspects.length === 0 ) && selectedComponents.map((component, index) => {
                const isDisable = component.hasOwnProperty('isSaved') && component.isSaved && componentTarget == "JIRA Cloud";
                return (
                  <ComponentInfo
                    key={component.id}
                    id={component.id}
                    name={component.name }
                    description={component.description}
                    removeComponent={() => {
                      removeComponent(component.id, component.productAspect);
                    }}
                    childControls={component.controls}
                    isDisable={isDisable}
                  />
                );
              })}
            </div>
          </div>
        </div>

        <div className="buttons-wrapper">
           <div className="extra-buttons">{extraButtons}</div>
           <div>
             {selectedComponents.length > 0 && componentTarget === "JIRA Cloud" && (
               <React.Fragment>
                 <input
                   type="text"
                   style={{height: "100%", marginRight: "10px"}}
                   placeholder="JIRA Project Key"
                   onChange={event => {
                     const value = toString(event.target.value).trim();
                     this.setState({jiraKey: value});
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
             {componentTarget === "Local" && !isStandaloneTask && (
               <LightButton
                 title="SAVE CONTROLS"
                 classes={["mr-3"]}
                 onClick={() => {
                   saveControls();
                 }}
               />
             )}
             <LightButton
               title="COMPLETE WITHOUT SELECTION"
               classes={["mr-3"]}
               onClick={() => {
                 finishWithSelection();
               }}
             />
           </div>
         </div>
       </div>
     );
   }
 }
