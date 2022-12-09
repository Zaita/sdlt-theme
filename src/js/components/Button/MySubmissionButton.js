// @flow
import React, {Component} from "react";
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';

class MySubmissionButton extends Component<Props> {

  static defaultProps = {
    classes: []
  };

  render() {
    const {
      classes,
      showSubmissionBreadcrumb
    } = {...this.props};

    let isSubmissionsButtonActive = false;

    if (window.location.hash == `#/MySubmissions` || showSubmissionBreadcrumb) {
      isSubmissionsButtonActive = true;
    }

    return (
      <button className={`HeaderButton ${classes.join(" ")}${isSubmissionsButtonActive ? 'active' : ''}`}
        onClick={() => {
          this.allSubmission();
        }}
      >
        <div>
          <FormatListBulletedIcon className="submissions-icon"/>
            Submissions
        </div>
      </button>
    );
  }

  async allSubmission() {
    window.location.href = `#/MySubmissions`;
  }
}

export default MySubmissionButton;
