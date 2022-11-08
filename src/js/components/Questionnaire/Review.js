// @flow

import React, {Component} from "react";
import type {Submission} from "../../types/Questionnaire";
import LightButton from "../Button/LightButton";
import DarkButton from "../Button/DarkButton";
import pdfIcon from "../../../img/icons/download.svg";
import editIcon from "../../../img/icons/edit-icon.svg";
import AnswersPreview from "./AnswersPreview";
import SubmissionDataUtil from "../../utils/SubmissionDataUtil";
import URLUtil from "../../utils/URLUtil";
import EditPencilSVG from "@material-ui/icons/Edit";
import DownloadSVG from "@material-ui/icons/GetApp";

type Props = {
  secureToken: string,
  submission: Submission | null,
  handleSubmitButtonClick: () => void,
  handlePDFDownloadButtonClick: () => void,
  handleEditAnswerButtonClick: () => void,
};

class Review extends Component<Props> {

  render() {
    const {
      submission,
      viewAs,
      secureToken,
      handleSubmitButtonClick,
      handlePDFDownloadButtonClick,
      handleEditAnswerButtonClick,
    } = {...this.props};

    if (!submission) {
      return null;
    }

    const alreadySubmittedAlert = (
      <div className="alert alert-success text-center">
        This questionnaire has already been submitted.
      </div>
    )

    const buttons = (
      <div className="buttons">
      <LightButton title="Edit"
                   svgImage={<EditPencilSVG/>}
                   classes={["button"]}
                   onClick={handleEditAnswerButtonClick}/>
      <LightButton title="PDF"
                   svgImage={<DownloadSVG/>}
                   classes={["button"]}
                   onClick={handlePDFDownloadButtonClick}/>
      <DarkButton title="SUBMIT QUESTIONNAIRE"
                  classes={["button"]}
                  disabled={SubmissionDataUtil.existsUnansweredQuestion(submission.questions)}
                  onClick={handleSubmitButtonClick}/>
      </div>
    );

    const summaryButton = (
      <div className="buttons">
      <LightButton title="BACK TO SUMMARY"
                   classes={["button"]}
                   onClick={() => URLUtil.redirectToQuestionnaireSummary(submission.submissionUUID, secureToken)}/>
      </div>
    );

    return (
      <div className="Review">
        {submission.status !== "in_progress" && alreadySubmittedAlert}
        <AnswersPreview questions={submission.questions}/>
        {(viewAs === 'submitter' && (submission.status === "in_progress" || submission.status === "submitted")) && buttons}
        {(viewAs !== 'submitter') && summaryButton}
      </div>
    );
  }
}

export default Review;
