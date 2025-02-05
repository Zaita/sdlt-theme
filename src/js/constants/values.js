// @flow

//this is the highest possible threshold score on the security risk assessment matrix
export const DEFAULT_SRA_MATRIX_THRESHOLD_SCORE = 100;
export const DEFAULT_SRA_UNFINISHED_TASKS_MESSAGE = 'Please complete all tasks to see the Security Risk Assessment';
export const DEFAULT_CVA_CONTROLS_ANSWER_YES = 'Yes';
export const DEFAULT_CVA_CONTROLS_ANSWER_NO = 'No';
export const DEFAULT_CVA_CONTROLS_ANSWER_NOT_APPLICABLE = 'N/A';
export const DEFAULT_CVA_CONTROLS_ANSWER_PLANNED = 'PLANNED';
export const CTL_STATUS_1 = 'Realised';
export const CTL_STATUS_2 = 'Intended';
export const CTL_STATUS_3 = 'Not Applicable';
export const CTL_STATUS_4 = 'Planned';
export const EVALUTION_RATING_1 = 'Not Validated';
export const EVALUTION_RATING_2 = 'Not Effective';
export const EVALUTION_RATING_3 = 'Partially Effective';
export const EVALUTION_RATING_4 = 'Effective';
export const DEFAULT_NO_CONTROLS_MESSAGE = 'There are no controls for the component.';
export const DEFAULT_CVA_UNFINISHED_TASKS_MESSAGE = 'No components have been selected. Please complete the component selection task with at least one component selected.';
export const SRA_IS_FINALISED_MESSAGE = 'The security risk assessment is finalised.  The tasks can no longer be edited and will be included in the Certification and Accreditation Report. If you need to change your task answers, you will need to submit a new questionnaire.';
export const IS_KEY_CONTROL_MESSAGE = 'This is a key control. Penalties will be applied to your Security Risk Assessment if you do not implement this control.';
