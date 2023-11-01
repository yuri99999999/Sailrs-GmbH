import { History } from 'history';

export function getCurrentView(history: History<any>) {
    let currentView = '';
    if (history.location.pathname) {
        if (history.location.pathname.startsWith('/board/')) {
            currentView = 'board';
        } else if (history.location.pathname.startsWith('/calendar/')) {
            currentView = 'calendar';
        }
    }
    return currentView;
}
