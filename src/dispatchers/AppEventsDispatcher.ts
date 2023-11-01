
import { Action }             from 'typescript-fsa';
import { Dispatch }           from 'redux';
import { AppConfig,
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
        showAlertDialog: (v: ConfirmDialogProps) =>
            dispatch(appEventsActions.showAlertDialog(v)),
        closeAlertDialog: () =>
            dispatch(appEventsActions.closeAlertDialog()),

        updateAppConfig: (v: AppConfig) =>
            dispatch(appEventsActions.startUpdateAppConfig(v)),
        resetApplication: () =>
            dispatch(appEventsActions.startResetApplication()),

        // from TaskManagementActions
        changeActiveBoard: (boardId: string) =>
            dispatch(taskBoardActions.startChangeActiveBoard({ boardId })),
        refreshActiveBoard: () =>
            dispatch(taskBoardActions.startRefreshActiveBoard({})),
    }
}


export function mapStateToProps(appState: AppState) {
    return Object.assign({}, appState.appEvents);
}
