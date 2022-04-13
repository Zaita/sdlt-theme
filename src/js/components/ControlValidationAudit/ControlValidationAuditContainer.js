// @flow
import React, {Component} from "react";
import {connect} from "react-redux";
import type {RootState} from "../../store/RootState";
import {Dispatch} from "redux";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import {loadCurrentUser} from "../../actions/user";
import {
  updateControlValidationAuditData,
  loadControlValidationAudit,
  saveControlValidationAuditData,
  reSyncWithJira
} from "../../actions/controlValidationAudit";
import type {User} from "../../types/User";
import type {
  CVATaskSubmission,
  CVASelectedComponents
} from "../../types/ControlValidationAudit";
import URLUtil from "../../utils/URLUtil";
import LightButton from "../Button/LightButton";
import DarkButton from "../Button/DarkButton";
import {
  DEFAULT_CVA_CONTROLS_ANSWER_YES,
  DEFAULT_CVA_CONTROLS_ANSWER_NO,
  DEFAULT_CVA_CONTROLS_ANSWER_NOT_APPLICABLE,
  DEFAULT_CVA_CONTROLS_ANSWER_PLANNED,
  DEFAULT_NO_CONTROLS_MESSAGE,
  DEFAULT_CVA_UNFINISHED_TASKS_MESSAGE,
  CTL_STATUS_1,
  CTL_STATUS_2,
  CTL_STATUS_3,
  CTL_STATUS_4,
  EVALUTION_RATING_1,
  EVALUTION_RATING_2,
  EVALUTION_RATING_3,
  EVALUTION_RATING_4
} from '../../constants/values.js';
import SecurityRiskAssessmentUtil from "../../utils/SecurityRiskAssessmentUtil";
import {loadSiteConfig} from "../../actions/siteConfig";
import type {SiteConfig} from "../../types/SiteConfig";
import {SubmissionExpired} from "../Common/SubmissionExpired";
import {SubmissionNotCompleted} from "../Common/SubmissionNotCompleted";
import ControlInfo from "../ComponentSelection/ControlInfo";
import CSRFTokenService from "../../services/CSRFTokenService";
import ErrorUtil from "../../utils/ErrorUtil";

const mapStateToProps = (state: RootState) => {
  return {
    currentUser: state.currentUserState.user,
    controlValidationAuditData: state.controlValidationAuditState.controlValidationAuditData,
    cvaSelectedComponents: state.controlValidationAuditState.cvaSelectedComponents,
    siteConfig: state.siteConfigState.siteConfig
  };
};

const mapDispatchToProps = (dispatch: Dispatch, props: *) => {
  return {
    dispatchLoadDataAction: async (uuid: string, secureToken: string) => {
      await Promise.all([
        dispatch(loadControlValidationAudit({uuid, secureToken})),
        dispatch(loadCurrentUser()),
        dispatch(loadSiteConfig())
      ]);
    },
    // when user click on save button, save in the database
    dispatchSaveControlValidationAuditDataAction(
      uuid: string,
      controlData: object,
      questionnaireSubmissionUUID: string,
      secureToken: string, auto: boolean
    ) {
      dispatch(saveControlValidationAuditData(
        uuid,
        controlData,
        questionnaireSubmissionUUID,
        secureToken,
        auto)
      );
    },
    // this is used to update the selectedOptionDetail object
    // before clicking on save button
    dispatchUpdateControlValidationQuestionDataAction (selectedOptionDetail: object) {
      dispatch(updateControlValidationAuditData(selectedOptionDetail));
    },
    dispatchReSyncWithJira(uuid: string) {
      dispatch(reSyncWithJira(uuid));
    }
  };
};

type Props = {
  uuid: string,
  secureToken: string,
  component: string,
  currentUser?: User | null,
  controlValidationAuditData?: CVATaskSubmission | null,
  dispatchLoadDataAction?: (uuid: string, secureToken: string) => void,
  dispatchSaveControlValidationAuditDataAction?: () => void,
  dispatchUpdateControlValidationQuestionDataAction?: (selectedOptionDetail: object) => void,
  cvaSelectedComponents: CVASelectedComponents,
  dispatchReSyncWithJira?: (uuid: string) => void,
  siteConfig?: SiteConfig | null,
};

type State = {
  isCVATaskEditable: boolean,
  isSRATaskFinalised: boolean,
  canEdit: boolean
};

let autoSaveCVATask;
class ControlValidationAuditContainer extends Component<Props, State> {

  constructor(props) {
    super(props);
    this.state = {
      isCVATaskEditable: false,
      isSRATaskFinalised: false,
      canEdit: false
    }
  }

  async componentDidMount() {
    const {
      uuid,
      dispatchLoadDataAction,
      secureToken,
    } = {...this.props};

    await dispatchLoadDataAction(uuid, secureToken);

    /**
     * Save CVA task in every 10 mins so userInput will not get lost
     */
    try {
      const {
        controlValidationAuditData,
        currentUser
      } = {...this.props};

      const isSubmitter = controlValidationAuditData.submitterID === currentUser.id;
      const canEdit = (isSubmitter || controlValidationAuditData.isTaskCollborator);
      const isSRATaskFinalised = SecurityRiskAssessmentUtil.isSRATaskFinalised(controlValidationAuditData.siblingSubmissions);
      const isCVATaskEditable = (canEdit && !isSRATaskFinalised);

      this.setState({
        canEdit: canEdit,
        isSRATaskFinalised: isSRATaskFinalised,
        isCVATaskEditable: isCVATaskEditable
      });

      this.autoSaveCVATask = setInterval(
        async () => {
          if (isCVATaskEditable) {
            await this.callAutoSaveCvaTaskApi();
          }
        },
        600000
      );
    } catch(e) {
      ErrorUtil.displayError(error);
    }
  }

  /**
   * Clear Interval function when the user is leaving CVA task page
   */
  componentWillUnmount() {
    clearInterval(this.autoSaveCVATask);
  }


  /**
   * Call db save Api logic in every 10 mins
   */
  callAutoSaveCvaTaskApi() {
    const {
      uuid,
      secureToken,
      dispatchSaveControlValidationAuditDataAction,
      controlValidationAuditData,
      cvaSelectedComponents,
      currentUser
    } = {...this.props};

    dispatchSaveControlValidationAuditDataAction(
      uuid,
      cvaSelectedComponents,
      controlValidationAuditData.questionnaireSubmissionUUID,
      secureToken,
      true
    );
  }

  /**
   * Display a list of security component headlines with radio inputs for controls
   */
  renderCVAQuestionsForm() {
    const productAspects = this.props.controlValidationAuditData.productAspects;
    const selectedComponents = this.props.cvaSelectedComponents;
    const componentTarget =this.props.controlValidationAuditData.componentTarget;

    if (productAspects.length > 0 && selectedComponents.length > 0) {
      return (
        this.renderComponentGroupByProductAspect(productAspects, selectedComponents)
      );
    } else if (selectedComponents.length > 0) {
      return(
        <div>
          {
            selectedComponents.map((component) => {
              return (
                this.renderComponent(component)
              );
            })
          }
        </div>
      );
    }
    else {
      return(
        <div className="alert alert-warning" key="unfinished_cs_task_message">
          {DEFAULT_CVA_UNFINISHED_TASKS_MESSAGE}
        </div>
      );
    }
  }

  renderComponentGroupByProductAspect(productAspects, components) {
    return (
      <div>
      {
        productAspects.map((productAspect, productAspectIndex) => {
          const filterComponent = components.filter((component) => {
            return component.productAspect === productAspect;
          })

          if (filterComponent.length == 0) {
            return null;
          }

          return (
            <div className="mt-2" key={productAspectIndex} >
              <h4>{productAspect}</h4>
              {
                filterComponent.map((component) => {
                  return (
                    this.renderComponent(component)
                  );
                })
              }
            </div>
          )
        })
      }
      </div>
    );
  }

  renderComponent(component) {
    const componentKey = component.productAspect ? `${component.productAspect}_${component.id}`: component.id;
    const controls = component.controls;
    const link = component.jiraTicketLink ? (<a href={component.jiraTicketLink}>{component.jiraTicketLink}</a>) : null;

    return (
      <div key={componentKey}>
        <h5>
          {component.name}
          {link && this.props.controlValidationAuditData.componentTarget == "JIRA Cloud" && (<span> - {link}</span>)}
        </h5>
        {
          controls && controls.length > 0 && controls.map((control) => {
            return (this.renderControl(control, component));
          })
        }
        {
          !controls || controls.length == 0 && (
            <div className="alert alert-warning" key="no_controls_message">
              {DEFAULT_NO_CONTROLS_MESSAGE}
            </div>
          )
        }
      </div>
    );
  }

  renderControl(control, component) {
    const controlKey = component.productAspect ? `${component.productAspect}_${component.id}_${control.id}`: `${component.id}_${control.id}`;
    const componentTarget = this.props.controlValidationAuditData.componentTarget;

    if (componentTarget === "JIRA Cloud") {
      return this.renderRemoteControls(control, controlKey);
    } else {
      return this.renderLocalControl(control, controlKey, component);
    }
  }

  renderLocalControl(control, controlKey, component) {
    const options = [
      {'value': CTL_STATUS_1, 'label': DEFAULT_CVA_CONTROLS_ANSWER_YES},
      {'value':CTL_STATUS_2, 'label': DEFAULT_CVA_CONTROLS_ANSWER_NO},
      {'value':CTL_STATUS_3, 'label': DEFAULT_CVA_CONTROLS_ANSWER_NOT_APPLICABLE},
      {'value':CTL_STATUS_4, 'label': DEFAULT_CVA_CONTROLS_ANSWER_PLANNED}
    ];

    const evalution_rating_options = [
      {'value': EVALUTION_RATING_1, 'label': 'Not Validated'},
      {'value':EVALUTION_RATING_2, 'label': 'Not Effective'},
      {'value':EVALUTION_RATING_3, 'label': 'Partially Effective'},
      {'value':EVALUTION_RATING_4, 'label': 'Effective'}
    ];

    return(
      <div className="my-0 container row" key={controlKey}>

        <div className="col-xs-6">
          <div>
            {
              options.map((option, optionIndex) => {
                return (
                  <label key={`optionlabel_${controlKey}_${optionIndex}`}>
                    <input
                      type="radio"
                      key={`radiobutton_${controlKey}_${optionIndex}`}
                      name={controlKey}
                      value={option.value}
                      defaultChecked={control.selectedOption === option.value}
                      disabled={!this.state.isCVATaskEditable}
                      onClick={() => this.props.dispatchUpdateControlValidationQuestionDataAction({
                        "selectedOption": option.value,
                        "evalutionRating": control.evalutionRating,
                        "controlID":control.id,
                        "componentID":component.id,
                        "productAspect":component.productAspect,
                        "implementationEvidenceUserInput": control.implementationEvidenceUserInput
                    })}
                    />
                    {option.label}
                  </label>
                );
              })
            }
          </div>
          <div>
            {
              evalution_rating_options.map((option, optionIndex) => {
                return (
                  <label key={`evalution_rating_optionlabel_${controlKey}_${optionIndex}`}>
                    <input
                      type="radio"
                      key={`evalution_rating_radiobutton_${controlKey}_${optionIndex}`}
                      name={`evalution_rating_${controlKey}`}
                      value={option.value}
                      defaultChecked={control.evalutionRating === option.value}
                      disabled={!this.state.isCVATaskEditable}
                      onClick={() => this.props.dispatchUpdateControlValidationQuestionDataAction({
                        "selectedOption": control.selectedOption,
                        "evalutionRating": option.value,
                        "controlID":control.id,
                        "componentID":component.id,
                        "productAspect":component.productAspect,
                        "implementationEvidenceUserInput": control.implementationEvidenceUserInput
                    })}
                    />
                    {option.label}
                  </label>
                );
              })
            }
          </div>
        </div>

        <div className="col-7">
          <label key={control.id}>
            <strong>{control.name}</strong>
          </label>

          <ControlInfo
            key={`controlInfo_${control.id}`}
            id={control.id}
            name=''
            description={control.description}
            implementationGuidance={control.implementationGuidance}
            implementationEvidence={control.implementationEvidence}
            implementationEvidenceUserInput={control.implementationEvidenceUserInput}
            showImplementationEvidence={true}
            className="text-muted"
            isCVATaskEditable={this.state.isCVATaskEditable}
            updateEvidenceTextareaData={
              (value) => this.props.dispatchUpdateControlValidationQuestionDataAction({
                "selectedOption": control.selectedOption,
                "evalutionRating": control.evalutionRating,
                "controlID":control.id,
                "componentID":component.id,
                "productAspect":component.productAspect,
                "implementationEvidenceUserInput":value
              })
            }
          />

        </div>
      </div>
    );
  }

  renderRemoteControls(control, controlKey) {
    const className = (control.selectedOption).toLowerCase().replace(" ", "-");
    return(
      <div className="my-0" key={controlKey}>
        <label className="ml-2" key={control.id}>
          <span><strong>{control.name}</strong> - </span>
          <span className={className}>({control.selectedOption})</span>
        </label>
      </div>
    );
  }

  render() {
    const {
      siteConfig,
      currentUser,
      controlValidationAuditData,
      secureToken,
      dispatchSaveControlValidationAuditDataAction,
      cvaSelectedComponents,
      dispatchReSyncWithJira,
      component,
    } = {...this.props};
    if (!currentUser || !controlValidationAuditData || !siteConfig) {
      return null;
    }

    const submitButton = this.state.isCVATaskEditable && cvaSelectedComponents.length > 0 ? (
      <LightButton
      title="SUBMIT"
      onClick={() => dispatchSaveControlValidationAuditDataAction(
        controlValidationAuditData.uuid,
        cvaSelectedComponents,
        controlValidationAuditData.questionnaireSubmissionUUID,
        secureToken,
        false
      )}/>
    ): null;

    const backButton =  (
      <DarkButton
        title={"BACK TO QUESTIONNAIRE SUMMARY"}
        onClick={() => {
          URLUtil.redirectToQuestionnaireSummary(controlValidationAuditData.questionnaireSubmissionUUID, secureToken);
        }}
      />
    );

    const reSync = this.state.isCVATaskEditable && controlValidationAuditData.componentTarget == "JIRA Cloud" && cvaSelectedComponents.length > 0 ? (
      <DarkButton
        title={"RE SYNC WITH JIRA"}
        onClick={() => dispatchReSyncWithJira(controlValidationAuditData.uuid)}
      />
    ) : null;

    // used to display breadcrumbs
    let showSubmissionBreadcrumb = false;
    let showApprovalBreadcrumb = false;
    let isSubmitter = (controlValidationAuditData.submitterID === currentUser.id);

    if (isSubmitter || controlValidationAuditData.isTaskCollborator) {
      showSubmissionBreadcrumb = true;
    }

    if (!showSubmissionBreadcrumb) {
      if (currentUser.isSA ||
        currentUser.isCISO ||
        controlValidationAuditData.isBusinessOwner ||
        currentUser.isAccreditationAuthority ||
        currentUser.isCertificationAuthority) {
        showApprovalBreadcrumb = true;
      }
    }

    return (
      <div className="ControlValidationAuditContainer">
        <Header
          pageTitle={controlValidationAuditData.taskName}
          logopath={siteConfig.logoPath}
          productName={controlValidationAuditData.questionnaireSubmissionProductName}
          questionnaireSubmissionUUID={controlValidationAuditData.questionnaireSubmissionUUID}
          showSubmissionBreadcrumb={showSubmissionBreadcrumb}
          showApprovalBreadcrumb={showApprovalBreadcrumb}
          component={component}
        />

        {
          controlValidationAuditData.status === 'expired' && <SubmissionExpired/>
        }

        {
          controlValidationAuditData.status !== 'expired' && (
            <div className="ControlValidationAuditResult" key="0">
              <div className="ControlValidationAuditForm">
                <h3>Have These Controls Been Implemented?</h3>
                {
                  ['start','in_progress'].includes(controlValidationAuditData.status)
                  && !this.state.canEdit
                  && (
                        <SubmissionNotCompleted/>
                    )
                }
                {
                  (this.state.canEdit || controlValidationAuditData.status == "complete") &&
                  (
                    <div>
                      {this.state.isSRATaskFinalised ? SecurityRiskAssessmentUtil.getSraIsFinalisedAlert() : false}
                      {this.renderCVAQuestionsForm()}
                    </div>
                  )
                }
              </div>
              <div className="buttons" key="component_validation_buttons">
                <div>
                  {submitButton}
                  {reSync}
                  {backButton}
                </div>
              </div>
            </div>
          )
        }

        <Footer footerCopyrightText={siteConfig.footerCopyrightText}/>
      </div>
    )
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ControlValidationAuditContainer);
