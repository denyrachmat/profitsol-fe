import { all, fork } from "redux-saga/effects";

// Sagas
import * as AuthSagasPortal from "./portal/AuthSagas";
// import AuthSagas from './AuthSagas'
// import NotifSagas from './NotifSagas'
// import ProfileSagas from './ProfileSagas'

export default function* rootSaga() {
    yield all([AuthSagasPortal])
}