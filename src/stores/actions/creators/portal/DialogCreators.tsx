import * as DialogTypes from '../../types/portal/DialogTypes'
import React from 'react'

export const setDialogs = (
    dialogID: string,
    dialogIsOpen: boolean,
    dialogTitle?: string,
    dialogContent?: string| HTMLElement | React.ReactElement,
    dialogCancelBtn?: boolean,
    dialogPressedBtn?: string
) => {
    return {
        type: DialogTypes.SET_DIALOG,
        dialogID,
        dialogIsOpen,
        dialogTitle,
        dialogContent,
        dialogCancelBtn,
        dialogPressedBtn
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