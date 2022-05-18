import { put, fork, all, takeEvery, select } from 'redux-saga/effects'
import * as Eff from 'redux-saga/effects'

import * as DialogTypes from '../../actions/types/portal/DialogTypes'
import * as DialogCreators from '../../actions/creators/portal/DialogCreators'

const call: any = Eff.call;

function* pushingDialog({
    dialogID,
    dialogIsOpen,
    dialogTitle,
    dialogContent,
    dialogCancelBtn,
    dialogPressedBtn
}: DialogTypes.setDialogs) {
    const { dialogLists } = yield select((state) => state.Dialogs)

    const data = {
        dialogID: dialogID,
        dialogIsOpen: dialogIsOpen,
        dialogTitle: dialogTitle,
        dialogContent: dialogContent,
        dialogCancelBtn: dialogCancelBtn,
        dialogPressedBtn: dialogPressedBtn
    }

    console.log(data)
    
    let dataFinale = (data: Object, result: Object[] = []) => {
        result.push(...dialogLists, data)
        return result
    }

    let resultArr: Object[]

    if(dialogLists) {
        if(dialogLists.length === 0) {
            resultArr = dataFinale({...data})
        } else {
            const findID = Object.keys(dialogLists).filter((val: any) => dialogLists[val].dialogID === dialogID)

            if (findID.length > 0) {
                let dataNotif = dialogLists
                findID.map((idNotif: any) => {
                    dataNotif[idNotif] = data
                })
    
                resultArr = dataNotif
            } else {
                resultArr = dataFinale({...data})
            }
        }
    } else {
        resultArr = []
    }

    console.log(resultArr)

    yield put(DialogCreators.pushDialogs(resultArr))
}

function* watchEveryDialogFired() {
    yield takeEvery('SET_DIALOG', pushingDialog)
}

export function* DialogSagas() {
    yield all([
        fork(watchEveryDialogFired)
    ]);
}