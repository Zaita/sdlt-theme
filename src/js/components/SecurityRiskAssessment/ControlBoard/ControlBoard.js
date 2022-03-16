// @flow
import React, { Component } from 'react';
import { DragDropContext } from 'react-beautiful-dnd';
import data from './data/index';
import Column from './Column';
import BoardFilters from './BoardFilters/BoardFilters';

type Props = {
  notApplicableInformationText: string,
  notImplementedInformationText: string,
  plannedInformationText: string,
  implementedInformationText: string
}

export default class Board extends Component<Props> {
  componentDidMount() {
    const defaultControls = this.getControlSetData();
    this.setState({ controls: defaultControls });
  }

  // update state on page reload
  componentDidUpdate(prevProps) {
    if (this.props.cvaTaskData !== prevProps.cvaTaskData) {
      const defaultControls = this.getControlSetData();
      this.setState({ controls: defaultControls });
    }
  }

  state = {
    controls: [],
    columns: data.columns,
    columnOrder: data.columnOrder
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
    console.log(startControlIds);
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
  };

  getControlSetData() {
    let defaultControls = [];

    if (!this.props.cvaTaskData) {
      return;
    }

    if (this.props.component) {
      defaultControls = this.getDefaultControlsWithComponents(defaultControls);
    } else {
      defaultControls = this.getDefaultControlsWithoutComponents(defaultControls);
    }

    this.setDefaultControlsNotApplicableColumn(defaultControls);

    return defaultControls;
  }


  getDefaultControlsWithComponents (defaultControls) {
    this.props.cvaTaskData.map((component) => {
      if (component.productAspect === this.props.component) {
        component.controls.map((control) => {
          defaultControls = {
            ...defaultControls,
            [control.id]: control,
          };
        });
      }
    });

    return defaultControls;
  }

  getDefaultControlsWithoutComponents (defaultControls) {
    this.props.cvaTaskData.map((component) => {
      component.controls.map((control) => {
        defaultControls = {
          ...defaultControls,
          [control.id]: control,
        };
      });
    });

    return defaultControls;
  }

  setDefaultControlsNotApplicableColumn(defaultControls) {
    const controlIds = [];
    const columns = { ...this.state.columns };

    Object.entries(defaultControls).map((control) => {
      controlIds.push(control[0]);
    });

    this.state.columnOrder.map((columnId) => {
      const column = columns[columnId];
      if (column.title === "Not applicable") {
        column.controlIds = controlIds;
        this.setState({ columns });
      }
    });
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
        <BoardFilters />
        <DragDropContext onDragEnd={this.onDragEnd}>
          <div className="control-board-container">
            {this.state.columnOrder.map((columnId) => {
              const column = this.state.columns[columnId];

              const controls = column.controlIds.map((controlId) => {
                return { ...this.state.controls[controlId] };
              });

              return (
                <div className='column-container'>
                  <Column
                    key={column.id}
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
