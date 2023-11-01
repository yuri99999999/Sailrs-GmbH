
import actionCreatorFactory,
       { Action }                  from 'typescript-fsa';
import { TaskBoardState,
         TaskBoardRecord,
         TaskRecord,
         UpdateStickyLanesPayload,
         ConfirmDialogProps }      from '../types';

export interface TaskBoardActions {
    addBoard: (boardName: string) =>
        Action<{boardName: string}>;
    changeActiveBoard: (id: string) =>
        Action<{boardId: string}>;
    updateBoardName: (v: {boardId: string, boardName: string}) =>
        Action<{boardId: string, boardName: string}>;
    deleteBoard: (id: string) =>
        Action<{boardId: string}>;

    addSticky: () =>
        Action<{}>;
    updateSticky: (v: TaskRecord) =>
        Action<TaskRecord>;
    updateStickyLanes: (v: UpdateStickyLanesPayload) =>
        Action<UpdateStickyLanesPayload>;
    archiveSticky: (taskId: string) =>
        Action<{taskId: string}>;
    unarchiveSticky: (taskId: string) =>
        Action<{taskId: string}>;
    deleteSticky: (taskId: string) =>
        Action<{taskId: string}>;

    editBoardAndStickys: (v: TaskBoardRecord) =>
        Action<TaskBoardRecord>;

    refreshActiveBoard: () =>
        Action<{}>;

    // from AppEventsActions
    showAlertDialog: (v: ConfirmDialogProps) =>
        Action<ConfirmDialogProps>;
    closeAlertDialog: () =>
        Action<void>;
}


const actionCreator = actionCreatorFactory();


const addBoard =
    actionCreator.async<{boardName: string}, TaskBoardState, Error>('ACTIONS_ADD_BOARD');
const changeActiveBoard =
    actionCreator.async<{boardId: string}, TaskBoardState, Error>('ACTIONS_CHANGE_ACTIVE_BOARD');
const updateBoardName =
    actionCreator.async<{boardId: string, boardName: string}, TaskBoardState, Error>('ACTIONS_UPDATE_BOARD_NAME');
const deleteBoard =
    actionCreator.async<{boardId: string}, TaskBoardState, Error>('ACTIONS_DELETE_BOARD');

const addSticky =
    actionCreator.async<{}, TaskBoardState, Error>('ACTIONS_ADD_STICKY');
const updateSticky =
    actionCreator.async<TaskRecord, TaskBoardState, Error>('ACTIONS_UPDATE_STICKY');
const updateStickyLanes =
    actionCreator.async<UpdateStickyLanesPayload, TaskBoardState, Error>('ACTIONS_UPDATE_STICKY_LANES');
const archiveSticky =
    actionCreator.async<{taskId: string}, TaskBoardState, Error>('ACTIONS_ARCHIVE_STICKY');
const unarchiveSticky =
    actionCreator.async<{taskId: string}, TaskBoardState, Error>('ACTIONS_UNARCHIVE_STICKY');
const deleteSticky =
    actionCreator.async<{taskId: string}, TaskBoardState, Error>('ACTIONS_DELETE_STICKY');

const editBoardAndStickys =
    actionCreator.async<TaskBoardRecord, TaskBoardState, Error>('ACTIONS_EDIT_BOARD_AND_STICKYS');

const refreshActiveBoard =
    actionCreator.async<{}, TaskBoardState, Error>('ACTIONS_REFRESH_ACTIVE_BOARD');


export const taskBoardActions = {
    startAddBoard: addBoard.started,
    doneAddBoard: addBoard.done,
    failedAddBoard: addBoard.failed,

    startChangeActiveBoard: changeActiveBoard.started,
    doneChangeActiveBoard: changeActiveBoard.done,
    failedChangeActiveBoard: changeActiveBoard.failed,

    startUpdateBoardName: updateBoardName.started,
    doneUpdateBoardName: updateBoardName.done,
    failedUpdateBoardName: updateBoardName.failed,

    startDeleteBoard: deleteBoard.started,
    doneDeleteBoard: deleteBoard.done,
    failedDeleteBoard: deleteBoard.failed,

    startAddSticky: addSticky.started,
    doneAddSticky: addSticky.done,
    failedAddSticky: addSticky.failed,

    startUpdateSticky: updateSticky.started,
    doneUpdateSticky: updateSticky.done,
    failedUpdateSticky: updateSticky.failed,

    startUpdateStickyLanes: updateStickyLanes.started,
    doneUpdateStickyLanes: updateStickyLanes.done,
    failedUpdateStickyLanes: updateStickyLanes.failed,

    startArchiveSticky: archiveSticky.started,
    doneArchiveSticky: archiveSticky.done,
    failedArchiveSticky: archiveSticky.failed,

    startUnarchiveSticky: unarchiveSticky.started,
    doneUnarchiveSticky: unarchiveSticky.done,
    failedUnarchiveSticky: unarchiveSticky.failed,

    startDeleteSticky: deleteSticky.started,
    doneDeleteSticky: deleteSticky.done,
    failedDeleteSticky: deleteSticky.failed,

    startEditBoardAndStickys: editBoardAndStickys.started,
    doneEditBoardAndStickys: editBoardAndStickys.done,
    failedEditBoardAndStickys: editBoardAndStickys.failed,

    startRefreshActiveBoard: refreshActiveBoard.started,
    doneRefreshActiveBoard: refreshActiveBoard.done,
    failedRefreshActiveBoard: refreshActiveBoard.failed,
};
