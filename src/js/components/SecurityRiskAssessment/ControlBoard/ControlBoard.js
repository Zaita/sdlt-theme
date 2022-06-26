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
import InformationTooltip from '../../Common/InformationTooltip';
import SearchIcon from '../../../../img/icons/search-icon.svg';
import ControlBoardUtil from '../../../utils/ControlBoardUtil';

type Props = {
  notApplicableInformationText: string,
  notImplementedInformationText: string,
  plannedInformationText: string,
  implementedInformationText: string,
  productName: string,
  productAspect: string,
  sraTaskName: string,
  sraTaskSubmissionUUID: string,
  cvaTaskSubmissionUUID: string,
  secureToken: string,
  questionnaireSubmissionUUID: string,
  comingFrom: string,
  sraData: object,
  scoresAndPaneltiesObj: object,
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
    searchKeywords: '',
    selectedRiskCategory: 'All',
    sortBy: 'Alphabetical (A-Z)',
    unorderedColumns: initialData.columns
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

      // persist sorting order moving from one list to another
      this.setState({ controls }, () => {
        if (this.state.sortBy === "None") {
          const columnsCopy = { ...this.state.columns };
          this.setState ({ unorderedColumns: columnsCopy }, () => {
            this.handleSearch();
          })
        } else {
          this.handleSearch();
        }
      });

      if (!this.state.message) {
        const columns = this.addControlsToColumns(controls);
        this.setState({ columns });
      }
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

  updateSelectedRiskCategory = (event) => {
    this.setState({ selectedRiskCategory: event.target.value }, () =>
      this.handleSearch()
    );
  };

  updateSortByOption = (event) => {
    this.setState ({ sortBy: event.target.value }, () => {
      this.handleSearch()
    });
  };

  filterSelectedRiskCategory = (controlsArray) => {
    const { selectedRiskCategory } = this.state;

    if (selectedRiskCategory == "All") {
      return controlsArray;
    } else {
      return Object.fromEntries(
        Object.entries(controlsArray).filter((item) => {
          const riskCategories = item[1].riskCategories;
          return riskCategories.some(
            (riskCategory) =>
              riskCategory.name.toLowerCase() ===
              selectedRiskCategory.toLowerCase()
          );
        })
      );
    }
  };

  filterSearchKeywords = (controlsArray) => {
    const { searchKeywords } = this.state;

    return Object.fromEntries(
      Object.entries(controlsArray).filter((control) =>
        control[1].name.toLowerCase().includes(searchKeywords.toLowerCase())
      )
    );
  }

  sortControls(controlsArray) {
    const { sortBy } = this.state;
    let sortedControls = [];

    switch (sortBy) {
      case "Alphabetical (A-Z)":
        sortedControls = ControlBoardUtil.sortByAscending(controlsArray);
        break;
      case "Alphabetical (Z-A)":
        sortedControls = ControlBoardUtil.sortByDescending(controlsArray);
        break;
      case "Key controls first":
        sortedControls = ControlBoardUtil.sortByKeyControlsFirst(controlsArray);
        break;
      case "Effectiveness":
        sortedControls = ControlBoardUtil.sortByEffectiveness(controlsArray);
        break;
      case "Evidence added":
        sortedControls = ControlBoardUtil.sortByEvidenceAdded(controlsArray);
        break;
      case "Number of risk categories":
        sortedControls = ControlBoardUtil.sortByNumberOfRiskCategories(controlsArray);
        break;
      default:
        sortedControls = controlsArray;
    }

    return sortedControls
  };

  handleSearch = () => {
    const controlsCopy = { ...this.state.controls };
    let result = this.filterSearchKeywords(controlsCopy);
    result = this.filterSelectedRiskCategory(result);
    result = this.sortControls(result);

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
      this.setState({ isFilteringDisabled: false });
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
        },
        isFilteringDisabled: false
      };

      this.setState(newState, () => {
        if (this.state.sortBy === "None") {
          const columnsCopy = { ...this.state.columns };
          this.setState({ unorderedColumns: columnsCopy });
        } else {
          this.handleSearch();
        }
      });

      return;
    }

    // moving from one list to another
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
      const scoresAndPaneltiesObjForComponent = this.props.scoresAndPaneltiesObj[securityComponentObj.id];
      const securityComponentName = securityComponentObj.name;
      const controlsArray = securityComponentObj.controls;
      controlsArray.map(({id, ...control}) => {
        const uniqeKey = securityComponentName + "-{" + securityComponentObj.id + "}_"
          + control.name + "-{" + id + "}";
        const scoresAndPaneltiesObjForControl = scoresAndPaneltiesObjForComponent ? scoresAndPaneltiesObjForComponent[id]: [];
        const key = uniqeKey.replace(/ /g,"_");
        controls = {
          ...controls,
          [key]: {
            id: key,
            scoresAndPanelties: scoresAndPaneltiesObjForControl,
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
    let columns = this.addControlsToColumns(controlsCopy);

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

    // persist 'none' sort by order when switching between sorts
    if (this.state.sortBy === "None") {
      columns = ControlBoardUtil.sortByNone(
        this.state.columnOrder,
        columns,
        this.state.unorderedColumns
      );
    }

    this.setState({ columns });
  }

  render() {
    const {
      notApplicableInformationText,
      notImplementedInformationText,
      plannedInformationText,
      implementedInformationText,
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
      sraData,
      scoresAndPaneltiesObj
    } = { ...this.props };

    const informationTextData = {
      'Not applicable': notApplicableInformationText,
      'Not implemented': notImplementedInformationText,
      'Planned': plannedInformationText,
      'Implemented': implementedInformationText
    }

    let noSearchResults;
    if (this.state.columns === initialData.columns) {
      noSearchResults = (
        <div className="no-search-results-container">
          <div className="column-header-container">
            {this.state.columnOrder.map((columnId) => {
              const column = this.state.columns[columnId];
              return (
                <div
                  className="column-header"
                  key={column.id}
                  style={{
                    display: !this.state.showNotApplicable && column.title == 'Not applicable' ? "none" : ""
                  }}
                >
                  <h5 className="column-title">{column.title}</h5>
                  <InformationTooltip content={informationTextData[column.title]}/>
                </div>
              );
          })}
          </div>
          <div className="no-search-results-message-container">
            <img src={SearchIcon} alt="search icon"/>
            <h4>No results found</h4>
            <span className="no-search-results-message">
              There are no controls that match your search. Try adjusting your
              search and filter criteria.
            </span>
          </div>
        </div>
      )
    }

    return (
      <>
        <BoardFilters
          toggleNotApplicable={this.toggleNotApplicable}
          updateSearchKeywords={this.updateSearchKeywords}
          updateSelectedRiskCategory={this.updateSelectedRiskCategory}
          updateSortByOption={this.updateSortByOption}
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
            {noSearchResults ? noSearchResults :  ''}

            {this.state.columnOrder.map((columnId) => {
              let hideColumn;
              const column = this.state.columns[columnId];

              if (!this.state.showNotApplicable && column.title == 'Not applicable' || noSearchResults) {
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
                    cvaTaskSubmissionUUID={cvaTaskSubmissionUUID}
                    productName={productName}
                    productAspect={productAspect}
                    questionnaireSubmissionUUID={questionnaireSubmissionUUID}
                    sraTaskSubmissionUUID={sraTaskSubmissionUUID}
                    sraTaskName={sraTaskName}
                    secureToken={secureToken}
                    showSubmissionBreadcrumb={showSubmissionBreadcrumb}
                    showApprovalBreadcrumb={showApprovalBreadcrumb}
                    comingFrom={comingFrom}
                    informationText={informationTextData[column.title]}
                    sraData={sraData}
                    scoresAndPaneltiesObj={scoresAndPaneltiesObj}
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
