import { all, fork } from "redux-saga/effects";

// Sagas
import { AuthSagas as AuthSagasPortal } from "./portal/AuthSagas";
import { ProfileSagas as ProfileSagasPortal } from "./portal/ProfileSagas";
import { DialogSagas as DialogSagasPortal } from "./portal/DialogSagas";

export default function* rootSaga() {
    yield all([
        fork(AuthSagasPortal),
        fork(ProfileSagasPortal),
        fork(DialogSagasPortal),
    ])
}