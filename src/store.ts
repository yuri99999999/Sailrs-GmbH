
import { createStore,
         combineReducers, 
         applyMiddleware,
         compose,
         Store,
         AnyAction }             from 'redux';
import { createHashHistory }     from 'history';
import { connectRouter,
         routerMiddleware }      from 'connected-react-router';
import { AppState }              from './types';
import { getTaskBoardReducer }   from './states/TaskBoardState';
import { getCalendarReducer }    from './states/CalendarState';
import { getAppEventsReducer }   from './states/AppEventsState';



export const history = createHashHistory({
    hashType: 'slash',
});


let store: Store<AppState, AnyAction> = null as any;


export function getConstructedAppStore() {
    return store;
}


export default async function getAppStore() {
    if (!store) {
        store = createStore(
            combineReducers<AppState>({
                router: connectRouter(history),
                appEvents: await getAppEventsReducer(),
                taskBoard: await getTaskBoardReducer(),
                calendar: await getCalendarReducer(),
            }),
            compose(
                applyMiddleware(
                    routerMiddleware(history),
                ),
            ),
        );
    }
    return store;
}
