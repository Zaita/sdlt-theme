// @flow

import React, {Component} from "react";
import BaseButton from "./BaseButton";

type Props = {
  title: string,
  disabled: boolean,
  classes: Array<string>,
  onClick: (event: Event) => void,
  iconImage?: string
};

class RedButton extends Component<Props> {

  static defaultProps = {
    title: "",
    disabled: false,
    classes: [],
    onClick: () => {},
  };

  render() {
    return <BaseButton {...this.props} classes={["RedButton", ...this.props.classes]} />;
  }
}

export default RedButton;
