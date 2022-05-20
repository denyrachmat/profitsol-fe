import { ReactInstance } from "react"

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
    dialogContent?: string | HTMLElement | React.ReactElement,
    dialogCancelBtn?: boolean,
    dialogPressedBtn?: string
}

export const GET_LIST_DIALOG = 'GET_LIST_DIALOG'
export interface getListDialog {
    type: typeof GET_LIST_DIALOG,
    dialogLists: string[]| Object[]
}

export const SET_BUTTON_FEEDBACK = 'SET_BUTTON_FEEDBACK'
export interface setButtonFeedBack {
    type: typeof SET_BUTTON_FEEDBACK,
    dialogID: string,
    dialogPressedBtn: string,
    dialogResult?: Object
}

export type Dialogs = 
    setDialogs |
    pushDialogs |
    getCurrentDialog |
    getListDialog |
    setButtonFeedBack