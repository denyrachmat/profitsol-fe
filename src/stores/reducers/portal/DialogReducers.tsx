import { DialogStates } from "../../states/portal/DialogStates";
import * as DialogTypes from "../../actions/types/portal/DialogTypes";

export const DialogReducers = (state = DialogStates, actions: DialogTypes.Dialogs) => {
    switch (actions.type) {
        case DialogTypes.SET_DIALOG:
            return {
                ...state,
                dialogID: actions.dialogID,
                dialogIsOpen: actions.dialogIsOpen,
                dialogTitle: actions.dialogTitle,
                dialogContent: actions.dialogContent,
                dialogCancelBtn: actions.dialogCancelBtn,
                dialogPressedBtn: actions.dialogPressedBtn
            }
        case DialogTypes.PUSH_DIALOGS:
            return {
                ...state,
                dialogLists: actions.dialogs
            }
        default:
            return state
    }
}