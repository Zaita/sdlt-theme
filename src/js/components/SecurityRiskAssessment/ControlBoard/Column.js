import React, { Component } from 'react'
import { Droppable } from 'react-beautiful-dnd';
import ControlCard from './ControlCard'
import InformationTooltip from './InformationTooltip'
import OpenWithIcon from '@material-ui/icons/OpenWith';

// optimization
class InnerList extends React.Component {
  shouldComponentUpdate(nextProps) {
    if (nextProps.tasks === this.props.tasks) {
      return false
    }
    return true
  }
  render() {
    return this.props.tasks.map((task, index) => (
      <ControlCard key={task.id} task={task} index={index} />
    ))
  }
}

export default class Column extends Component {
  render() {

    let columnIsEmpty
    if (this.props.tasks.length === 0) {
      columnIsEmpty = (
        <div className='empty-column-text'>
          <OpenWithIcon className='directional-drag-arrow' />
          <p>Click and drag a control to move it into '{this.props.column.title}'.</p>
        </div>
      )
    }

    return (
      <>
        <div className='column-header'>
          <h5 className='column-title'>{this.props.column.title}</h5>
          <InformationTooltip columnInformation={this.props.informationText} />
        </div>
        <div className={columnIsEmpty ? 'dotted-border column-card-list' : 'column-card-list'}>
          <Droppable droppableId={this.props.column.id}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                style={{ backgroundColor: snapshot.isDraggingOver ? 'grey' : '#efefef' }}
                {...provided.droppableProps}
              >
                {columnIsEmpty}
                <InnerList tasks={this.props.tasks} columnTitle={this.props.column.title} />
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>
      </>
    )
  }
}
