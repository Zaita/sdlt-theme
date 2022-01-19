import React, { Component } from 'react'
import { Draggable } from 'react-beautiful-dnd'
import { Card, IconButton } from '@material-ui/core'
import ChevronRightIcon from '@material-ui/icons/ChevronRight';

export default class CardItem extends Component {
    render() {

    const { title, riskCategory, weight, id } = this.props.task

        return (
            <Draggable draggableId={this.props.task.id} index={this.props.index}>
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
                                    {/* <p className="card-key-control">⭐</p> */}
                                    <h4 className="card-title">{title}</h4>
                                    <div className="card-chevron">
                                        <IconButton aria-label="show more">
                                            <ChevronRightIcon />
                                        </IconButton>
                                    </div>
                                </div>
                                <div className="card-footer">
                                    <p className="card-risk-category">{riskCategory}</p>
                                    <h5 className="card-weight">+{weight}</h5>
                                </div>
                            </div>
                        </Card>
                    )

                }}
            </Draggable>
        )
    }
}