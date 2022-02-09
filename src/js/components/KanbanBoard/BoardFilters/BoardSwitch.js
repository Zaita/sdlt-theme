import { Switch } from '@material-ui/core'
import React, { Component } from 'react'

export default class BoardSwitch extends Component {
    render() {
        return (
            <div>
                <Switch
                    // checked={state.checkedB}
                    color="primary"
                    name="checkedB"
                    inputProps={{ 'aria-label': 'primary checkbox' }}
                />
            </div>
        )
    }
}
