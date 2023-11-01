
import { RouterState } from 'connected-react-router';

//// Documents ////

export interface DocumentWithNoContents {
    _id: string;
}

export interface DocumentWithContents extends DocumentWithNoContents {
    _rev: string;
    type: string;
}

export interface LaneDef {
    value: string;
    caption: string;
    className: string;
};

export interface StatusLaneDef extends LaneDef {
    completed?: boolean;
};

export interface TagDef {
    value: string;
    className: string;
};


export type TaskRecordDbRecordUserData = {
    type: 'task',
    dueDate: string;
    description: string;
    barcode: string;
    memo: string;
    flags: string[];
    tags: string[];
    boardId: string;
    taskStatus: string;
    teamOrStory: string;
};

export type TaskRecord = TaskRecordDbRecordUserData & DocumentWithContents;


export interface TaskBoardDbRecordUserData {
    type: 'taskBoard',
    name: string;
    taskStatuses: StatusLaneDef[];
    teamOrStories: LaneDef[];
    tags: TagDef[];
    displayBarcode: boolean,
    displayMemo: boolean,
    displayFlags: boolean,
    displayTags: boolean,
    preferArchive: boolean,
    boardStyle: string;
    calendarStyle: string;
    boardNote: string;
};

export type TaskBoardDbRecord = DocumentWithContents & TaskBoardDbRecordUserData;

export interface TaskBoardRecord extends TaskBoardDbRecord {
    records: TaskRecord[];
};

export interface TaskBoardInitialData {
    boards: TaskBoardDbRecord[];
    records: TaskRecord[];
}


//// Config
export interface AppConfigDisplaySettings {
    autoUpdate: boolean;
    autoUpdateInterval: number;
    goAround: boolean;
}

export interface AppConfigUserData {
    type: 'appConfig',
    display: AppConfigDisplaySettings;
}

export type AppConfigDbRecord = DocumentWithContents & AppConfigUserData;
export type AppConfig = AppConfigDbRecord;


//// Components props

export type ConfirmDialogProps = {
    open: boolean,
    title: string,
    message: string,
    singleButton?: boolean;
    colorIsSecondary?: boolean,
    applyButtonCaption?: string,
    cancelButtonCaption?: string,
    fab?: any,
    confirmingTextLabel?: string,
    confirmingTextValue?: string,
    onClose: (apply: boolean) => void,
};

export type TextInputDialogProps = {
    open: boolean,
    title: string,
    message: string,
    fieldLabel: string,
    value: string,
    colorIsSecondary?: boolean,
    applyButtonCaption?: string,
    cancelButtonCaption?: string,
    validator?: (value: string) => boolean,
    onClose: (apply: boolean, value?: string) => void,
};

export type TaskDialogProps = {
    open: boolean,
    record: TaskRecord,
    taskStatuses: StatusLaneDef[]; // TODO: redundant
    teamOrStories: LaneDef[];      // TODO: redundant
    board: TaskBoardRecord,
    onApply: (rec: TaskRecord) => void,
    onArchive: (recId: string) => void,
    onUnarchive: (recId: string) => void,
    onDelete: (recId: string) => void,
    onCancel: () => void,
};


//// Action payloads ////

export interface UpdateStickyLanesPayload {
    taskId: string;
    taskStatusValue: string;
    teamOrStoryValue: string;
};


//// States ////

export interface TaskBoardState {
    activeBoard: TaskBoardRecord;
    boards: TaskBoardRecord[];
    activeBoardId: string;
    activeBoardIndex: number;
}

export interface CalendarState {
    activeMonth: Date;
}

export interface AppEventsState {
    alertDialog: ConfirmDialogProps;
    appConfig: AppConfig;
}

export type AppState = {
    router: RouterState,
    appEvents: AppEventsState,
    taskBoard: TaskBoardState,
    calendar: CalendarState,
};
