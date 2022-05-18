import { put, fork, all, takeEvery } from 'redux-saga/effects'
import * as Eff from 'redux-saga/effects'

import { apiConn } from '../../../components/apiHelpers';

import * as AuthTypes from '../../actions/types/portal/AuthTypes'
import * as AuthCreators from '../../actions/creators/portal/AuthCreators'

const call: any = Eff.call;

function* onLogin({ username, password }: AuthTypes.SetLoginRequest) {
    console.log('masuk sini')
    const { data, message } = yield call(
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

        yield put(
            AuthCreators.SetLoginSuccess(
                data.data
            )
        );
    } else {
        yield put(
            AuthCreators.SetLoginFailed(
                data.data
            )
        );
    }
}

function* onSuccessLogin(data: AuthTypes.SetLoginSuccess) {
    console.log(data)
}

function* watchUserLogin() {
    yield takeEvery('LOGIN_REQUEST', onLogin)
}

function* watchSuccessLogin() {
    yield takeEvery('LOGIN_SUCCESS', onSuccessLogin)
}

export function* AuthSagas() {
    yield all([
        fork(watchUserLogin),
        fork(watchSuccessLogin)
    ]);
}