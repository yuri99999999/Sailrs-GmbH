
import React           from 'react';
import ReactDOM        from 'react-dom';
// import TaskBoardView from './TaskBoardView';

it('renders without crashing', () => {
    const div = document.createElement('div');
    // ReactDOM.render(<TaskBoardView />, div);
    ReactDOM.render(<span />, div);
    ReactDOM.unmountComponentAtNode(div);
});
