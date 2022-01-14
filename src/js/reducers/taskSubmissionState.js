// @flow

import type {TaskSubmissionState} from "../store/TaskSubmissionState";
import type {LoadTaskSubmissionAction, PutDataInTaskSubmissionAction} from "../actions/ActionType";
import ActionType from "../actions/ActionType";
import type {Question} from "../types/Questionnaire";
import cloneDeep from "lodash/cloneDeep";
import set from "lodash/set";
import type {TaskSubmission} from "../types/Task";

const defaultStartState: TaskSubmissionState = {
  taskSubmission: null,
};

export function taskSubmissionState(state: TaskSubmissionState = defaultStartState, action: *): TaskSubmissionState {
  const taskSubmission: TaskSubmission | null = state.taskSubmission;

  if (action.type === ActionType.TASK.LOAD_TASK_SUBMISSION) {
    (action: LoadTaskSubmissionAction);
    return {
      taskSubmission: action.payload,
    };
  }

  if (action.type === ActionType.TASK.LOAD_RESULT_FOR_CERTIFICATION_AND_ACCREDITATION) {
    if (!taskSubmission) {
      return state;
    }

    const {resultForCertificationAndAccreditation} = {...action.payload};
    const newState = cloneDeep(state);

    set(newState, `taskSubmission.resultForCertificationAndAccreditation`, resultForCertificationAndAccreditation);
    return newState;
  }

  if (action.type === ActionType.TASK.PUT_DATA_IN_TASK_SUBMISSION) {
    (action: PutDataInTaskSubmissionAction);
    if (!taskSubmission) {
      return state;
    }
    // Find the matched question
    const answeredQuestion: Question = action.payload;
    const index = taskSubmission.questions.findIndex((question) => {
      return question.id === answeredQuestion.id;
    });
    if (index < 0) {
      return state;
    }

    const newState = cloneDeep(state);
    set(newState, `taskSubmission.questions.${index}`, answeredQuestion);
    return newState;
  }

  if (action.type === ActionType.TASK.MARK_TASK_QUESTION_NOT_APPLICABLE) {
    if (!taskSubmission) {
      return state;
    }
    const newState = cloneDeep(state);

    // Mark questions between target and current to be "not applicable"
    const nonApplicableIndexes = action.payload;
    if (nonApplicableIndexes && nonApplicableIndexes.length > 0) {
      nonApplicableIndexes.forEach(index => {
        const nonApplicableQuestion = taskSubmission.questions[index];
        nonApplicableQuestion.isApplicable = false;
        set(newState, `taskSubmission.questions.${index}`, nonApplicableQuestion);
      });
    }

    return newState;
  }

  if (action.type === ActionType.TASK.MOVE_TO_ANOTHER_TASK_QUESTION) {
    if (!taskSubmission) {
      return state;
    }

    const {currentIndex, targetIndex} = {...action.payload};

    // Don't move when target is wrong
    if (targetIndex < 0 || targetIndex >= taskSubmission.questions.length) {
      return state;
    }

    const newState = cloneDeep(state);

    // Mark current question is not current anymore
    set(newState, `taskSubmission.questions.${currentIndex}.isCurrent`, false);
    // Mark target question to be current
    set(newState, `taskSubmission.questions.${targetIndex}.isCurrent`, true);

    return newState;
  }

  if (action.type === ActionType.TASK.COMPLETE_TASK_SUBMISSION) {
    const newState = cloneDeep(state);
    set(newState, `taskSubmission.status`, "complete");

    if (action.payload) {
      set(newState, `taskSubmission.result`, action.payload);
    }

    return newState;
  }

  if (action.type === ActionType.TASK.EDIT_TASK_SUBMISSION) {
    const newState = cloneDeep(state);
    set(newState, `taskSubmission.status`, "in_progress");
    set(newState, `taskSubmission.result`, null);
    return newState;
  }

  return state;
}
