import React, { Component } from "react";
import CloseIcon from "../../../img/icons/close.svg";
import helpIcon from "../../../img/icons/help-outline.svg";
import RiskRatingThresholdContainer from "./RiskRatingThresholdContainer";
import LikelihoodLegendContainer from "./LikelihoodLegendContainer";
import ImpactThresholdContainer from "./ImpactThresholdContainer";
import ReactModal from "react-modal";

class RiskAssessmentHelpModalContainer extends Component {
  state = {
    showModal: false,
  };

  handleOpenModal = () => {
    this.setState({ showModal: true });
  };

  handleCloseModal = () => {
    this.setState({ showModal: false });
  };

  renderCurrentRiskRatingContent() {
    return (
      <div className="content">
        <div
          className="modal-help-text"
          dangerouslySetInnerHTML={{
            __html: this.props.helpText
          }}
        />
        <RiskRatingThresholdContainer
          riskRatingThresholds={this.props.riskRatingThresholds}
        />
      </div>
    );
  };

  renderLikelihoodScoreContent() {
    return (
      <div className="content">
        <div
          className="modal-help-text"
          dangerouslySetInnerHTML={{
            __html: this.props.helpText
          }}
        />
        <LikelihoodLegendContainer
          likelihoodThresholds={this.props.likelihoodScoreThresholds}
        />
      </div>
    );
  };

  renderImpactScoreContent() {
    return (
      <div className="content">
        <div
          className="modal-help-text"
          dangerouslySetInnerHTML={{
            __html: this.props.helpText
          }}
        />
        <ImpactThresholdContainer
          impactThresholds={this.props.impactScoreThresholds}
        />

      </div>
    );
  };

  render() {
    return (
      <div className="HelpModalContainer">
        <img src={helpIcon} onClick={() => this.handleOpenModal()}/>
        <ReactModal
          isOpen={this.state.showModal}
          ariaHideApp={false}
          parentSelector={() => {
            return document.querySelector(".SecurityRiskAssessmentContainer");
          }}
        >
          <div className="modal-header">
            <span className="header-title">
              <h1>{this.props.title}</h1>
            </span>
            <div className="close-icon-container" onClick={this.handleCloseModal}>
              <img src={CloseIcon} />
            </div>
          </div>
          {this.props.title === "Current Risk Rating" && this.renderCurrentRiskRatingContent()}
          {this.props.title === "Likelihood score" && this.renderLikelihoodScoreContent()}
          {this.props.title === "Impact score" && this.renderImpactScoreContent()}
        </ReactModal>
      </div>
    );
  }
}
export default RiskAssessmentHelpModalContainer;
