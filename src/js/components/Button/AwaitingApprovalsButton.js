// @flow
import React, {Component} from "react";
import GppGoodIcon from '@mui/icons-material/GppGood';

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
          <GppGoodIcon className="awaiting-approvals-icon"/>
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
