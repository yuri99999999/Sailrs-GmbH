
import { Action }             from 'typescript-fsa';
import { Dispatch }           from 'redux';
import { TaskRecord,
         ConfirmDialogProps,
         AppState }           from '../types';
import { AppEventsActions as AppEventsActions_,
         appEventsActions }   from '../actions/AppEventsActions';
import { CalendarActions as CalendarActions_,
         calendarActions }    from '../actions/CalendarActions';
import { TaskBoardActions as TaskBoardActions_,
         taskBoardActions }   from '../actions/TaskBoardActions';



export type AppEventsActions = AppEventsActions_;
export type CalendarActions = CalendarActions_;
export type TaskBoardActions = TaskBoardActions_;


export function mapDispatchToProps(dispatch: Dispatch<Action<any>>) {
    return {
        showToday: () =>
            dispatch(calendarActions.showToday()),
        showNextMonth: () =>
            dispatch(calendarActions.showNextMonth()),
        showPreviousMonth: () =>
            dispatch(calendarActions.showPreviousMonth()),
        showNextYear: () =>
            dispatch(calendarActions.showNextYear()),
        showPreviousYear: () =>
            dispatch(calendarActions.showPreviousYear()),

        // from AppEventsActions
        showAlertDialog: (v: ConfirmDialogProps) =>
            dispatch(appEventsActions.showAlertDialog(v)),
        closeAlertDialog: () =>
            dispatch(appEventsActions.closeAlertDialog()),

        // from TaskManagementActions
        changeActiveBoard: (boardId: string) =>
            dispatch(taskBoardActions.startChangeActiveBoard(Object.assign({}, { boardId }, { dispatch }))),
        updateBoardName: (v: {boardId: string, boardName: string}) =>
            dispatch(taskBoardActions.startUpdateBoardName(v)),
        updateSticky: (v: TaskRecord) =>
            dispatch(taskBoardActions.startUpdateSticky(Object.assign({}, v, { dispatch }))),
        archiveSticky: (taskId: string) =>
            dispatch(taskBoardActions.startArchiveSticky({ taskId })),
        unarchiveSticky: (taskId: string) =>
            dispatch(taskBoardActions.startUnarchiveSticky({ taskId })),
        deleteSticky: (taskId: string) =>
            dispatch(taskBoardActions.startDeleteSticky(Object.assign({}, { taskId }, { dispatch }))),
    }
}


export function mapStateToProps(appState: AppState) {
    return Object.assign({}, { taskBoardState: appState.taskBoard }, appState.calendar);
}
