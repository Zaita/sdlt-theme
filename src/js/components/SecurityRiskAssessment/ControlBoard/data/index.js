import {
  CTL_STATUS_1,
  CTL_STATUS_2,
  CTL_STATUS_3,
  CTL_STATUS_4,
} from '../../../../constants/values.js';

export const initialData = {
  columns: {
    'column-1': {
      id: 'column-1',
      title: 'Not applicable',
      controlIds: []
    },
    'column-2': {
      id: 'column-2',
      title: 'Not implemented',
      controlIds: []
    },
    'column-3': {
      id: 'column-3',
      title: 'Planned',
      controlIds: []
    },
    'column-4': {
      id: 'column-4',
      title: 'Implemented',
      controlIds: []
    },
  },
  columnOrder: ['column-1', 'column-2', 'column-3', 'column-4'],
}

export const selectedOptionData = {
  'Not applicable': CTL_STATUS_3,
  'Not implemented': CTL_STATUS_2,
  'Planned': CTL_STATUS_4,
  'Implemented': CTL_STATUS_1
};

// controls dummy data example
  // controls: {
  //   'control-1': { id: 'control-1', title: 'Input validation and sanitisation', riskCategories: ['Information Disclosure', 'Information Disclosure', 'Information Disclosure'], keyControl: true, evidenceAdded: false, evidenceRating: 'Not Validated' },
  //   'control-2': { id: 'control-2', title: 'Logging and auditing', riskCategories: ['Information Disclosure', 'Information Disclosure'], keyControl: false, evidenceAdded: false, evidenceRating: 'Partially Effective' },
  //   'control-3': { id: 'control-3', title: 'Malware protection', riskCategories: ['Information Disclosure', 'Information Disclosure', 'Information Disclosure'], keyControl: false, evidenceAdded: false, evidenceRating: 'Not Validated' },
  //   'control-4': { id: 'control-4', title: 'Separation of duties', riskCategories: ['Information Disclosure', 'Information Disclosure', 'Information Disclosure'], keyControl: false, evidenceAdded: false, evidenceRating: 'Effective' },
  //   'control-5': { id: 'control-5', title: 'Disaster recovery plan', riskCategories: ['Information Loss', 'Information Loss'], keyControl: false, evidenceAdded: false, evidenceRating: 'Partially Effective' },
  //   'control-6': { id: 'control-6', title: 'Input validation and sanitisation', riskCategories: ['Information Disclosure', 'Information Disclosure', 'Information Disclosure'], keyControl: true, evidenceAdded: false, evidenceRating: 'Not Effective' },
  //   'control-7': { id: 'control-7', title: 'Logging and auditing', riskCategories: ['Information Disclosure', 'Information Disclosure', 'Information Disclosure'], keyControl: false, evidenceAdded: false, evidenceRating: 'Not Validated' },
  //   'control-8': { id: 'control-8', title: 'Malware protection', riskCategories: ['Information Disclosure', 'Information Disclosure', 'Information Disclosure'], keyControl: false, evidenceAdded: false, evidenceRating: 'Partially Effective' },
  //   'control-9': { id: 'control-9', title: 'Separation of duties', riskCategories: ['Information Disclosure', 'Information Disclosure', 'Information Disclosure'], keyControl: true, evidenceAdded: false, evidenceRating: 'Not Effective' },
  //   'control-10': { id: 'control-10', title: 'Disaster recovery plan', riskCategories: ['Information Loss', 'Information Loss'], keyControl: true, evidenceAdded: false, evidenceRating: 'Partially Effective' }
  // }
