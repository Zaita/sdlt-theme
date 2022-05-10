// @flow
import React, { Component } from 'react';
import { DragDropContext } from 'react-beautiful-dnd';
import { initialData, selectedOptionData } from './data/index';
import Column from './Column';
import BoardFilters from './BoardFilters/BoardFilters';
import Alert from '@material-ui/lab/Alert';
import AlertTitle from '@material-ui/lab/AlertTitle';
import { cloneDeep } from 'lodash';
import { Snackbar } from '@material-ui/core';
import CheckCircle from '@material-ui/icons/CheckCircle';

type Props = {
  notApplicableInformationText: string,
  notImplementedInformationText: string,
  plannedInformationText: string,
  implementedInformationText: string,
  productAspect: string,
  dispatchUpdateCVAControlStatus?: (selectedOptionDetail: object) => void
}

export default class Board extends Component<Props> {
  state = {
    controls: [],
    columns: initialData.columns,
    columnOrder: initialData.columnOrder,
    showNotApplicable: true,
    message: null,
    isFilteringDisabled: false,
    searchKeywords: null
  }

  componentDidMount() {
    const controls = this.getControlsDataset();
    const columns = this.addControlsToColumns(controls);
    this.setState({ controls });
    this.setState({ columns });
  }

  componentDidUpdate(prevProps) {
    if (this.props.selectedControls !== prevProps.selectedControls) {
      const controls = this.getControlsDataset();
      this.setState({ controls });
    }
  }

  toggleNotApplicable = clickEvent => {
    this.setState({ showNotApplicable: clickEvent.target.checked });
  }

  updateSearchKeywords = (event) => {
    this.setState({ searchKeywords: event.target.value.trim() }, () =>
      this.handleSearch()
    );
  };

  handleSearch = () => {
    const { searchKeywords } = this.state;
    const controlsCopy = { ...this.state.controls };

    // reset all column controlIds when search keywords is empty
    if (searchKeywords === "") {
      this.setState({ columns: this.addControlsToColumns(controlsCopy) });
      return;
    }

    // filter control names by the search keywords
    const result = Object.fromEntries(
      Object.entries(controlsCopy).filter((control) =>
        control[1].name.toLowerCase().includes(searchKeywords.toLowerCase())
      )
    );

    // when there are no results, remove all controlIds from columns
    // else update all column controlIds
    if (Object.keys(result).length == 0) {
      this.setState({ columns: initialData.columns });
    } else {
      this.updateControlsInColumns(result);
    }
  }

  onDragStart = () => {
    this.setState({ isFilteringDisabled: true });
  }

  onDragEnd = (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    // check if the location of the draggable element changes.
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      this.setState({ isFilteringDisabled: false });
      return;
    }

    const start = this.state.columns[source.droppableId];
    const finish = this.state.columns[destination.droppableId];

    this.state.message = {
      open: true,
      severity:'success',
      icon: '',
      title:'Changes applied.',
      text:'Your likelihood and impact scores have been updated.',
      anchorOrigin: {
        vertical: 'top',
        horizontal: 'center',
      },
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
      this.setState({ isFilteringDisabled: false });

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

    // save control with updated selected option in the database
    const { cvaTaskSubmissionUUID, productAspect } = this.props;
    const regx = /{\d*}/g;
    const idArray = draggableId.match(regx);

    this.props.dispatchUpdateCVAControlStatus({
      "selectedOption": selectedOptionData[finish.title],
      "controlID": (idArray[1].match(/\d+/g)).pop(),
      "componentID": (idArray[0].match(/\d+/g)).pop(),
      "productAspect": productAspect,
      "uuid": cvaTaskSubmissionUUID
    })

    this.setState({ isFilteringDisabled: false });
  };


  getControlsDataset() {
    if (!this.props.selectedControls.length) {
      return;
    }

    let controls = [];

    this.props.selectedControls.map((securityComponentObj) => {
      const securityComponentName = securityComponentObj.name;
      const controlsArray = securityComponentObj.controls;

      controlsArray.map(({id, ...control}) => {
        const uniqeKey = securityComponentName + "-{" + securityComponentObj.id + "}_"
          + control.name + "-{" + id + "}";
        const key = uniqeKey.replace(/ /g,"_");
        controls = {
          ...controls,
          [key]: {
            id: key,
            ...control
          }
        }
      });
    })

    return controls;
  }

  addControlsToColumns(controls) {
    const columns = cloneDeep(initialData.columns);

    if (!controls) {
      return columns;
    }

    this.state.columnOrder.map((columnId) => {
      const column = columns[columnId];
      const columnControlIdsArray = column.controlIds;

      Object.entries(controls).map((control) => {
        if (control[1].selectedOption === selectedOptionData[column.title]) {
          columnControlIdsArray.push(control[0]);
        }
      });
    })

    return columns;
  }

  updateControlsInColumns(controls) {
    const controlsCopy = { ...this.state.controls };

    // get unfiltered column data
    const columns = this.addControlsToColumns(controlsCopy);

    this.state.columnOrder.map((columnId) => {
      const column = columns[columnId];
      let columnControlIdsArray = column.controlIds;
      let updatedControlIds = [];

      Object.entries(controls).map((control) => {
        if (columnControlIdsArray.includes(control[0])) {
          updatedControlIds.push(control[0]);
        }

        column.controlIds = updatedControlIds;
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
        <BoardFilters
          toggleNotApplicable={this.toggleNotApplicable}
          updateSearchKeywords={this.updateSearchKeywords}
          isFilteringDisabled={this.state.isFilteringDisabled}
        />
        {this.state.message ? (
          <Snackbar
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
          open={this.state.message.open}
          autoHideDuration={5000}
          onClose={() => this.setState({ message: null })}
        >
            <Alert style={{width: '40vw'}} icon={<CheckCircle style={{ color: '#579a36' }}/>}>
              <AlertTitle>{this.state.message.title}</AlertTitle>
              {this.state.message.text}
            </Alert>
            </Snackbar>
          ) : null
        }
        <DragDropContext onDragStart={this.onDragStart} onDragEnd={this.onDragEnd}>
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
