import React, { Component } from 'react';
import { Droppable } from 'react-beautiful-dnd';
import ControlCard from './ControlCard';
import InformationTooltip from './InformationTooltip';
import OpenWithIcon from '@material-ui/icons/OpenWith';

// optimization
class InnerList extends React.Component {
  shouldComponentUpdate(nextProps) {
    if (nextProps.controls === this.props.controls) {
      return false
    }
    return true
  }

  render() {
    const {
      cvaTaskSubmissionUUID,
      productName,
      sraTaskSubmissionUUID,
      secureToken,
      showSubmissionBreadcrumb,
      showApprovalBreadcrumb,
      questionnaireSubmissionUUID,
      comingFrom,
      sraTaskName,
      productAspect
    } = this.props;

    return this.props.controls.map((control, index) => (
      <ControlCard
        key={control.id}
        control={control}
        index={index}
        cvaTaskSubmissionUUID={cvaTaskSubmissionUUID}
        productName={productName}
        productAspect={productAspect}
        sraTaskSubmissionUUID={sraTaskSubmissionUUID}
        secureToken={secureToken}
        showSubmissionBreadcrumb={showSubmissionBreadcrumb}
        showApprovalBreadcrumb={showApprovalBreadcrumb}
        questionnaireSubmissionUUID={questionnaireSubmissionUUID}
        comingFrom={comingFrom}
        sraTaskName={sraTaskName}
      />
    ))
  }
}

export default class Column extends Component {
  state = {
    controlArrayIsValid: false
  }

  componentDidUpdate(prevProps) {
    if (this.props.controls !== prevProps.controls) {
      this.setState({ controlArrayIsValid: true })
    }
  }

  render() {
    const {
      column,
      controls,
      cvaTaskSubmissionUUID,
      productName,
      productAspect,
      questionnaireSubmissionUUID,
      sraTaskSubmissionUUID,
      sraTaskName,
      secureToken,
      showSubmissionBreadcrumb,
      showApprovalBreadcrumb,
      comingFrom,
      informationText,
    } = { ...this.props };

    let columnIsEmpty
    if (controls.length === 0) {
      columnIsEmpty = (
        <div className='empty-column-text'>
          <OpenWithIcon className='directional-drag-arrow' />
          <p>Click and drag a control to move it into '{column.title}'.</p>
        </div>
      )
    }

    return (
      <>
        <div className='column-header'>
          <h5 className='column-title'>{column.title}</h5>
          <InformationTooltip columnInformation={informationText} />
        </div>
        <div className={columnIsEmpty ? 'dotted-border column-card-list' : 'column-card-list'}>
          <Droppable droppableId={column.id}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                style={{ backgroundColor: snapshot.isDraggingOver ? 'grey' : '#efefef' }}
                {...provided.droppableProps}
              >
                {columnIsEmpty}

                {this.state.controlArrayIsValid ? (
                  <InnerList
                    controls={controls}
                    columnTitle={column.title}
                    cvaTaskSubmissionUUID={cvaTaskSubmissionUUID}
                    productName={productName}
                    productAspect={productAspect}
                    sraTaskSubmissionUUID={sraTaskSubmissionUUID}
                    secureToken={secureToken}
                    showSubmissionBreadcrumb={showSubmissionBreadcrumb}
                    showApprovalBreadcrumb={showApprovalBreadcrumb}
                    questionnaireSubmissionUUID={questionnaireSubmissionUUID}
                    comingFrom={comingFrom}
                    sraTaskName={sraTaskName}
                  />
                  ) : null
                }

                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>
      </>
    )
  }
}
