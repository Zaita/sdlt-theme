import React, { useState } from 'react'
import chevronRightIcon from "../../../img/icons/chevron-right-link.svg";
import {Link} from "react-router-dom";

function TableAccordion({
  approvedBy,
  prettifyStatus,
  getRedirectUrlForTask,
  unfinshedRQTaskMessage,
  taskTableData,
  uuid,
  component,
  tasks,
  token
}) {

  const [expanded, setExpanded] = useState(false)

  const handleClick = () => {
    setExpanded(!expanded)
  }

  return (
    <React.Fragment key={`${component}_${uuid}`}>
      <tr  className='tr-accordion' onClick={handleClick}>
        <td colSpan={6}>
          <div className='task-table-title-data'>
            <img alt='chevron' className={expanded ? 'td-chevron rotate' : 'td-chevron'} src={chevronRightIcon} />
            {component}
          </div>
        </td>
      </tr>
      {
        tasks.map(taskSubmission => {
          const className = (expanded ? 'tr-expanded' : 'tr-hidden');
          return taskTableData(taskSubmission, unfinshedRQTaskMessage, className, component)
        })
      }
    </React.Fragment>
  )
}

export default TableAccordion
