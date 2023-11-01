


export const boardStyle =
`/* per-board customized styles */
/*
.TaskBoardView-sticky-note {width: 200px}
.TaskBoardView-header-cell-task-statuses {min-width: 210px}
table.TaskBoardView-board tbody th {
    padding: 10px;
    white-space: nowrap;
}
*/
table.TaskBoardView-board thead th.status-backlog {
    background-color: var(--weak-header-bg-color);
}
table.TaskBoardView-board td.status-backlog {
    background-color: var(--weak-data-bg-color);
}
table.TaskBoardView-board thead th.status-done {
    background-color: var(--weak-header-bg-color);
}
table.TaskBoardView-board td.status-done {
    background-color: var(--weak-data-bg-color);
}
.team-or-story-team-b .TaskBoardView-sticky-note {
    background-color: var(--sticky-blue-color);
}
.status-done .TaskBoardView-sticky-note {
    background-color: var(--sticky-green-color);
}
.TaskBoardView-sticky-tags .tag-bug {
    color: white;
    background-color: red;
}
.TaskBoardView-sticky-tags .tag-ok {
    color: white;
    background-color: green;
}
.TaskBoardView-sticky-tags .tag-NG {
    color: white;
    background-color: #e91e63;
}
.TaskBoardView-sticky-tags .tag-PR {
    color: white;
    background-color: purple;
}
.TaskBoardView-sticky-tags .tag-rejected {
    color: white;
    background-color: #990000;
}
.TaskBoardView-sticky-tags .tag-pending {
    color: black;
    background-color: #ff9900;
}
.TaskBoardView-sticky-tags .tag-merged {
    color: white;
    background-color: #006666;
}
.TaskBoardView-sticky-tags .tag-critical {
    color: white;
    background-color: red;
}
.TaskBoardView-sticky-tags .tag-high {
    color: white;
    background-color: #ff5522;
}
.TaskBoardView-sticky-tags .tag-moderate {
    color: black;
    background-color: #ffcc00;
}
.TaskBoardView-sticky-tags .tag-low {
    color: black;
    background-color: #cc9900;
}
.TaskBoardView-sticky-tags .tag-star {
    color: inherit;
    background-color: inherit;
}
`;


export const calendarStyle =
`/* per-board customized styles */
div.CalendarView-item-chip.status-done {
    background-color: var(--sticky-green-color);
}
`;


export const boardNote =
`# This is a board note.`;


export const initialData = {
    "boards": [{
        "type": "taskBoard",
        "name": "Welcome Board",
        "taskStatuses": [{
            "value": "Backlog",
            "caption": "Backlog",
            "className": "status-backlog"
        }, {
            "value": "ToDo",
            "caption": "ToDo",
            "className": "status-todo"
        }, {
            "value": "InProgress",
            "caption": "InProgress",
            "className": "status-inprogress"
        }, {
            "value": "Staging",
            "caption": "Staging",
            "className": "status-staging"
        }, {
            "value": "Done",
            "caption": "Done",
            "className": "status-done",
            "completed": true
        }],
        "teamOrStories": [{
            "value": "Team A",
            "caption": "Team A",
            "className": "team-or-story-team-a"
        }, {
            "value": "Team B",
            "caption": "Team B",
            "className": "team-or-story-team-b"
        }, {
            "value": "Team C",
            "caption": "Team C",
            "className": "team-or-story-team-c"
        }],
        "tags": [{
            "value": "bug",
            "className": "tag-bug"
        }, {
            "value": "ok",
            "className": "tag-ok"
        }, {
            "value": "NG",
            "className": "tag-NG"
        }, {
            "value": "PR",
            "className": "tag-PR"
        }, {
            "value": "rejected",
            "className": "tag-rejected"
        }, {
            "value": "pending",
            "className": "tag-pending"
        }, {
            "value": "merged",
            "className": "tag-merged"
        }, {
            "value": "critical",
            "className": "tag-critical"
        }, {
            "value": "high",
            "className": "tag-high"
        }, {
            "value": "moderate",
            "className": "tag-moderate"
        }, {
            "value": "low",
            "className": "tag-low"
        }, {
            "value": "⭐",
            "className": "tag-star"
        }, {
            "value": "⭐⭐",
            "className": "tag-star"
        }, {
            "value": "⭐⭐⭐",
            "className": "tag-star"
        }],
        "displayBarcode": true,
        "displayMemo": true,
        "displayFlags": true,
        "displayTags": true,
        "preferArchive": false,
        "boardStyle": boardStyle,
        "calendarStyle": calendarStyle,
        "boardNote": "",
    }],
    "records": [{
        "type": "task",
        "dueDate": "",
        "description": "# Welcome to the Task Management App!\n",
        "barcode": "",
        "memo": "",
        "flags": [],
        "tags": [],
        "boardId": "",
        "teamOrStory": "Team B",
        "taskStatus": "Backlog"
    }, {
        "type": "task",
        "dueDate": "2030-01-01",
        "description": "# This record is archived.",
        "barcode": "",
        "memo": "",
        "flags": [],
        "tags": [],
        "boardId": "",
        "teamOrStory": "Team B",
        "taskStatus": "Backlog"
    }]
}
