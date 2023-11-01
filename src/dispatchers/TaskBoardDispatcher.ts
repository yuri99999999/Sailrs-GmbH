
import { Action }             from 'typescript-fsa';
import { Dispatch }           from 'redux';
import { TaskBoardRecord,
         TaskRecord,
         UpdateStickyLanesPayload,
         ConfirmDialogProps,
         AppState }           from '../types';
import { AppEventsActions as AppEventsActions_,
         appEventsActions }   from '../actions/AppEventsActions';
import { TaskBoardActions as TaskBoardActions_,
         taskBoardActions }   from '../actions/TaskBoardActions';



export type AppEventsActions = AppEventsActions_;
export type TaskBoardActions = TaskBoardActions_;


export function mapDispatchToProps(dispatch: Dispatch<Action<any>>) {
    return {
        addBoard: (boardName: string) =>
            dispatch(taskBoardActions.startAddBoard({ boardName })),
        changeActiveBoard: (boardId: string) =>
            dispatch(taskBoardActions.startChangeActiveBoard({ boardId })),
        updateBoardName: (v: {boardId: string, boardName: string}) =>
            dispatch(taskBoardActions.startUpdateBoardName(v)),
        deleteBoard: (boardId: string) =>
            dispatch(taskBoardActions.startDeleteBoard({ boardId })),

        addSticky: () =>
            dispatch(taskBoardActions.startAddSticky({})),
        updateSticky: (v: TaskRecord) =>
            dispatch(taskBoardActions.startUpdateSticky(v)),
        updateStickyLanes: (v: UpdateStickyLanesPayload) =>
            dispatch(taskBoardActions.startUpdateStickyLanes(v)),
        archiveSticky: (taskId: string) =>
            dispatch(taskBoardActions.startArchiveSticky({ taskId })),
        unarchiveSticky: (taskId: string) =>
            dispatch(taskBoardActions.startUnarchiveSticky({ taskId })),
        deleteSticky: (taskId: string) =>
            dispatch(taskBoardActions.startDeleteSticky({ taskId })),

        editBoardAndStickys: (v: TaskBoardRecord) =>
            dispatch(taskBoardActions.startEditBoardAndStickys(v)),

        refreshActiveBoard: () =>
            dispatch(taskBoardActions.startRefreshActiveBoard({})),

        // from AppEventsActions
        showAlertDialog: (v: ConfirmDialogProps) =>
            dispatch(appEventsActions.showAlertDialog(v)),
        closeAlertDialog: () =>
            dispatch(appEventsActions.closeAlertDialog()),
    };
}


export function mapStateToProps(appState: AppState) {
    return Object.assign({}, appState.taskBoard);
}
