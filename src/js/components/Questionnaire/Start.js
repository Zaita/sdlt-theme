// @flow

import React, {Component} from "react";
import type {User} from "../../types/User";
import BackArrow from "../../../img/icons/back-arrow.svg";
import DarkButton from "../Button/DarkButton";
import chevronRightIcon from "../../../img/icons/chevron-right.svg";
import { Link } from "react-router-dom";

type Props = {
  title: string,
  keyInformation: string,
  user: User,
  onStartButtonClick:() => void
};
const backLink = (
  <Link to={'/'}>
    <div className="back-link">
      <img src={BackArrow} />
      Back
    </div>
  </Link>
);

const submissionDate = (
  <div className="submission-date">
    <p>{new Date().toLocaleDateString()}</p>
  </div>
)

class Start extends Component<Props> {
  render() {
    const { title, keyInformation, user, onStartButtonClick } = this.props;

    return (
      <div className="Start">
        <div className="start-form">
          {backLink}
          <span className="submission-title">{title}</span>
          {submissionDate}
          <div className="submission-detail-container">
            <div className="submitter-name">
              <span className="submission-details-label">Submitted by: </span>
              <span className="submission-details-data">{user.name}</span>
            </div>
            <div>
              <span className="submission-details-label">Email: </span>
              <span className="submission-details-data">{user.email}</span>
            </div>
          </div>
          <div className="key-info-title">Key information</div>
          <div className="info-box">
            <div
              className="key-info"
              dangerouslySetInnerHTML={{
                __html: keyInformation,
              }}
            />
          </div>
          <div className="actions">
            <DarkButton
              className="start-button"
              title="Start"
              rightIconImage={chevronRightIcon}
              onClick={onStartButtonClick}
            />
          </div>
        </div>
      </div>
    );
  }
}
export default Start;
