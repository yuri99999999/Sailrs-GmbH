import React,
       { useEffect,
         useRef }                from 'react';
import { connect }               from 'react-redux';
import { Route,
         Switch }                from "react-router-dom";
import CssBaseline               from '@material-ui/core/CssBaseline';
import { makeStyles }            from '@material-ui/core/styles';
import { ThemeProvider }         from '@material-ui/styles';
import clsx                      from 'clsx';
import { AppEventsState }        from './types';
import { restartSync }           from './lib/db';
import { theme }                 from './lib/theme';
import { getCurrentView }        from './lib/util';
import { mapDispatchToProps,
         mapStateToProps,
         AppEventsActions }      from './dispatchers/AppEventsDispatcher';
import { getConstructedAppStore,
         history }               from './store';
import AppDrawer                 from './components/AppDrawer';
import BoardView                 from './views/TaskBoardView';
import CalendarView              from './views/CalendarView';
import ConfirmDialog             from './components/ConfirmDialog';

type AppProps = AppEventsState & AppEventsActions;

const useStyles = makeStyles(theme => ({
    app: {
        display: 'flex',
    },
}));

function useInterval(callback: () => void, delay: number | null) {
    const savedCallback = useRef() as React.MutableRefObject<any>;

    // Remember the latest callback.
    useEffect(() => {
        savedCallback.current = callback;

    /* eslint-disable-next-line react-hooks/exhaustive-deps */
    }, [callback]);

    // Set up the interval.
    useEffect(() => {
        function tick() {
            savedCallback.current();
        }
        if (delay !== null) {
            let id = setInterval(tick, delay);

            // Clean up the timer when unmount or before re-calling.
            return () => clearInterval(id);
        }

    /* eslint-disable-next-line react-hooks/exhaustive-deps */
    }, [delay]);
}


const App: React.FC<AppProps> = (props) => {
    const classes = useStyles();

    useInterval(
        () => {
            if (props.appConfig) {
                console.log('periodic timer:' + new Date());
                restartSync()
                .then(() => {
                    let goAround = false;
                    let nextActiveBoardId = '';
                    const store = getConstructedAppStore();
                    if(store && props.appConfig.display) {
                        const state = store.getState();
                        if (props.appConfig.display.goAround && state.taskBoard.boards.length > 1) {
                            const index = (Math.max(0, state.taskBoard.boards
                                .findIndex(x => x._id === state.taskBoard.activeBoardId)) + 1) %
                                state.taskBoard.boards.length;
                            goAround = true;
                            nextActiveBoardId = state.taskBoard.boards[index]._id;
                        }
                    }
                    const viewName = getCurrentView(history);
                    if (viewName !== 'config' && viewName !== 'edit') {
                        if (goAround) {
                            history.push(`/${viewName}/${nextActiveBoardId}`);
                        } else {
                            props.refreshActiveBoard();
                        }
                    }
                })
                .catch(err => {
                    console.log(err.message);
                });
            }
        },
        props.appConfig && props.appConfig.display &&
            props.appConfig.display.autoUpdate ?
                (props.appConfig.display.autoUpdateInterval || 2419200) * 1000 :
                null
    );

    // Update only first time (apply synchronized data to renderer)
    useEffect(() => {
        // run once
        setTimeout(() => {
            props.refreshActiveBoard();
        }, 3000);

    /* eslint-disable-next-line react-hooks/exhaustive-deps */
    }, []);

    return (
        <div className={clsx(classes.app)}>
            <CssBaseline />
            <ThemeProvider theme={theme}>
                <AppDrawer />
                <Switch>
                    <Route path="/" exact component={BoardView} />
                    <Route path="/board/:id?" component={BoardView} />
                    <Route path="/calendar/:id?" component={CalendarView} />
                </Switch>
                {props.alertDialog.open ?
                    <ConfirmDialog {...props.alertDialog} /> :
                    <></>
                }
            </ThemeProvider>
        </div>
    );
}
export default connect(mapStateToProps, mapDispatchToProps)(App);
