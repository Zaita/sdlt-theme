// @flow
import React, {Component} from "react";
import Icon from "../../../img/icons/home-icon.svg";

class HomeButton extends Component<Props> {

  static defaultProps = {
    classes: []
  };

  render() {
    const {classes} = {...this.props};

    let isHomeButtonActive = false;

    if (window.location.hash == `#/`) {
      isHomeButtonActive  = true;
    }

    return (
      <button className={`HeaderButton ${classes.join(" ")}${isHomeButtonActive  ? 'active' : ''}`}
        onClick={() => {
          this.homepage();
        }}
      >
        <div>
          <img src={Icon} className="home-icon" />
            Home
        </div>
      </button>
    );
  }

  async homepage() {
    window.location.href = `/`;
  }
}

export default HomeButton;
