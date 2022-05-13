import { put, fork, all, takeEvery } from 'redux-saga/effects'
import * as Eff from 'redux-saga/effects'

import { apiConn } from '../../../components/apiHelpers';

import * as AuthTypes from '../../actions/types/portal/AuthTypes'

const call: any = Eff.call;

function* onLogin({username, password}: AuthTypes.SetLoginRequest) {
    const {data, message} = yield call(
        apiConn, 
        'post',
        'login',
        'api',
        {
            username, 
            password
        }    
    )

    if (data) {
        console.log(data)
    }
}

function* watchUserLogin() {
    yield takeEvery('LOGIN_REQUEST', onLogin)
}

export default function* AuthSagas() {
    yield all([fork(watchUserLogin)]);
}