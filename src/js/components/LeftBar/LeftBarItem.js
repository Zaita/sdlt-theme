// @flow
// This is used for component selection

import React, {Component} from "react";
import QuestionEditingIcon from "../../../img/icons/create.svg";
import QuestionPendingIcon from "../../../img/icons/check-box-blank.svg";
import QuestionCompletedIcon from "../../../img/icons/check-box.svg";
import QuestionNotApplicableIcon from "../../../img/icons/not-applicable.svg";

type Props = {
  title: string,
  iconType: "editing" | "success" | "pending" | "not-applicable",
  disabled: boolean,
  onItemClick: () => void,
  index: number
};

export default class LeftBarItem extends Component<Props> {

  render() {
    const {title, disabled, onItemClick, index} = {...this.props};

    return (
      <div className="LeftBarItem">
        <button className="btn"
                disabled={disabled}
                onClick={(event) => {
                  event.preventDefault();
                  onItemClick();
                }}>
                {this.renderIcon()}
                {index+1}.  {title}
        </button>
      </div>
    );
  }

  renderIcon() {
    const {iconType} = {...this.props};

    switch (iconType) {
      case "editing":
        return <img src={QuestionEditingIcon}/>;
      case "success":
        return <img src={QuestionCompletedIcon}/>;
      case "pending":
        return <img src={QuestionPendingIcon}/>;
      case "not-applicable":
        return <img src={QuestionNotApplicableIcon}/>;
      default:
        return null;
    }
  }
}
