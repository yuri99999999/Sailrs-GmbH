
import { reducerWithInitialState,
         ReducerBuilder }         from 'typescript-fsa-reducers';
import { push }                   from 'connected-react-router';
import { TaskBoardState,
         TaskBoardInitialData,
         DocumentWithContents,
         TaskBoardDbRecord,
         TaskBoardDbRecordUserData,
         TaskBoardRecord,
         TaskRecord }             from '../types';
import { appEventsActions }       from '../actions/AppEventsActions';
import { taskBoardActions }       from '../actions/TaskBoardActions';
import { restartSync,
         getLocalDb }             from '../lib/db';
import { formatDate }             from '../lib/datetime';
import { getConstructedAppStore } from '../store';
import { initialData,
         boardNote }              from '../data/initial-data';



let taskBoardReducer: ReducerBuilder<TaskBoardState, TaskBoardState> = null as any;

export async function getTaskBoardReducer() {
    if (!taskBoardReducer) {
        const db = getLocalDb();

        // TODO: try-catch
        let resp: PouchDB.Core.AllDocsResponse<DocumentWithContents> = null as any;

        resp = await db.allDocs({
            include_docs: true,
        });

        if (resp.rows.length === 0) {
            const data: TaskBoardInitialData = initialData as any;

            const postRespBoards = await db.bulkDocs([
                ...data.boards.map(x => Object.assign({}, x, { boardNote })),
            ], {});

            const now = new Date();
            for (const rec of data.records) {
                rec.dueDate = formatDate(now);
                rec.boardId = postRespBoards[0].id as string;
            }
            await db.bulkDocs([
                ...data.records,
            ], {});

            resp = await db.allDocs({
                include_docs: true,
            });
        }

        const boards: TaskBoardRecord[] = resp.rows
            .filter(x => x.doc && x.doc.type === 'taskBoard')
            .map(x => x.doc)
            .sort((a: any, b: any) =>
                String(a.name).toLocaleLowerCase() >= String(b.name).toLocaleLowerCase() ?
                (String(a.name) === String(b.name) ? 0 : 1) : -1) as any;
        for (const board of boards) {
            const records: TaskRecord[] = resp.rows
                .filter(x => x.doc && x.doc.type === 'task' &&
                    (x.doc as TaskRecord).boardId === board._id)
                .map(x => x.doc) as any;
            board.records = records;
        }

        const initialState: TaskBoardState = {
            activeBoard: boards[0],
            boards: boards,
            activeBoardId: boards[0]._id,
            activeBoardIndex: 0,
        };

        const getTaskBoardStateFromDb = async (state: TaskBoardState, boardId: string) => {
            const board = await db.get<TaskBoardRecord>(boardId, {});
            if (! board) {
                return state;
            }
            const records: TaskRecord[] = (await db.find({selector: {
                type: 'task',
                boardId: board._id,
            }})).docs as any;
        
            board.records = records;
            const index = Math.max(0, state.boards.findIndex(x => x._id === board._id));
            const boards = state.boards.slice(0, index).concat(
                [board],
                state.boards.slice(index + 1),
            );

            return (Object.assign({}, state, {
                boards,
                activeBoardId: board._id,
                activeBoard: board,
                activeBoardIndex: index,
            }));
        }

        taskBoardReducer = reducerWithInitialState(initialState)
            //// addBoard async actions ////
            .case(taskBoardActions.startAddBoard, (state, payload) => {
                const data: TaskBoardInitialData = initialData as any;
                const board: TaskBoardDbRecordUserData = {
                    type: 'taskBoard',
                    name: payload.boardName,
                    taskStatuses: data.boards[0].taskStatuses,
                    teamOrStories: data.boards[0].teamOrStories,
                    tags: data.boards[0].tags,
                    displayBarcode: data.boards[0].displayBarcode,
                    displayMemo: data.boards[0].displayMemo,
                    displayFlags: data.boards[0].displayFlags,
                    displayTags: data.boards[0].displayTags,
                    preferArchive: data.boards[0].preferArchive,
                    boardStyle: data.boards[0].boardStyle,
                    calendarStyle: data.boards[0].calendarStyle,
                    boardNote: data.boards[0].boardNote,
                };
                db.post(board, {})
                .then(v => {
                    const saved: TaskBoardRecord = board as any;
                    saved._id = v.id;
                    saved._rev = v.rev;
                    saved.records = [];
                    state.boards = state.boards.concat([saved]);
                    getConstructedAppStore().dispatch(taskBoardActions.doneAddBoard({
                        params: payload,
                        result: Object.assign({}, state, { activeBoardId: v.id, activeBoard: saved }),
                    }));
                    setTimeout(() => {
                        getConstructedAppStore().dispatch(push(`/board/${v.id}`));
                    }, 30);
                })
                .catch(err => {
                    getConstructedAppStore().dispatch(taskBoardActions.failedAddBoard({
                        params: payload,
                        error: err,
                    }));
                    setTimeout(() => {
                        getConstructedAppStore().dispatch(appEventsActions.showAlertDialog({
                            open: true,
                            title: 'Error',
                            message: 'Failed to add board: ' + err.message,
                            singleButton: true,
                            colorIsSecondary: true,
                            onClose: () => getConstructedAppStore().dispatch(appEventsActions.closeAlertDialog()),
                        }));
                    }, 30);
                });
                return state;
            })
            .case(taskBoardActions.doneAddBoard, (state, arg) => {
                setTimeout(() => {
                    restartSync()
                    .then(() => {
                        //
                    }).catch(err => {
                        alert(err.message);
                    })
                }, 1500);
                return arg.result;
            })
            .case(taskBoardActions.failedAddBoard, (state, arg) => {
                return state;
            })

            //// changeActiveBoard async actions ////
            .case(taskBoardActions.startChangeActiveBoard, (state, payload) => {
                (async () => {
                    try {
                        const newState = await getTaskBoardStateFromDb(state, payload.boardId);

                        getConstructedAppStore().dispatch(taskBoardActions.doneChangeActiveBoard({
                            params: payload,
                            result: newState,
                        }));
                    } catch (e) {
                        getConstructedAppStore().dispatch(taskBoardActions.failedChangeActiveBoard({
                            params: payload,
                            error: e,
                        }));
                        setTimeout(() => {
                            getConstructedAppStore().dispatch(appEventsActions.showAlertDialog({
                                open: true,
                                title: 'Error',
                                message: 'Failed to change active board: ' + e.message,
                                singleButton: true,
                                colorIsSecondary: true,
                                onClose: () => {
                                    getConstructedAppStore().dispatch(appEventsActions.closeAlertDialog());
                                    setTimeout(() => {
                                        getConstructedAppStore().dispatch(push(`/board/`));
                                    }, 500);
                                },
                            }));
                        }, 30);
                    }
                })();
                return state;
            })
            .case(taskBoardActions.doneChangeActiveBoard, (state, arg) => {
                return arg.result;
            })
            .case(taskBoardActions.failedChangeActiveBoard, (state, arg) => {
                return state;
            })

            //// updateBoardName async actions ////
            .case(taskBoardActions.startUpdateBoardName, (state, payload) => {
                (async () => {
                    try {
                        const dbBoard = await db.get<TaskBoardRecord>(payload.boardId);
                        if (! dbBoard) {
                            return state;
                        }
                        const records: TaskRecord[] = (await db.find({selector: {
                            type: 'task',
                            boardId: dbBoard._id,
                        }})).docs as any;

                        const change = Object.assign({}, dbBoard, { name: payload.boardName });
                        const saved = await db.put(change, {});

                        change.records = records;
                        change._id = saved.id;
                        change._rev = saved.rev;

                        const index = state.boards.findIndex(x => x._id === payload.boardId);
                        const board = Object.assign({}, state.boards[index] || {}, change);

                        const boards = index >= 0 ?
                            state.boards.slice(0, index).concat(
                                [board],
                                state.boards.slice(index + 1),
                            ) : state.boards;

                            getConstructedAppStore().dispatch(taskBoardActions.doneUpdateBoardName({
                            params: payload,
                            result: Object.assign({}, state, {
                                boards,
                                activeBoardId: board._id,
                                activeBoard: board,
                            }),
                        }));
                    } catch (e) {
                        getConstructedAppStore().dispatch(taskBoardActions.failedUpdateBoardName({
                            params: payload,
                            error: e,
                        }));
                        setTimeout(() => {
                            getConstructedAppStore().dispatch(appEventsActions.showAlertDialog({
                                open: true,
                                title: 'Error',
                                message: 'Failed to change board name: ' + e.message,
                                singleButton: true,
                                colorIsSecondary: true,
                                onClose: () => getConstructedAppStore().dispatch(appEventsActions.closeAlertDialog()),
                            }));
                        }, 30);
                    }
                })();
                return state;
            })
            .case(taskBoardActions.doneUpdateBoardName, (state, arg) => {
                return arg.result;
            })
            .case(taskBoardActions.failedUpdateBoardName, (state, arg) => {
                return state;
            })

            //// deleteBoard async actions ////
            .case(taskBoardActions.startDeleteBoard, (state, payload) => {
                (async () => {
                    try {
                        if (state.boards.length <= 1) {
                            return state;
                        }
                        const dbBoard = await db.get<TaskBoardDbRecord>(payload.boardId);
                        if (! dbBoard) {
                            return state;
                        }

                        const records: TaskRecord[] = (await db.find({selector: {
                            type: 'task',
                            boardId: payload.boardId,
                        }})).docs as any;

                        for (const record of records) {
                            await db.remove(record, {});
                        }

                        await db.remove(dbBoard, {});

                        const activeBoardId = state.activeBoardId === payload.boardId ?
                            state.boards[0]._id : state.activeBoardId;
                        const newState = await getTaskBoardStateFromDb(state, activeBoardId);

                        const index = newState.boards.findIndex(x => x._id === payload.boardId);

                        const boards = index >= 0 ?
                            newState.boards.slice(0, index).concat(
                                newState.boards.slice(index + 1),
                            ) : newState.boards;

                        setTimeout(() => {
                            getConstructedAppStore().dispatch(taskBoardActions.doneDeleteBoard({
                                params: payload,
                                result: Object.assign({}, state, {
                                    boards,
                                    activeBoardId,
                                    activeBoard: newState.activeBoard,
                                    activeBoardIndex: newState.boards.findIndex(x => x._id === activeBoardId),
                                }),
                            }));
                            setTimeout(() => {
                                getConstructedAppStore().dispatch(push(`/board/${activeBoardId}`));
                                setTimeout(() => {
                                    getConstructedAppStore().dispatch(appEventsActions.showAlertDialog({
                                        open: true,
                                        title: 'Done',
                                        message: 'Board is deleted successfully',
                                        singleButton: true,
                                        onClose: () => getConstructedAppStore().dispatch(appEventsActions.closeAlertDialog()),
                                    }));
                                }, 30);
                            }, 30);
                        }, 30);
                    } catch (e) {
                        getConstructedAppStore().dispatch(taskBoardActions.failedDeleteBoard({
                            params: payload,
                            error: e,
                        }));
                        setTimeout(() => {
                            getConstructedAppStore().dispatch(appEventsActions.showAlertDialog({
                                open: true,
                                title: 'Error',
                                message: 'Failed to delete board: ' + e.message,
                                singleButton: true,
                                colorIsSecondary: true,
                                onClose: () => getConstructedAppStore().dispatch(appEventsActions.closeAlertDialog()),
                            }));
                        }, 30);
                    }
                })();
                return state;
            })
            .case(taskBoardActions.doneDeleteBoard, (state, arg) => {
                return arg.result;
            })
            .case(taskBoardActions.failedDeleteBoard, (state, arg) => {
                return state;
            })

            //// addSticky async actions ////
            .case(taskBoardActions.startAddSticky, (state, payload) => {
                const now = new Date();
                const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

                const change: TaskRecord = {
                    type: 'task',
                    dueDate: formatDate(today),
                    description: '# Untitled',
                    barcode: '',
                    memo: '',
                    flags: [],
                    tags: [],
                    boardId: state.activeBoardId,
                    taskStatus: state.activeBoard.taskStatuses[0].value,
                    teamOrStory: state.activeBoard.teamOrStories[0].value,
                } as any;

                const records = state.activeBoard.records.concat([change]);
                const activeBoard = Object.assign({}, state.activeBoard, { records });

                db.post(change, {})
                .then(v => {
                    change._id = v.id;
                    change._rev = v.rev;
                    getConstructedAppStore().dispatch(taskBoardActions.doneAddSticky({
                        params: payload,
                        result: Object.assign({}, state, { activeBoard }),
                    }));
                })
                .catch(err => {
                    getConstructedAppStore().dispatch(taskBoardActions.failedAddSticky({
                        params: payload,
                        error: err,
                    }));
                    setTimeout(() => {
                        getConstructedAppStore().dispatch(appEventsActions.showAlertDialog({
                            open: true,
                            title: 'Error',
                            message: 'Failed to add sticky: ' + err.message,
                            singleButton: true,
                            colorIsSecondary: true,
                            onClose: () => getConstructedAppStore().dispatch(appEventsActions.closeAlertDialog()),
                        }));
                    }, 30);
                });

                return state;
            })
            .case(taskBoardActions.doneAddSticky, (state, arg) => {
                setTimeout(() => {
                    restartSync()
                    .then(() => {
                        //
                    }).catch(err => {
                        alert(err.message);
                    })
                }, 1500);
                return arg.result;
            })
            .case(taskBoardActions.failedAddSticky, (state, arg) => {
                return state;
            })

            //// updateSticky async actions ////
            .case(taskBoardActions.startUpdateSticky, (state, payload) => {
                const index = state.activeBoard.records.findIndex(x => x._id === payload._id);
                if (index < 0) {
                    return state;
                }

                const change = Object.assign({}, state.activeBoard.records[index], {
                    dueDate: payload.dueDate,
                    description: payload.description,
                    barcode: payload.barcode,
                    memo: payload.memo,
                    tags: payload.tags,
                    flags: payload.flags,
                    taskStatus: payload.taskStatus,
                    teamOrStory: payload.teamOrStory,
                });

                const records = state.activeBoard.records.slice(0, index).concat(
                    [change],
                    state.activeBoard.records.slice(index + 1),
                );
                const activeBoard = Object.assign({}, state.activeBoard, { records });

                db.put(change, {})
                .then(v => {
                    change._id = v.id;
                    change._rev = v.rev;
                    getConstructedAppStore().dispatch(taskBoardActions.doneUpdateSticky({
                        params: payload,
                        result: Object.assign({}, state, { activeBoard }),
                    }));
                })
                .catch(err => {
                    getConstructedAppStore().dispatch(taskBoardActions.failedUpdateSticky({
                        params: payload,
                        error: err,
                    }));
                    setTimeout(() => {
                        getConstructedAppStore().dispatch(appEventsActions.showAlertDialog({
                            open: true,
                            title: 'Error',
                            message: 'Failed to save the sticky: ' + err.message,
                            singleButton: true,
                            colorIsSecondary: true,
                            onClose: () => getConstructedAppStore().dispatch(appEventsActions.closeAlertDialog()),
                        }));
                    }, 30);
                });

                return state;
            })
            .case(taskBoardActions.doneUpdateSticky, (state, arg) => {
                return arg.result;
            })
            .case(taskBoardActions.failedUpdateSticky, (state, arg) => {
                return state;
            })

            //// updateStickyLanes async actions ////
            .case(taskBoardActions.startUpdateStickyLanes, (state, payload) => {
                const index = state.activeBoard.records.findIndex(x => x._id === payload.taskId);
                if (index < 0) {
                    return state;
                }

                const change = Object.assign({}, state.activeBoard.records[index], {
                    taskStatus: payload.taskStatusValue,
                    teamOrStory: payload.teamOrStoryValue,
                });

                const records = state.activeBoard.records.slice(0, index).concat(
                    [change],
                    state.activeBoard.records.slice(index + 1),
                );
                const activeBoard = Object.assign({}, state.activeBoard, { records });

                db.put(change, {})
                .then(v => {
                    change._id = v.id;
                    change._rev = v.rev;
                    getConstructedAppStore().dispatch(taskBoardActions.doneUpdateStickyLanes({
                        params: payload,
                        result: Object.assign({}, state, { activeBoard }),
                    }));
                })
                .catch(err => {
                    getConstructedAppStore().dispatch(taskBoardActions.failedUpdateStickyLanes({
                        params: payload,
                        error: err,
                    }));
                    setTimeout(() => {
                        getConstructedAppStore().dispatch(appEventsActions.showAlertDialog({
                            open: true,
                            title: 'Error',
                            message: 'Failed to save the sticky: ' + err.message,
                            singleButton: true,
                            colorIsSecondary: true,
                            onClose: () => getConstructedAppStore().dispatch(appEventsActions.closeAlertDialog()),
                        }));
                    }, 30);
                });

                return state;
            })
            .case(taskBoardActions.doneUpdateStickyLanes, (state, arg) => {
                return arg.result;
            })
            .case(taskBoardActions.failedUpdateStickyLanes, (state, arg) => {
                return state;
            })

            //// archiveSticky async actions ////
            .case(taskBoardActions.startArchiveSticky, (state, payload) => {
                const index = state.activeBoard.records.findIndex(x => x._id === payload.taskId);
                if (index < 0) {
                    return state;
                }

                const change = Object.assign({}, state.activeBoard.records[index]);
                change.flags = (change.flags || []).filter(x => x !== 'Archived');
                change.flags.push('Archived');

                const records = state.activeBoard.records.slice(0, index).concat(
                    [change],
                    state.activeBoard.records.slice(index + 1),
                );
                const activeBoard = Object.assign({}, state.activeBoard, { records });

                db.put(change, {})
                .then(v => {
                    change._id = v.id;
                    change._rev = v.rev;
                    getConstructedAppStore().dispatch(taskBoardActions.doneArchiveSticky({
                        params: payload,
                        result: Object.assign({}, state, { activeBoard }),
                    }));
                })
                .catch(err => {
                    getConstructedAppStore().dispatch(taskBoardActions.failedArchiveSticky({
                        params: payload,
                        error: err,
                    }));
                    setTimeout(() => {
                        getConstructedAppStore().dispatch(appEventsActions.showAlertDialog({
                            open: true,
                            title: 'Error',
                            message: 'Failed to archive the sticky: ' + err.message,
                            singleButton: true,
                            colorIsSecondary: true,
                            onClose: () => getConstructedAppStore().dispatch(appEventsActions.closeAlertDialog()),
                        }));
                    }, 30);
                });

                return state;
            })
            .case(taskBoardActions.doneArchiveSticky, (state, arg) => {
                return arg.result;
            })
            .case(taskBoardActions.failedArchiveSticky, (state, arg) => {
                return state;
            })

            //// unarchiveSticky async actions ////
            .case(taskBoardActions.startUnarchiveSticky, (state, payload) => {
                const index = state.activeBoard.records.findIndex(x => x._id === payload.taskId);
                if (index < 0) {
                    return state;
                }

                const change = Object.assign({}, state.activeBoard.records[index]);
                change.flags = (change.flags || []).filter(x => x !== 'Archived');

                const records = state.activeBoard.records.slice(0, index).concat(
                    [change],
                    state.activeBoard.records.slice(index + 1),
                );
                const activeBoard = Object.assign({}, state.activeBoard, { records });

                db.put(change, {})
                .then(v => {
                    change._id = v.id;
                    change._rev = v.rev;
                    getConstructedAppStore().dispatch(taskBoardActions.doneUnarchiveSticky({
                        params: payload,
                        result: Object.assign({}, state, { activeBoard }),
                    }));
                })
                .catch(err => {
                    getConstructedAppStore().dispatch(taskBoardActions.failedUnarchiveSticky({
                        params: payload,
                        error: err,
                    }));
                    setTimeout(() => {
                        getConstructedAppStore().dispatch(appEventsActions.showAlertDialog({
                            open: true,
                            title: 'Error',
                            message: 'Failed to unarchive the sticky: ' + err.message,
                            singleButton: true,
                            colorIsSecondary: true,
                            onClose: () => getConstructedAppStore().dispatch(appEventsActions.closeAlertDialog()),
                        }));
                    }, 30);
                });

                return state;
            })
            .case(taskBoardActions.doneUnarchiveSticky, (state, arg) => {
                return arg.result;
            })
            .case(taskBoardActions.failedUnarchiveSticky, (state, arg) => {
                return state;
            })

            //// deleteSticky async actions ////
            .case(taskBoardActions.startDeleteSticky, (state, payload) => {
                const index = state.activeBoard.records.findIndex(x => x._id === payload.taskId);
                if (index < 0) {
                    return state;
                }

                const change = state.activeBoard.records[index];

                const records = state.activeBoard.records.slice(0, index).concat(
                    state.activeBoard.records.slice(index + 1),
                );
                const activeBoard = Object.assign({}, state.activeBoard, { records });

                db.remove(change, {})
                .then(v => {
                    getConstructedAppStore().dispatch(taskBoardActions.doneDeleteSticky({
                        params: payload,
                        result: Object.assign({}, state, { activeBoard }),
                    }));
                })
                .catch(err => {
                    getConstructedAppStore().dispatch(taskBoardActions.failedDeleteSticky({
                        params: payload,
                        error: err,
                    }));
                    setTimeout(() => {
                        getConstructedAppStore().dispatch(appEventsActions.showAlertDialog({
                            open: true,
                            title: 'Error',
                            message: 'Failed to delete the sticky: ' + err.message,
                            singleButton: true,
                            colorIsSecondary: true,
                            onClose: () => getConstructedAppStore().dispatch(appEventsActions.closeAlertDialog()),
                        }));
                    }, 30);
                });

                return state;
            })
            .case(taskBoardActions.doneDeleteSticky, (state, arg) => {
                return arg.result;
            })
            .case(taskBoardActions.failedDeleteSticky, (state, arg) => {
                return state;
            })

            //// editBoardAndStickys async actions ////
            .case(taskBoardActions.startEditBoardAndStickys, (state, payload) => {
                (async () => {
                    try {
                        const index = state.boards.findIndex(x => x._id === payload._id);
                        if (index < 0) {
                            return state;
                        }

                        const change = Object.assign({}, state.boards[index], {
                            name: payload.name || 'Untitled',
                            taskStatuses: payload.taskStatuses || initialData.boards[0].taskStatuses,
                            teamOrStories: payload.teamOrStories || initialData.boards[0].teamOrStories,
                            tags: payload.tags || [],
                            displayBarcode: !!payload.displayBarcode,
                            displayMemo: !!payload.displayMemo,
                            displayFlags: !!payload.displayFlags,
                            displayTags: !!payload.displayTags,
                            preferArchive: !!payload.preferArchive,
                            boardStyle: payload.boardStyle || '',
                            calendarStyle: payload.calendarStyle || '',
                            boardNote: payload.boardNote || '',
                        });

                        const v = await db.put(change, {});
                        change._id = v.id;
                        change._rev = v.rev;

                        const boards = state.boards.slice(0, index).concat(
                            [change],
                            state.boards.slice(index + 1),
                        );
                        let activeBoard = change._id === state.activeBoard._id ? change : state.activeBoard;

                        // TODO: sticky records
                        const records: TaskRecord[] = (await db.find({selector: {
                            type: 'task',
                            boardId: change._id,
                        }})).docs as any;

                        const recordsNew: TaskRecord[] = [];
                        for (const rec of payload.records || []) {
                            const recDb = records.find(x => x._id === rec._id);
                            let recNew: TaskRecord = null as any;
                            if (recDb) {
                                recNew = Object.assign({}, rec, { type: 'task', boardId: change._id, _rev: recDb._rev });
                                const resp = await db.put(recNew, {});
                                recNew._id = resp.id;
                                recNew._rev = resp.rev;
                            } else {
                                recNew = Object.assign({}, rec, { type: 'task', boardId: change._id });
                                delete (recNew as any)._id;  // (TS>=4.0) TS2790 The operand of a 'delete' operator must be optional.
                                delete (recNew as any)._rev; // (TS>=4.0) TS2790 The operand of a 'delete' operator must be optional.
                                const resp = await db.post(recNew, {});
                                recNew._id = resp.id;
                                recNew._rev = resp.rev;
                            }
                            recordsNew.push(recNew);
                        }
                        for (const recDb of records) {
                            const recNew = recordsNew.find(x => x._id === recDb._id);
                            if (! recNew) {
                                await db.remove(recDb, {});
                            }
                        }
                        change.records = recordsNew;

                        getConstructedAppStore().dispatch(taskBoardActions.doneEditBoardAndStickys({
                            params: payload,
                            result: Object.assign({}, state, {
                                boards,
                                activeBoardId: activeBoard._id,
                                activeBoard: activeBoard,
                            }),
                        }));
                        setTimeout(() => {
                            getConstructedAppStore().dispatch(appEventsActions.showAlertDialog({
                                open: true,
                                title: 'Done',
                                message: 'Board is saved successfully',
                                singleButton: true,
                                onClose: () => getConstructedAppStore().dispatch(appEventsActions.closeAlertDialog()),
                            }));
                        }, 30);
                    } catch (e) {
                        getConstructedAppStore().dispatch(taskBoardActions.failedEditBoardAndStickys({
                            params: payload,
                            error: e,
                        }));
                        setTimeout(() => {
                            getConstructedAppStore().dispatch(appEventsActions.showAlertDialog({
                                open: true,
                                title: 'Error',
                                message: 'Failed to save the board: ' + e.message,
                                singleButton: true,
                                colorIsSecondary: true,
                                onClose: () => getConstructedAppStore().dispatch(appEventsActions.closeAlertDialog()),
                            }));
                        }, 30);
                    }
                })();

                return state;
            })
            .case(taskBoardActions.doneEditBoardAndStickys, (state, arg) => {
                setTimeout(() => {
                    restartSync()
                    .then(() => {
                        //
                    }).catch(err => {
                        alert(err.message);
                    })
                }, 1500);
                return arg.result;
            })
            .case(taskBoardActions.failedEditBoardAndStickys, (state, arg) => {
                return state;
            })

            //// refreshActiveBoard async actions ////
            .case(taskBoardActions.startRefreshActiveBoard, (state, payload) => {
                (async () => {
                    try {
                        const newState = await getTaskBoardStateFromDb(state, state.activeBoard._id);

                        getConstructedAppStore().dispatch(taskBoardActions.doneRefreshActiveBoard({
                            params: payload,
                            result: newState,
                        }));
                    } catch (e) {
                        getConstructedAppStore().dispatch(taskBoardActions.failedRefreshActiveBoard({
                            params: payload,
                            error: e,
                        }));
                    }
                })();
                return state;
            })
            .case(taskBoardActions.doneRefreshActiveBoard, (state, arg) => {
                return arg.result;
            })
            .case(taskBoardActions.failedRefreshActiveBoard, (state, arg) => {
                return state;
            })
            ;
    }
    return taskBoardReducer;
}
