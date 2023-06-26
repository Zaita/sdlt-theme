//@flow

import React, { useState } from "react";
import { Draggable } from "react-beautiful-dnd";
import { Card, IconButton } from "@mui/material";
import { Link } from "react-router-dom";
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import KeyControlIcon from '@mui/icons-material/Star';
import effectiveIconSvg from '@mui/icons-material/VerifiedUser';
import partiallyEffectiveIconSvg from '@mui/icons-material/SecurityTwoTone';
import notEffectiveIconSvg from '@mui/icons-material/GppBad';

type Props = {
  evalutionRating: string,
  id: string,
  isKeyControl: boolean,
  index: number,
  implementationEvidenceUserInput: string,
  name: string,
  productAspect: string,
  riskCategories: Array<string>,
  column: Object,
  control: Object,
  cvaTaskSubmissionUUID: string,
  sraData: object,
};

export default function CardItem(props: Props) {
  const [expanded, setExpanded] = useState(false);

  const {
    name,
    riskCategories,
    id,
    isKeyControl,
    evalutionRating,
    implementationEvidenceUserInput,
    sraData
  } = props.control;

  const { column, index } = props;

  const evaluationRatingIconsMap = {
    "Not Validated": notEffectiveIconSvg,
    "Not Effective": notEffectiveIconSvg,
    "Partially Effective": partiallyEffectiveIconSvg,
    "Effective": effectiveIconSvg
  };

  const EvaluationRatingIcon = (evaluationRatingIconsMap, icon) => {
    return (
      <img
        className="effectiveness-icon"
        src={evaluationRatingIconsMap[icon]}
        alt={icon + " icon"}
      />
    );
  };

  const controlsInImplementedColumn = (column) => {
    if (column.id !== "column-4" || column.title !== "Implemented") {
      return;
    }

    const implementedControlIds = column.controlIds;
    return implementedControlIds;
  };

  const isControlImplemented = () => {
    const implementedControls = controlsInImplementedColumn(column);

    if (implementedControls == undefined) {
      return;
    }

    const isImplemented = implementedControls?.includes(id);
    return isImplemented;
  };

  const isEvidenceAddedToControl = () => {
    if (implementationEvidenceUserInput !== "") {
      return true;
    }
  };

  const isControlImplementedAndHasEvidence = () => {
    if (isControlImplemented() && isEvidenceAddedToControl()) {
      return true;
    }
  };

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const riskCategoryDisplay = () => {
    if (!expanded && riskCategories.length > 0) {
      return (
        <>
          <p className="card-risk-category">{riskCategories[0].name}</p>
          {riskCategories.length > 1 ? (
            <p className="card-weight">+{riskCategories.length - 1}</p>
          ) : (
            ""
          )}
        </>
      );
    }

    return riskCategories.map((risk, i) => (
      <p className="card-risk-category" key={i}>
        {risk.name}
      </p>
    ));
  };

  const evidenceStatus = () => {
    return (
      <div className="evidence-status">
        {EvaluationRatingIcon(evaluationRatingIconsMap, "Effective")}
        <p className="evidence-text">Evidence Added</p>
      </div>
    );
  };

  const evaluationRatingStatus = () => {
    if (evalutionRating == "") {
      return;
    }

    return (
      <div className="evidence-evaluation-rating">
        {EvaluationRatingIcon(evaluationRatingIconsMap, evalutionRating)}
        <p className="evidence-text">{evalutionRating}</p>
      </div>
    );
  };

  return (
    <Draggable draggableId={id} index={index}>
      {(provided, snapshot) => {
        const draggingStyle = {
          backgroundColor: snapshot.isDragging ? "lightgrey" : "white",
          ...provided.draggableProps.style,
        };

        return (
          <Card
            className="material-card"
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            ref={provided.innerRef}
            style={draggingStyle}
          >
            <div className="card-content">
              <div className="card-header">
                {isKeyControl ? (
                  <p className="card-title card-key-control">
                    <img src={KeyControlIcon} alt="star icon" />
                    {name}
                  </p>
                ) : (
                  <p className="card-title">{name}</p>
                )}
                <div className="card-chevron">
                  <Link
                    to={{
                      pathname: "/control-detail-page",
                      state: { props },
                    }}
                  >
                    <IconButton aria-label="show more">
                      <ChevronRightIcon />
                    </IconButton>
                  </Link>
                </div>
              </div>
              <div
                className={
                  !expanded ? "card-footer" : "card-footer flex-column"
                }
                onClick={!isControlImplemented() ? handleExpandClick : null}
              >
                {isControlImplemented() ? null : riskCategoryDisplay()}
                {isControlImplementedAndHasEvidence() ? evidenceStatus() : null}
                {isControlImplemented() ? evaluationRatingStatus() : null}
              </div>
            </div>
          </Card>
        );
      }}
    </Draggable>
  );
}
