import React from "react";
import ReactModal from "react-modal";
import LightButton from "../Button/LightButton";
import DarkButton from "../Button/DarkButton";
import CloseIcon from "../../../img/icons/close.svg";

export function RouterPrompt(props) {
  const { when, handleCloseSubmitModal, handleSubmit, resetModalState } = props;

  function onCancel() {
    resetModalState('cancel');
  }

  return when ? (
    <ReactModal
      portalClassName="unsaved-changes-modal"
      isOpen={when}
      ariaHideApp={false}
      parentSelector={() => {
        return document.querySelector(".ControlDetailContainer");
      }}
    >
      <div className="modal-header">
        <span className="header-title">
          <h1>Unsaved changes</h1>
        </span>
        <div className="close-icon-container" onClick={() => onCancel()}>
          <img src={CloseIcon} />
        </div>
      </div>
      <div className="content">
        <p>This page has unsaved changes.</p>
        <p>
          <b>Do you want to save your changes before leaving?</b>
        </p>
      </div>
      <div className="button-container">
        <LightButton
          title="Don't save changes"
          classes={["mr-3 confirm-save-button"]}
          onClick={() => handleCloseSubmitModal()}
        />
        <DarkButton
          title="Save changes"
          classes={["confirm-save-button"]}
          onClick={() => handleSubmit()}
        />
      </div>
    </ReactModal>
  ) : null;
}
