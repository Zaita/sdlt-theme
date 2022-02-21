import React, { useState } from 'react'
import chevronRightIcon from "../../../img/icons/chevron-right-link.svg";

function TableAccordion({
  approvedBy,
  links,
  statusIcon,
  status,
  pa,
  taskName,
  taskType,
  timeToComplete,
  timeToReview,
  canTaskCreateNewTasks,
  prettifyStatus,
  unfinshedRQTaskMessage,
  uuid
}) {

  const [expanded, setExpanded] = useState(false)

  const handleClick = () => {
    setExpanded(!expanded)
  }

  return (
    <React.Fragment key={uuid}>
      <tr  className='tr-accordion' onClick={handleClick}>
        <td colSpan={6}>
          <div className='task-table-title-data'>
            <img alt='chevron' className={expanded ? 'td-chevron rotate' : 'td-chevron'} src={chevronRightIcon} />
            {pa}
          </div>
        </td>
      </tr>
      <tr className={expanded ? 'tr-expanded' : 'tr-hidden'}>
        <td className="tr-taskName">
          {taskName}
          {canTaskCreateNewTasks ? (<span className='multiple-tasks-created'> *</span>) : null}
        </td>
        <td>{timeToComplete}</td>
        <td>{approvedBy}</td>
        <td>{timeToReview}</td>
        <td>
          <img src={statusIcon} />
          <span className="task-status">{prettifyStatus(status)}</span>
        </td>
        <td>
          {unfinshedRQTaskMessage && taskType === 'security risk assessment' ? null : links}
        </td>
      </tr>
    </React.Fragment>
  )
}

export default TableAccordion
