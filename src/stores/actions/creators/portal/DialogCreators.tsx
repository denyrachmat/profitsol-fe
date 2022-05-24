import * as DialogTypes from '../../types/portal/DialogTypes'
import React from 'react'

export const setDialogs = (
    dialogID: string,
    dialogIsOpen: boolean,
    dialogTitle?: string,
    dialogContent?: string| HTMLElement | React.ReactElement,
    dialogCancelBtn?: boolean,
    dialogPressedBtn?: string,
    dialogResult?: Object | string,
    dialogLists?: Object[]
) => {
    return {
        type: DialogTypes.SET_DIALOG,
        dialogID,
        dialogIsOpen,
        dialogTitle,
        dialogContent,
        dialogCancelBtn,
        dialogPressedBtn,
        dialogResult,
        dialogLists
    }
}

export const pushDialogs = (
    dialogs: Object[]
) => {
    return {
        type: DialogTypes.PUSH_DIALOGS,
        dialogs
    }
}

export const setButtonFeedBack = (
    dialogID: string,
    dialogPressedBtn: string,
    dialogResult?: Object
) => {
    return {
        type: DialogTypes.SET_BUTTON_FEEDBACK,
        dialogID,
        dialogPressedBtn,
        dialogResult
    }
}