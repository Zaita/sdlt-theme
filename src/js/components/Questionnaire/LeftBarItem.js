// @flow

import React, {Component} from "react";
import type {Question} from "../../types/Questionnaire";
import QuestionEditingIcon from "../../../img/icons/create.svg";
import QuestionPendingIcon from "../../../img/icons/check-box-blank.svg";
import QuestionCompletedIcon from "../../../img/icons/check-box.svg";
import QuestionNotApplicableIcon from "../../../img/icons/not-applicable.svg";
import EditPencilSVG from "@material-ui/icons/Edit";

type Props = {
  question: Question,
  onItemClick: (question: Question) => void,
  index: number,
  component: string,
};

export default class LeftBarItem extends Component<Props> {

  render() {
    const {question, onItemClick, index, component} = {...this.props};

    return (
      <div className="LeftBarItem">
        {this.renderIcon(question)}
        <button className="btn"
                disabled={!question.isApplicable}
                onClick={(event) => {
                  onItemClick(question, component);
                }}
        >
          {index + 1}.  {question.title}
        </button>
      </div>
    );
  }

  renderIcon(question: Question) {
    const {isCurrent, hasAnswer, isApplicable} = {...question};

    if (isCurrent) {
      return (
        <EditPencilSVG/> //<img src={QuestionEditingIcon} />
      );
    }

    if (!isApplicable) {
      return (
        <img src={QuestionNotApplicableIcon} />
      );
    }

    if (hasAnswer && isApplicable) {
      return (
        <img src={QuestionCompletedIcon} />
      );
    }

    return (
      <img src={QuestionPendingIcon} />
    );
  }
}
