// @flow

import React, {Component} from "react";
import {Link} from "react-router-dom";
import type {Pillar as PillarType} from "../../types/Pillar";

type Props = {
  link: string,
  classes: Array<string>,
  pillar: PillarType
};

class Pillar extends Component<Props> {

  render() {

    const classes = ["Pillar", ...this.props.classes];
    if (this.props.pillar.disabled) {
      classes.push("disabled")
    }

    return (
      <Link className={classes.join(" ")} to={this.props.link} onClick={(event) => {
        if(this.props.pillar.disabled) {
          event.preventDefault();
          alert("Coming soon...");
        }
      }}>
        <div className="title">
          {this.props.pillar.title}
        </div>
        <div className="icon-container">
          <div className="icon">
            {this.props.pillar.icon}
          </div>
        </div>
        <div className="caption">
        {this.props.pillar.caption}
        </div>
        
      </Link>
    );
  }
}

export default Pillar;
