// @flow

import React, {Component} from "react";
import type {Question} from "../../types/Questionnaire";
import LeftBarItem from "./LeftBarItem";

type Props = {
  questions: Array<Question>,
  onItemClick: (question: Question) => void,
  component: string,
};

class LeftBar extends Component<Props> {

  render() {
    const {questions, onItemClick, component} = {...this.props};

    return (
      <div className="LeftBar">
          <div className="items">
          {questions.map((question, index) => {
            return (
              <div>
                <LeftBarItem question={question} onItemClick={onItemClick} key={question.id} index={index} component={component} />
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}

export default LeftBar;
