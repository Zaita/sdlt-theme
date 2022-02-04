import React, { Component } from 'react'
import { Droppable } from 'react-beautiful-dnd';
import Card from './Card'
import InformationModal from './InformationModal'


// optimization
class InnerList extends React.Component {
    shouldComponentUpdate(nextProps) {
        if (nextProps.tasks === this.props.tasks) {
            return false
        }
        return true
    }
    render() {
        return this.props.tasks.map((task, index) =>( 
            <Card key={task.id} task={task} index={index} />
        ))
    }
}

export default class Column extends Component {
    render() {
        
        let columnIsEmpty
        if(this.props.tasks.length === 0) {
            columnIsEmpty = <p>Click and drag a control to move it into {this.props.column.title}.</p>
        }

        return (
            <>
            <div className='column-container'>
                <div className='column-header'>
                    <h3 className='column-title'>{this.props.column.title}</h3>
                    <InformationModal columnInformation={this.props.column.title}/>
                </div>
                    <Droppable droppableId={this.props.column.id}>
                        {(provided, snapshot) => (
                            
                            <div 
                                className='card-list'
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
