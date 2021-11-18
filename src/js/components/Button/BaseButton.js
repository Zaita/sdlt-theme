// @flow

import React, {Component} from "react";
import classNames from "classnames";

type Props = {
  title: string,
  disabled: boolean,
  classes: Array<string>,
  onClick: (event: Event) => void,
  iconImage?: string
};

class BaseButton extends Component<Props> {

  static defaultProps = {
    title: "",
    disabled: false,
    classes: [],
    onClick: () => {},
  };

  render() {
    const {title, classes, disabled, onClick, iconImage, rightIconImage} = {...this.props};

    let icon = null;
    let rightIcon = null;

    if (iconImage) {
      icon = <img src={iconImage}/>;
    }

    if (rightIconImage) {
      rightIcon = <img className="img-right" src={rightIconImage}/>;
    }

    return (
      <button className={classNames("BaseButton", classes, {"disabled": disabled})}
              onClick={(event) => {
                if (disabled) {
                  event.preventDefault();
                  return;
                }
                onClick(event);
              }}
      >
        {icon}
        {title}
        {rightIcon}
      </button>
    );
  }
}

export default BaseButton;
