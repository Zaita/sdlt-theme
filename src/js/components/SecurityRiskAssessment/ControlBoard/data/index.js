const initialData = {
  tasks: {
    'task-1': { id: 'task-1', title: 'Input validation and sanitisation', riskCategories: ['Information Disclosure', 'Information Disclosure', 'Information Disclosure'], keyControl: true, evidenceAdded: false, evidenceRating: 'Not Validated'},
    'task-2': { id: 'task-2', title: 'Logging and auditing', riskCategories: ['Information Disclosure', 'Information Disclosure'], keyControl: false, evidenceAdded: false, evidenceRating: 'Partially Effective'},
    'task-3': { id: 'task-3', title: 'Malware protection', riskCategories: ['Information Disclosure', 'Information Disclosure', 'Information Disclosure'], keyControl: false, evidenceAdded: false, evidenceRating: 'Not Validated'},
    'task-4': { id: 'task-4', title: 'Separation of duties', riskCategories: ['Information Disclosure', 'Information Disclosure', 'Information Disclosure'], keyControl: false, evidenceAdded: false, evidenceRating: 'Effective'},
    'task-5': { id: 'task-5', title: 'Disaster recovery plan', riskCategories: ['Information Loss', 'Information Loss'], keyControl: false, evidenceAdded: false, evidenceRating: 'Partially Effective'},
    'task-6': { id: 'task-6', title: 'Input validation and sanitisation', riskCategories: ['Information Disclosure', 'Information Disclosure', 'Information Disclosure'], keyControl: true, evidenceAdded: false, evidenceRating: 'Not Effective'},
    'task-7': { id: 'task-7', title: 'Logging and auditing', riskCategories: ['Information Disclosure', 'Information Disclosure', 'Information Disclosure'], keyControl: false, evidenceAdded: false, evidenceRating: 'Not Validated'},
    'task-8': { id: 'task-8', title: 'Malware protection', riskCategories: ['Information Disclosure', 'Information Disclosure', 'Information Disclosure'], keyControl: false, evidenceAdded: false, evidenceRating: 'Partially Effective'},
    'task-9': { id: 'task-9', title: 'Separation of duties', riskCategories: ['Information Disclosure', 'Information Disclosure', 'Information Disclosure'], keyControl: true, evidenceAdded: false, evidenceRating: 'Not Effective'},
    'task-10': { id: 'task-10', title: 'Disaster recovery plan', riskCategories: ['Information Loss', 'Information Loss'], keyControl: true, evidenceAdded: false, evidenceRating: 'Partially Effective'}
  },
  columns: {
    'column-1': {
      id: 'column-1',
      title: 'Not Applicable',
      taskIds: ['task-1', 'task-2', 'task-3', 'task-4', 'task-5', 'task-6', 'task-7', 'task-8', 'task-9', 'task-10']
    },
    'column-2': {
      id: 'column-2',
      title: 'Not Implemented',
      taskIds: []
    },
    'column-3': {
      id: 'column-3',
      title: 'Planned',
      taskIds: []
    },
    'column-4': {
      id: 'column-4',
      title: 'Implemented',
      taskIds: []
    },
  },

  columnOrder: ['column-1', 'column-2', 'column-3', 'column-4'],
}

export default initialData
