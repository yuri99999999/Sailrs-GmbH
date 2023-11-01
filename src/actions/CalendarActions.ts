
import actionCreatorFactory,
       { Action }             from 'typescript-fsa';
import { TaskRecord,
         ConfirmDialogProps } from '../types';

export interface CalendarActions {
    showToday: () =>
        Action<void>;
    showNextMonth: () =>
        Action<void>;
    showPreviousMonth: () =>
        Action<void>;
    showNextYear: () =>
        Action<void>;
    showPreviousYear: () =>
        Action<void>;

    // from TaskManagementActions
    changeActiveBoard: (id: string) =>
        Action<{boardId: string}>;
    updateBoardName: (v: {boardId: string, boardName: string}) =>
        Action<{boardId: string, boardName: string}>;
    updateSticky: (v: TaskRecord) =>
        Action<TaskRecord>;
    archiveSticky: (taskId: string) =>
        Action<{taskId: string}>;
    unarchiveSticky: (taskId: string) =>
        Action<{taskId: string}>;
    deleteSticky: (taskId: string) =>
        Action<{taskId: string}>;

    // from AppEventsActions
    showAlertDialog: (v: ConfirmDialogProps) =>
        Action<ConfirmDialogProps>;
    closeAlertDialog: () =>
        Action<void>;
}


const actionCreator = actionCreatorFactory();

export const calendarActions = {
    showToday: actionCreator<void>('ACTIONS_SHOW_TODAY'),
    showNextMonth: actionCreator<void>('ACTIONS_SHOW_NEXT_MONTH'),
    showPreviousMonth: actionCreator<void>('ACTIONS_SHOW_PREVIOUS_MONTH'),
    showNextYear: actionCreator<void>('ACTIONS_SHOW_NEXT_YEAR'),
    showPreviousYear: actionCreator<void>('ACTIONS_SHOW_PREVIOUS_YEAR'),
};
