import React, { Component } from 'react'
import { DragDropContext } from 'react-beautiful-dnd'
import data from './data/index'
import Column from './Column'
import BoardFilters from './BoardFilters/BoardFilters'

export default class Board extends Component {
  state = data

  onDragEnd = (result) => {
    const { destination, source, draggableId } = result

    if (!destination) {
      return
    }

    // check if the location of the draggable element changes.
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return
    }

    const start = this.state.columns[source.droppableId]
    const finish = this.state.columns[destination.droppableId]

    if (start === finish) {
      const newTaskIds = Array.from(start.taskIds)

      // move task id to new index from old index.
      newTaskIds.splice(source.index, 1)

      // start from destination index, remove nothing, and insert the draggableId
      newTaskIds.splice(destination.index, 0, draggableId)

      const newColumn = {
        ...start,
        taskIds: newTaskIds
      }

      // update state to persist the order of the task array (tasks in a column on kanban)
      // e.g. with a backend, call an endpoint after this update to let server know an update has occurred
      const newState = {
        ...this.state,
        columns: {
          ...this.state.columns,
          [newColumn.id]: newColumn,
        }
      }

      this.setState(newState)
      return
    }

    //moving from one list to another
    const startTaskIds = Array.from(start.taskIds)
    startTaskIds.splice(source.index, 1)

    const newStart = {
      ...start,
      taskIds: startTaskIds,
    }

    const finishTaskIds = Array.from(finish.taskIds)
    finishTaskIds.splice(destination.index, 0, draggableId)
    const newFinish = {
      ...finish,
      taskIds: finishTaskIds
    }

    const newState = {
      ...this.state,
      columns: {
        ...this.state.columns,
        [newStart.id]: newStart,
        [newFinish.id]: newFinish,
      }
    }

    this.setState(newState)
  }

  render() {
    return (
      <>
        <BoardFilters />
        <DragDropContext
          onDragEnd={this.onDragEnd}
        >
          <div className='control-board-container'>
            {this.state.columnOrder.map(columnId => {
              const column = this.state.columns[columnId]
              const tasks = column.taskIds.map(taskId => data.tasks[taskId])

              return (
                <div className='column-container'>
                  <Column key={column.id} column={column} tasks={tasks} />
                </div>
              )
            })}
          </div>
        </DragDropContext>
      </>
    )
  }
}
