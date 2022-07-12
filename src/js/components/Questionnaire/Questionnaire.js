// @flow

import React, {Component} from "react";
import {FormikBag} from "formik";
import type {AnswerAction, Question, Submission} from "../../types/Questionnaire";
import LeftBar from "./LeftBar";
import QuestionForm from "./QuestionForm";
import _ from "lodash";

type Props = {
  questions: Array<Question>,
  saveAnsweredQuestion: (question: Question, component: string) => void,
  onLeftBarItemClick: (question: Question, component: string) => void,
  serviceRegister: Array<*>,
  informationClassificationTaskResult: string,
  riskProfileData: Array<*>,
  resultForCertificationAndAccreditation: Array<*>,
  component: string,
  taskSubmissionTaskType: string,
};

class Questionnaire extends Component<Props> {

  handleFormSubmit(formik: FormikBag, values: Object) {
    const {questions, saveAnsweredQuestion, component} = {...this.props};

    // Generate new question with data
    const currentQuestion = questions.find((question) => {
      return question.isCurrent === true;
    });
    if (!currentQuestion) {
      return;
    }

    const answeredQuestion = {...currentQuestion};
    _.forIn(values, (value, key) => {
      const index = answeredQuestion.inputs.findIndex((item) => item.id === key);
      if(index >= 0) {
        _.set(answeredQuestion, `inputs.${index}.data`, value)
      }
    });
    answeredQuestion.hasAnswer = true;
    answeredQuestion.isApplicable = true;

    saveAnsweredQuestion(answeredQuestion, component)
  }

  handleActionClick(action: AnswerAction) {
    const {questions, saveAnsweredQuestion, component} = {...this.props};

    // Generate new question with data
    const currentQuestion = questions.find((question) => {
      return question.isCurrent === true;
    });
    if (!currentQuestion) {
      return;
    }

    const answeredQuestion = {...currentQuestion};
    answeredQuestion.actions = answeredQuestion.actions.map((item) => {
      item.isChose = (item.id === action.id);
      return item;
    });
    answeredQuestion.hasAnswer = true;
    answeredQuestion.isApplicable = true;

    saveAnsweredQuestion(answeredQuestion, component);
  }

  handleNextButtonClickForDisplayField() {
    const {questions, saveAnsweredQuestion} = {...this.props};

    // Generate new question with data
    const currentQuestion = questions.find((question) => {
      return question.isCurrent === true;
    });
    if (!currentQuestion) {
      return;
    }

    const answeredQuestion = {...currentQuestion};
    answeredQuestion.hasAnswer = true;
    answeredQuestion.isApplicable = true;

    saveAnsweredQuestion(answeredQuestion);
  }

  render() {
    const {
      questions,
      onLeftBarItemClick,
      serviceRegister,
      informationClassificationTaskResult,
      riskProfileData,
      resultForCertificationAndAccreditation,
      handleTaskSaveDraftButtonClick,
      handleTaskSubmitButtonClick,
      loadResultForCertificationAndAccreditation,
      component,
      questionnaireTitle,
      taskSubmissionTaskType
    } = {...this.props};

    const currentQuestion = questions.find((question) => {
      return question.isCurrent === true;
    });

    const currentQuestionIndex = questions.findIndex((question) => question.id === currentQuestion.id);
    const isRiskQuestionnaire = taskSubmissionTaskType == "risk questionnaire";

    const hideLeftBar = () => {
      if (currentQuestionIndex === 0 && isRiskQuestionnaire) {
        return;
      }
      return (
        <LeftBar
        questions={questions}
        onItemClick={onLeftBarItemClick}
        component={component}
      />
      )
    }

    const title = () => {
      if (currentQuestionIndex === 0 && isRiskQuestionnaire) {
        return "Key information"
      }
      return "Questions";
    }

    const questionnaireContainer = () => {
      if (currentQuestionIndex === 0 && isRiskQuestionnaire) {
        return "key-information-form-container"
      } else {
        return "form-container"
      }
    }

    return (
      <div className="Questionnaire mx-1">
        <div className="major">
          <div className="title">{title()}</div>
          <div className={questionnaireContainer()}>
            {hideLeftBar()}
            {
              currentQuestion &&
              <QuestionForm
                taskSubmissionTaskType={taskSubmissionTaskType}
                index={currentQuestionIndex}
                key={currentQuestion.id}
                question={currentQuestion}
                questionnaireTitle={questionnaireTitle}
                serviceRegister={serviceRegister}
                riskProfileData={riskProfileData}
                resultForCertificationAndAccreditation={resultForCertificationAndAccreditation}
                loadResultForCertificationAndAccreditation={loadResultForCertificationAndAccreditation}
                informationClassificationTaskResult={informationClassificationTaskResult}
                handleTaskSaveDraftButtonClick={handleTaskSaveDraftButtonClick}
                handleFormSubmit={this.handleFormSubmit.bind(this)}
                handleActionClick={this.handleActionClick.bind(this)}
                handleNextButtonClickForDisplayField={this.handleNextButtonClickForDisplayField.bind(this)}
              />
            }
          </div>
        </div>
      </div>
    );
  }
}

export default Questionnaire;
