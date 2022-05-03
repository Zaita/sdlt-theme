// @flow
import React, { Component } from 'react';
import { DragDropContext } from 'react-beautiful-dnd';
import { initialData, selectedOptionData } from './data/index';
import Column from './Column';
import BoardFilters from './BoardFilters/BoardFilters';
import { Alert, AlertTitle } from '@material-ui/lab';
import { cloneDeep } from 'lodash';

type Props = {
  notApplicableInformationText: string,
  notImplementedInformationText: string,
  plannedInformationText: string,
  implementedInformationText: string,
  dispatchUpdateCVAControlStatus?: (selectedOptionDetail: object) => void
}

export default class Board extends Component<Props> {
  state = {
    controls: [],
    columns: initialData.columns,
    columnOrder: initialData.columnOrder,
    showNotApplicable: true,
    message: null
  }

  componentDidMount() {
    const controls = this.addControlsToState();
    this.setState({ controls });
  }

  toggleNotApplicable = clickEvent => {
    this.setState({ showNotApplicable: clickEvent.target.checked })
  }

  onDragEnd = (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    // check if the location of the draggable element changes.
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    const start = this.state.columns[source.droppableId];
    const finish = this.state.columns[destination.droppableId];

    this.state.message = {
      severity:'success',
      icon: '',
      title:'Changes applied.',
      text:'Your likelihood and impact scores have been updated.'
    }

    if (start === finish) {
      const newControlIds = Array.from(start.controlIds);

      // move control id to new index from old index.
      newControlIds.splice(source.index, 1);

      // start from destination index, remove nothing, and insert the draggableId
      newControlIds.splice(destination.index, 0, draggableId);

      const newColumn = {
        ...start,
        controlIds: newControlIds,
      };

      // update state to persist the order of the controls array (controls in a column on kanban)
      // e.g. with a backend, call an endpoint after this update to let server know an update has occurred
      const newState = {
        ...this.state,
        columns: {
          ...this.state.columns,
          [newColumn.id]: newColumn,
        }
      };

      this.setState(newState);
      return;
    }

    //moving from one list to another
    const startControlIds = Array.from(start.controlIds);

    startControlIds.splice(source.index, 1);

    const newStart = {
      ...start,
      controlIds: startControlIds,
    };

    const finishControlIds = Array.from(finish.controlIds);
    finishControlIds.splice(destination.index, 0, draggableId);
    const newFinish = {
      ...finish,
      controlIds: finishControlIds,
    };

    const newState = {
      ...this.state,
      columns: {
        ...this.state.columns,
        [newStart.id]: newStart,
        [newFinish.id]: newFinish,
      }
    };

    this.setState(newState);

    // save control with updated selected option in the atabase
    const { cvaTaskSubmissionUUID, selectedControls } = this.props;
    const controlID = draggableId.split('_');

    this.props.dispatchUpdateCVAControlStatus({
      "selectedOption": selectedOptionData[finish.title],
      "controlID": controlID[2],
      "componentID": selectedControls[0].id,
      "productAspect": selectedControls[0].productAspect,
      "uuid": cvaTaskSubmissionUUID
    })
  };


  addControlsToState() {
    if (this.props.selectedControls.length === 0) {
      return;
    }

    const securityComponentName = this.props.selectedControls[0].name;
    const selectedControls = this.props.selectedControls[0].controls;
    let controls = [];

    selectedControls.map(({id, ...control}) => {
      let key = securityComponentName + "_" + control.name + "_" + id;
      controls = {
        ...controls,
        [key]: {
          id: key,
          ...control
        }
      }
    })

    this.addControlsToColumns(controls);

    return controls;
  }

  addControlsToColumns(controls) {
    const columns = cloneDeep(this.state.columns);

    this.state.columnOrder.map((columnId) => {
      const column = columns[columnId];
      const columnControlIdsArray = column.controlIds;

      Object.entries(controls).map((control) => {
        if (control[1].selectedOption === selectedOptionData[column.title]) {
          columnControlIdsArray.push(control[0]);
        }
      });
    })

    this.setState({ columns });
  }

  render() {
    const informationTextData = {
      'Not applicable': this.props.notApplicableInformationText,
      'Not implemented': this.props.notImplementedInformationText,
      'Planned': this.props.plannedInformationText,
      'Implemented': this.props.implementedInformationText
    }

    return (
      <>
        <BoardFilters toggleNotApplicable={this.toggleNotApplicable}/>
        {this.state.message ? (
            <Alert severity={this.state.message.severity}>
              <AlertTitle>{this.state.message.title}</AlertTitle>
              {this.state.message.text}
            </Alert>
          ) : null
        }
        <DragDropContext onDragEnd={this.onDragEnd}>
          <div className="control-board-container">
            {this.state.columnOrder.map((columnId) => {
              let hideColumn;
              const column = this.state.columns[columnId];

              if (!this.state.showNotApplicable && column.title == 'Not applicable') {
                hideColumn = true;
              } else {
                hideColumn = false;
              }

              const controls = column.controlIds.map((controlId) => {
                return { ...this.state.controls[controlId] };
              });

              return (
                <div
                  className={`column-container ${this.state.showNotApplicable ? "narrow" : "wide"}`}
                  key={column.id}
                  style={{ display: hideColumn ? "none" : "" }}
                >
                  <Column
                    column={column}
                    controls={controls}
                    informationText={informationTextData[column.title]}
                  />
                </div>
              );
            })}
          </div>
        </DragDropContext>
      </>
    );
  }
}
