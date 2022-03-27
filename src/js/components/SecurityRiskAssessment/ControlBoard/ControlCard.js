import React, { useState } from 'react'
import { Draggable } from 'react-beautiful-dnd'
import { Card, IconButton } from '@material-ui/core'
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import Paperclip from '@material-ui/icons/AttachFile';

// not the final icons
import EffectiveIcon from '@material-ui/icons/VerifiedUser';
import PartiallyEffectiveIcon from '@material-ui/icons/Policy';
import NotEffectiveIcon from '@material-ui/icons/Security';
import NotValidatedIcon from '@material-ui/icons/Cancel';


export default function CardItem(props) {
  const [expanded, setExpanded] = useState(false);

  const evidenceIconsMap = {
    "Not Validated": <NotValidatedIcon />,
    "Not Effective": <NotEffectiveIcon />,
    "Partially Effective": <PartiallyEffectiveIcon />,
    "Effective": <EffectiveIcon />
  }

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const riskCategoryDisplay = (arr) => {
    if (!expanded && arr.length)
      return (
        <>
          <p className="card-risk-category">{arr[0].name}</p>
          {arr.length > 1
            ? <p className="card-weight">+{arr.length-1}</p>
            : ''
          }
        </>
      )

    return arr.map((risk, i) => (
      <p className="card-risk-category" key={i}>{risk.name}</p>
    ))
  }

  // get card column position from state, and implement the following evidence methods only if the card is in the 'implemented' column.
  const evidenceStatus = (evidence) => {
    if (!evidence) {
      return
    }

    return (
      <div>
        <Paperclip />
        <p>Evidence Added</p>
      </div>
    )
  }

  //consider material ui migration or include fontawesome
  const evidenceRatingStatus = (evidenceRating, icons) => {
    if (!evidenceRating) {
      return
    }

    const icon = icons[evidenceRating]
    return (
      <div className="evidence">
        <p>{icon}</p>
        <p>{evidenceRating}</p>
      </div>
    )
  }

  const { name, riskCategories, id, keyControl, evidenceAdded, evidenceRating } = props.control

  return (
    <Draggable draggableId={props.control.id} index={props.index}>
      {(provided, snapshot) => {
        const draggingStyle = {
          backgroundColor: snapshot.isDragging ? 'lightgrey' : 'white',
          ...provided.draggableProps.style,
        };

        return (
          <Card className="material-card"
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            ref={provided.innerRef}
            style={draggingStyle}
          >
            <div className="card-content">
              <div className="card-header">
                {keyControl
                  ? <p className="card-title card-key-control">{'⭐ ' + name}</p>
                  : <p className="card-title">{name}</p>
                }
                <div className="card-chevron">
                  <IconButton aria-label="show more">
                    <ChevronRightIcon />
                  </IconButton>
                </div>
              </div>
              <div className={!expanded ? 'card-footer' : 'card-footer flex-column'} onClick={handleExpandClick}>
                {riskCategoryDisplay(riskCategories)}
                {evidenceStatus(evidenceAdded)}
                {/* {evidenceRatingStatus(evidenceRating, evidenceIconsMap)} */}
              </div>
            </div>
          </Card>
        )

      }}
    </Draggable>
  )
}
