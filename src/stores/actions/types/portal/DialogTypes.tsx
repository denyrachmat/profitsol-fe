export const SET_DIALOG = 'SET_DIALOG'
export interface setDialogs {
    type: typeof SET_DIALOG,
    dialogID: string,
    dialogIsOpen: boolean,
    dialogTitle: string,
    dialogContent: string| HTMLElement,
    dialogCancelBtn: boolean,
    dialogPressedBtn: string,
}

export const PUSH_DIALOGS = 'PUSH_DIALOGS'
export interface pushDialogs {
    type: typeof PUSH_DIALOGS,
    dialogs: Object[]
}

export const GET_CURRENT_DIALOG = 'GET_CURRENT_DIALOG'
export interface getCurrentDialog {
    type: typeof GET_CURRENT_DIALOG,
    dialogID: string,
    dialogIsOpen: boolean,
    dialogTitle?: string,
    dialogContent?: string,
    dialogCancelBtn?: boolean,
    dialogPressedBtn?: string
}

export const GET_LIST_DIALOG = 'GET_LIST_DIALOG'
export interface getListDialog {
    type: typeof GET_LIST_DIALOG,
    dialogLists: string[]| Object[]
}

export type Dialogs = 
    setDialogs |
    pushDialogs |
    getCurrentDialog |
    getListDialog