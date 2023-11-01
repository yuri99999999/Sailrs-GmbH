
import { reducerWithInitialState,
         ReducerBuilder }         from 'typescript-fsa-reducers';
import { AppEventsState }         from '../types';
import { appEventsActions }       from '../actions/AppEventsActions';
import { getLocalDb }            from '../lib/db';
import { getConstructedAppStore } from '../store';

let appEventsReducer: ReducerBuilder<AppEventsState, AppEventsState> = null as any;

export async function getAppEventsReducer() {
    if (!appEventsReducer) {
        const db = getLocalDb();

        // TODO: try-catch
        const defaultAppConfig = {
            display: {
                autoUpdate: false,
                autoUpdateInterval: 2419200,
            },
        };

        const initialState: AppEventsState = {
            alertDialog: {
                open: false,
                title: '',
                message: '',
                onClose: () => void 0,
            },
            appConfig: {
                ...defaultAppConfig,
            } as any,
        };

        appEventsReducer = reducerWithInitialState(initialState)
            .case(appEventsActions.showAlertDialog, (state, payload) => {
                return Object.assign({}, state, {
                    alertDialog: payload,
                });
            })
            .case(appEventsActions.closeAlertDialog, (state) => {
                return Object.assign({}, state, {
                    alertDialog: initialState,
                });
            })

            //// resetApplication async actions ////
            .case(appEventsActions.startResetApplication, (state) => {
                (async () => {
                    try {
                        try {
                            await db.destroy({});
                        } catch (e) {
                            alert(e);
                        }

                        alert('All app data and configurations are removed. Please reload page.');

                        getConstructedAppStore().dispatch(appEventsActions.doneResetApplication({
                            result: state,
                        }));
                    } catch (e) {
                        alert(e);
                        getConstructedAppStore().dispatch(appEventsActions.failedResetApplication({
                            error: e,
                        }));
                    }
                })();

                return state;
            })
            ;
    }
    return appEventsReducer;
}
