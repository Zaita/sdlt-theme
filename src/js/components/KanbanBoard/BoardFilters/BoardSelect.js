import React, { Component } from 'react'
import { InputLabel, MenuItem, Select } from '@material-ui/core';

export default class BoardSelect extends Component {
    constructor(props) {
        super(props);
        this.state = {value: ''};
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(event) {
        // implement logic to filter kanban
        this.setState({value: event.target.value});
    }

    render() {
        const { label, filterParameters } = this.props
        return (
            <div className='board-select'>
                <InputLabel className="board-filter-label">{label}</InputLabel>
                <Select className="board-select-input" variant="outlined" defaultValue={filterParameters[0].title} onChange={this.handleChange}>
                    {filterParameters.map((parameter) => (
                        <MenuItem key={parameter.id} value={parameter.title}>{parameter.title}</MenuItem>
                    ))}
                </Select>
            </div>
        );
    }
}