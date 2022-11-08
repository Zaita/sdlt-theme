// @flow
import React, {Component} from "react";
import type {AnswerAction, AnswerInput, Question} from "../../types/Questionnaire";
import _ from "lodash";
import {Field, Form, Formik, FormikBag} from "formik";
import LightButton from "../Button/LightButton";
import DarkButton from "../Button/DarkButton";
import moment from "moment";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import InfoIcon from "../../../img/icons/info.svg";
import ChevronIcon from "../../../img/icons/chevron-right.svg";
import tinymce from "tinymce";
import 'tinymce/themes/modern';
import { Editor } from "@tinymce/tinymce-react";
import 'tinymce/plugins/advlist';
import 'tinymce/plugins/lists';
import Select from 'react-select';
import CertificationAndAccreditationResultContainer from "../Task/CertificationAndAccreditationResultContainer";
import InfoSVG from "@material-ui/icons/InfoOutlined";

type Props = {
  question: Question,
  index: number,
  questionnaireTitle: string,
  taskSubmissionTaskType: string,
  handleFormSubmit: (formik: FormikBag, values: Object) => void,
  handleActionClick: (action: AnswerAction) => void,
  handleTaskSaveDraftButtonClick: () => void,
  handleNextButtonClickForDisplayField: () => void,
  loadResultForCertificationAndAccreditation: () => void,
  serviceRegister: Array<*>,
  informationClassificationTaskResult: string,
  riskProfileData: Array<*>,
  resultForCertificationAndAccreditation: Array<*>
};

class QuestionForm extends Component<Props> {
  componentDidMount() {
    if (this.props.question.title == "Review") {
      this.props.loadResultForCertificationAndAccreditation();
    }
  }

  render() {
    const { question, index } = { ...this.props };

    const questionFormClass = () =>
      this.isInitialRiskAssessmentInformation()
        ? "QuestionForm initial-risk-impact-assessment"
        : "QuestionForm";

    return (
      <>
        <div className={questionFormClass()}>
          {this.renderInitialRiskImpactAssessmentInformation(question, index)}
          {this.renderDefaultQuestionForm(question, index)}
          {this.renderActions(question)}
          {this.renderInputsForm(question)}
          {this.renderDisplayField(question)}
        </div>
        <>{this.renderInitialRiskImpactAssessmentAction(question)}</>
      </>
    );
  }

  isInitialRiskAssessmentInformation = () => {
    const { taskSubmissionTaskType } = { ...this.props };
    return taskSubmissionTaskType == "risk questionnaire" ? true : false;
  };

  renderDefaultQuestionForm(question: Question, index: number) {
    if (this.isInitialRiskAssessmentInformation()) {
      return;
    }

    return (
      <>
        <div className="heading">
          {index + 1}. {question.heading}
        </div>
        <div
          className="description"
          dangerouslySetInnerHTML={{
            __html: question.description,
          }}
        ></div>
      </>
    );
  }

  renderInitialRiskImpactAssessmentInformation(question: Question, index: number) {
    if (!this.isInitialRiskAssessmentInformation()) {
      return;
    }

    return (
      <>
        {index !== 0 && (
        <div className="heading">
          {index + 1}. {question.heading}
        </div>
        )}
          <div
            className="key-info"
            dangerouslySetInnerHTML={{
              __html: question.description,
            }}
          />
      </>
    );
  }

  renderInitialRiskImpactAssessmentAction(question: Question) {
    const { handleActionClick, questionnaireTitle } = { ...this.props };

    if (!this.isInitialRiskAssessmentInformation()) {
      return;
    }

    const actions: Array<AnswerAction> = _.get(question, "actions", null);
    if (!actions) {
      return null;
    }

    return (
      <div className="information actions">
        {actions.map((action) => {
          return (
            <DarkButton
              className="start-button"
              key={action.id}
              title="Start"
              rightIconImage={ChevronIcon}
              onClick={() => handleActionClick(action)}
            />
          );
        })}
      </div>
    );
  }

  renderDisplayField(question: Question) {
    if (question.type !== "display") {
      return;
    }

    if (question.title == "Risk Profile") {
      return this.renderRiskProfile();
    }

    if (question.title == "Review") {
      return this.renderReview();
    }
  }

  renderReview() {
    const {
      resultForCertificationAndAccreditation,
      handleTaskSaveDraftButtonClick,
      handleNextButtonClickForDisplayField,
    } = { ...this.props };

    return (
      <div>
        <div className="review-container">
          <CertificationAndAccreditationResultContainer
            resultForCertificationAndAccreditation={
              resultForCertificationAndAccreditation
            }
            isDisplayReportLogo={false}
          />
        </div>
        <div className="buttons review-button-container">
          <div className="buttons-left"></div>
          <div className="buttons-right">
            <LightButton
              title="Save draft"
              onClick={() => {
                handleTaskSaveDraftButtonClick();
              }}
            />
            <DarkButton
              title="Submit"
              onClick={() => {
                handleNextButtonClickForDisplayField();
              }}
            />
          </div>
          <div />
        </div>
      </div>
    );
  }

  renderRiskProfile() {
    const { riskProfileData, handleNextButtonClickForDisplayField } = {
      ...this.props,
    };

    return (
      <div className="risk-profile-container">
        {riskProfileData.isDisplayMessage && (
          <div className="alert alert-danger">{riskProfileData.message}</div>
        )}

        {!riskProfileData.isDisplayMessage &&
          riskProfileData.hasProductAspects &&
          Object.entries(riskProfileData.result).map((item, index) => {
            return (
              <div key={index}>
                <div className="product-aspect-container">{item[0]}</div>
                {this.renderRiskProfileTable(item[1])}
              </div>
            );
          })}

        {!riskProfileData.isDisplayMessage &&
          !riskProfileData.hasProductAspects &&
          this.renderRiskProfileTable(riskProfileData.result)}

        <div className="bottom-container">
          <div className="message-container">
            <span>
              <InfoSVG/>
              <span className="saveMessage">
                Your answers will be saved when you continue to the next
                question.
              </span>
            </span>
          </div>

          <div className="button-container">
            <DarkButton
              title="Next"
              rightIconImage={ChevronIcon}
              onClick={() => {
                handleNextButtonClickForDisplayField();
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  renderRiskProfileTable(items) {
    return (
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
              return (
                <tr key={index}>
                  <td>{item.riskName}</td>
                  <td
                    style={{ backgroundColor: item.currentRiskRating.colour }}
                  >
                    {item.currentRiskRating.name}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  renderActions(question: Question) {
    const { handleActionClick } = { ...this.props };

    if (this.isInitialRiskAssessmentInformation()) {
      return;
    }

    if (question.type !== "action") {
      return;
    }

    const actions: Array<AnswerAction> = _.get(question, "actions", null);
    if (!actions) {
      return null;
    }

    // Render message of the chosen action
    let message = null;
    const chosenAction = actions.find((action) => action.isChose);
    if (chosenAction && chosenAction.message) {
      message = (
        <div className="action-message">
          <b>Message:</b>
          <div dangerouslySetInnerHTML={{ __html: chosenAction.message }} />
        </div>
      );
    }

    if (!chosenAction) {
      return (
        <div className="field-container">
          <div className="actions">
            {actions.map((action, index) => {
              switch (index) {
                case 0:
                  return (
                    <DarkButton
                      title={action.label}
                      key={action.id}
                      classes={["mr-3"]}
                      onClick={() => {
                        handleActionClick(action);
                      }}
                    />
                  );
                default:
                  return (
                    <LightButton
                      title={action.label}
                      key={action.id}
                      classes={["mr-3"]}
                      onClick={() => {
                        handleActionClick(action);
                      }}
                    />
                  );
              }
            })}
          </div>
          {message}
          <div className="bottom-container">
            <div className="message-container">
              <span>
                <InfoSVG/>
                <span className="saveMessage">
                  Your answers will be saved when you continue to the next
                  question.
                </span>
              </span>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="field-container">
          <div className="actions">
            {actions.map((action) => {
              switch (action.isChose) {
                case true:
                  return (
                    <DarkButton
                      title={action.label}
                      key={action.id}
                      classes={["mr-3"]}
                      onClick={() => {
                        handleActionClick(action);
                      }}
                    />
                  );
                default:
                  return (
                    <LightButton
                      title={action.label}
                      key={action.id}
                      classes={["mr-3"]}
                      onClick={() => {
                        handleActionClick(action);
                      }}
                    />
                  );
              }
            })}
          </div>
          {message}
          <div className="bottom-container">
            <div className="message-container">
              <span>
                <InfoSVG/>
                <span className="saveMessage">
                  Your answers will be saved when you continue to the next
                  question.
                </span>
              </span>
            </div>
          </div>
        </div>
      );
    }
  }

  renderInputsForm(question: Question) {
    const {
      handleFormSubmit,
      serviceRegister,
      informationClassificationTaskResult,
    } = { ...this.props };

    if (question.type !== "input") {
      return;
    }

    const inputs: Array<AnswerInput> = _.get(question, "inputs", null);
    if (!inputs) {
      return null;
    }

    const initialValues = {};
    inputs.forEach((input) => {
      initialValues[input.id] = input.data || "";

      // set radio button default value
      if (
        input.type == "radio" &&
        input.data === null &&
        input.defaultRadioButtonValue
      ) {
        initialValues[input.id] = input.defaultRadioButtonValue;
      }

      // set checkbox default value
      if (
        input.type == "checkbox" &&
        input.data === null &&
        input.defaultCheckboxValue
      ) {
        initialValues[input.id] = input.defaultCheckboxValue;
      }

      // set default value for information classification dropdown
      if (
        input.type == "information classification" &&
        input.data === null &&
        informationClassificationTaskResult
      ) {
        initialValues[input.id] = informationClassificationTaskResult;
      }
    });

    return (
      <Formik
        initialValues={initialValues}
        validate={(values) => {
          let errors = {};
          inputs.forEach((input: AnswerInput) => {
            const { id, type, required, label, minLength } = { ...input };
            const value = _.get(values, id, null);
            const fieldLabel = label ? label : "field";

            // Required
            if (required && (!value || value === "[]")) {
              errors[id] = `Please enter a value for ${fieldLabel}`;

              if (
                type === "radio" ||
                type === "checkbox" ||
                type === "service register"
              ) {
                errors[id] = `Please select an option for ${fieldLabel}`;
              }
              return;
            }

            // Min Length
            if (minLength > 0 && value && value.length < minLength) {
              errors[
                id
              ] = `Please enter a value with at least ${minLength} characters for ${fieldLabel}`;
              return;
            }

            // Email
            if (
              type === "email" &&
              !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)
            ) {
              errors[id] = "Invalid email address";
              return;
            }

            // Date validation
            if (type === "date" || type === "release date") {
              const date = moment(value, "YYYY-MM-DD");

              if (!date.isValid()) {
                errors[id] = "Invalid date";
              }
            }

            if (
              type === "product aspects" &&
              value &&
              !/^[0-9a-zA-Z\s\n]+$/i.test(value)
            ) {
              errors[id] = "Please enter alpha-numeric characters only.";
              return;
            }
          });

          return errors;
        }}
        onSubmit={(values, formik) => {
          handleFormSubmit(formik, values);
        }}
      >
        {({
          handleChange,
          isSubmitting,
          errors,
          touched,
          setFieldValue,
          values,
        }) => {
          const filteredErrors = [];
          _.keys(errors)
            .filter((key) => {
              return Boolean(touched[key]);
            })
            .forEach((key) => {
              filteredErrors[key] = errors[key];
            });

          return (
            <Form className="scroller">
              {inputs.map((input) => {
                const {
                  id,
                  type,
                  label,
                  placeholder,
                  options,
                  defaultRadioButtonValue,
                  defaultCheckboxValue,
                  maxLength,
                  required,
                } = { ...input };

                const errorMessage = _.get(filteredErrors, id, null);
                const hasError = Boolean(errorMessage);
                const classes = [];
                if (hasError) {
                  classes.push("error");
                }

                if (["text", "email", "url"].includes(type)) {
                  return (
                    <div key={id} className="field-container">
                      <div className="label">
                        <label className={required > 0 ? "required" : ""}>
                          {label}
                        </label>
                      </div>
                      <div>
                        <Field
                          type={type}
                          name={id}
                          className={classes.join(" ")}
                          placeholder={placeholder}
                          maxLength={maxLength > 0 ? maxLength : 4096}
                        />
                      </div>
                      {hasError && (
                        <div
                          className="error-message-container"
                          key={"error_" + id}
                        >
                          <i className="fas fa-exclamation-circle text-danger ml-1 error-icon" />
                          <span className="error-message">{errorMessage}</span>
                        </div>
                      )}
                    </div>
                  );
                }

                if (type === "radio") {
                  return (
                    <div key={id} className="field-container">
                      <div className="label">
                        <label className={required > 0 ? "required" : ""}>
                          {label}
                        </label>
                      </div>
                      <div
                        className={
                          hasError
                            ? "radio-container-error radio-container"
                            : "radio-container"
                        }
                      >
                        {options.length &&
                          options.map((option, index) => {
                            let checked =
                              _.toString(option.value) ===
                              _.toString(values[id]);
                            return (
                              <div
                                key={index}
                                className={
                                  label === "Accreditation level"
                                    ? "accreditation-level-option radio-option"
                                    : "radio-option"
                                }
                              >
                                <label className="radio-label">
                                  <Field
                                    type="radio"
                                    name={id}
                                    value={option.value}
                                    className={"radio"}
                                    checked={checked}
                                  />
                                  {option.label}
                                </label>
                              </div>
                            );
                          })}
                      </div>
                      {hasError && (
                        <div
                          className="error-message-container"
                          key={"error_" + id}
                        >
                          <i className="fas fa-exclamation-circle text-danger ml-1 error-icon" />
                          <span className="error-message">{errorMessage}</span>
                        </div>
                      )}
                    </div>
                  );
                }

                if (type === "checkbox") {
                  return (
                    <div key={id} className="field-container">
                      <div className="label">
                        <label className={required > 0 ? "required" : ""}>
                          {label}
                        </label>
                      </div>
                      <div
                        className={
                          hasError
                            ? "checkbox-container-error checkbox-container"
                            : "checkbox-container"
                        }
                      >
                        {options.length &&
                          options.map((option, index) => {
                            let groupCheckboxValueArr = values[id]
                              ? JSON.parse(values[id])
                              : [];
                            const checked = groupCheckboxValueArr.includes(
                              option.value
                            );

                            return (
                              <div key={index}>
                                <label className="checkbox-label">
                                  <input
                                    type="checkbox"
                                    name={id}
                                    className={"checkbox"}
                                    checked={checked}
                                    onChange={(event) => {
                                      if (event.target.checked) {
                                        groupCheckboxValueArr.push(
                                          option.value
                                        );
                                      } else {
                                        groupCheckboxValueArr.splice(
                                          groupCheckboxValueArr.indexOf(
                                            option.value
                                          ),
                                          1
                                        );
                                      }
                                      setFieldValue(
                                        id,
                                        JSON.stringify(groupCheckboxValueArr)
                                      );
                                    }}
                                  />
                                  {option.label}
                                </label>
                              </div>
                            );
                          })}
                      </div>
                      {hasError && (
                        <div
                          className="error-message-container"
                          key={"error_" + id}
                        >
                          <i className="fas fa-exclamation-circle text-danger ml-1 error-icon" />
                          <span className="error-message">{errorMessage}</span>
                        </div>
                      )}
                    </div>
                  );
                }

                if (type === "date" || type === "release date") {
                  return (
                    <div key={id} className="field-container">
                      <div className="label">
                        <label className={required > 0 ? "required" : ""}>
                          {label}
                        </label>
                      </div>
                      <div>
                        <Field name={id}>
                          {({ field }) => {
                            let date = null;
                            const dateValue = field.value || null;
                            if (dateValue && dateValue.trim().length > 0) {
                              date = moment(dateValue).toDate();
                            }

                            return (
                              <DatePicker
                                dateFormat="dd-MM-yyyy"
                                className={classes.join(" ")}
                                selected={date}
                                onChange={(value) => {
                                  if (!value) {
                                    setFieldValue(id, null);
                                    return;
                                  }
                                  const date =
                                    moment(value).format("YYYY-MM-DD");
                                  setFieldValue(id, date);
                                }}
                                placeholderText={placeholder}
                                dropdownMode="scroll"
                                withPortal
                              />
                            );
                          }}
                        </Field>
                      </div>
                      {hasError && (
                        <div
                          className="error-message-container"
                          key={"error_" + id}
                        >
                          <i className="fas fa-exclamation-circle text-danger ml-1 error-icon" />
                          <span className="error-message">{errorMessage}</span>
                        </div>
                      )}
                    </div>
                  );
                }

                if (type === "textarea" || type === "product aspects") {
                  return (
                    <div key={id} className="field-container">
                      <div className="label">
                        <label className={required > 0 ? "required" : ""}>
                          {label}
                        </label>
                      </div>
                      <div>
                        <Field name={id}>
                          {({ field }) => {
                            return (
                              <textarea
                                {...field}
                                className={classes.join(" ")}
                                placeholder={placeholder}
                              />
                            );
                          }}
                        </Field>
                        {hasError && (
                          <div
                            className="error-message-container"
                            key={"error_" + id}
                          >
                            <i className="fas fa-exclamation-circle text-danger ml-1 error-icon" />
                            <span className="error-message">
                              {errorMessage}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }

                if (type === "rich text editor") {
                  return (
                    <div key={id} className="field-container">
                      {label && (
                        <div className="label">
                          <label className={required > 0 ? "required" : ""}>
                            {label}
                          </label>
                        </div>
                      )}

                      <div>
                        <Editor
                          className="implementation-evidence"
                          initialValue={initialValues[id]}
                          init={{
                            selector: "textarea",
                            height: "280",
                            menubar: false,
                            plugins: "lists advlist",
                            toolbar:
                              "+ removeformat bold italic underline strikethrough bullist numlist",
                            statusbar: false,
                            skin_url:
                              "resources/vendor/silverstripe/admin/thirdparty/tinymce/skins/silverstripe",
                          }}
                          onBlur={(e) => {
                            handleChange({
                              target: {
                                name: id,
                                value: e.target.getContent(),
                              },
                            });
                          }}
                        />
                        {hasError && (
                          <div
                            className="error-message-container"
                            key={"error_" + id}
                          >
                            <i className="fas fa-exclamation-circle text-danger ml-1 error-icon" />
                            <span className="error-message">
                              {errorMessage}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }

                if (
                  type === "service register" ||
                  type === "dropdown" ||
                  type === "information classification"
                ) {
                  let selectOptions = serviceRegister;

                  if (type !== "service register") {
                    selectOptions = options.map((option) => {
                      return {
                        value: option.value,
                        label: option.label,
                      };
                    });
                  }

                  return (
                    <div key={id} className="field-container">
                      {label && (
                        <div className="label">
                          <label className={required > 0 ? "required" : ""}>
                            {label}
                          </label>
                        </div>
                      )}

                      <div className="dropdown-container">
                        <Select
                          name={id}
                          options={selectOptions}
                          defaultValue={
                            initialValues[id] &&
                            selectOptions.find(
                              (option) =>
                                option.value ===
                                JSON.parse(initialValues[id]).value
                            )
                              ? JSON.parse(initialValues[id])
                              : ""
                          }
                          classNamePrefix="react-select"
                          className={hasError ? "react-select-error" : ""}
                          maxMenuHeight={250}
                          placeholder="Select"
                          onChange={(selectedOption) => {
                            handleChange({
                              target: {
                                name: id,
                                value: JSON.stringify(selectedOption),
                              },
                            });
                          }}
                        />
                      </div>
                      {hasError && (
                        <div
                          className="error-message-container"
                          key={"error_" + id}
                        >
                          <i className="fas fa-exclamation-circle text-danger ml-1 error-icon" />
                          <span className="error-message">{errorMessage}</span>
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              })}
              <div className="bottom-container">
                <div className="message-container">
                  <span>
                    <InfoSVG/>
                    <span className="saveMessage">
                      Your answers will be saved when you continue to the next
                      question.
                    </span>
                  </span>
                </div>
                <div className="button-container">
                  <DarkButton title="Next" rightIconImage={ChevronIcon} />
                </div>
              </div>
            </Form>
          );
        }}
      </Formik>
    );
  }
}

export default QuestionForm;
