// @flow
import React, {Component} from "react";
import Icon from "../../../img/icons/approvals-icon.svg";

class AwaitingApprovalsButton extends Component<Props> {
  static defaultProps = {
    classes: []
  };

  render() {
    const {
      classes,
      showApprovalBreadcrumb
    } = {...this.props};

    let isAwaitingApprovalsButtonActive = false;

    if (window.location.hash == `#/AwaitingApprovals` || showApprovalBreadcrumb) {
      isAwaitingApprovalsButtonActive = true;
    }

    return (
      <button className={`HeaderButton ${classes.join(" ")}${isAwaitingApprovalsButtonActive ? 'active' : ''}`}
        onClick={() => {
          this.awaitingApprovals();
        }}
      >
        <div>
          <img src={Icon} />
            Approvals
        </div>
      </button>
    );
  }

  async awaitingApprovals() {
    window.location.href = `#/AwaitingApprovals`;
  }
}

export default AwaitingApprovalsButton;
