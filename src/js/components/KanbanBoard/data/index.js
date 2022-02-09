const initialData = {
    tasks: {
        'task-1': { id: 'task-1', title: 'Input validation and sanitisation', riskCategory: 'Information Disclosure', weight: 1 },
        'task-2': { id: 'task-2', title: 'Logging and auditing', riskCategory: 'Information Disclosure', weight: 5, },
        'task-3': { id: 'task-3', title: 'Malware protection', riskCategory: 'Information Disclosure', weight: 5, },
        'task-4': { id: 'task-4', title: 'Separation of duties', riskCategory: 'Information Disclosure', weight: 1, },
        'task-5': { id: 'task-5', title: 'Disaster recovery plan', riskCategory: 'Information Loss', weight: 5 },
        'task-6': { id: 'task-6', title: 'Input validation and sanitisation', riskCategory: 'Information Disclosure', weight: 1 },
        'task-7': { id: 'task-7', title: 'Logging and auditing', riskCategory: 'Information Disclosure', weight: 5, },
        'task-8': { id: 'task-8', title: 'Malware protection', riskCategory: 'Information Disclosure', weight: 5, },
        'task-9': { id: 'task-9', title: 'Separation of duties', riskCategory: 'Information Disclosure', weight: 1, },
        'task-10': { id: 'task-10', title: 'Disaster recovery plan', riskCategory: 'Information Loss', weight: 5 }
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
