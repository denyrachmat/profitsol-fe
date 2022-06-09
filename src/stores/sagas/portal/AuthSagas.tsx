import { put, fork, all, takeEvery } from 'redux-saga/effects'
import * as Eff from 'redux-saga/effects'

import { apiConn } from '../../../components/apiHelpers';

import * as AuthTypes from '../../actions/types/portal/AuthTypes'
import * as AuthCreators from '../../actions/creators/portal/AuthCreators'

import * as ProfileCreators from "../../actions/creators/portal/ProfileCreators"

const call: any = Eff.call;

function* onLogin({ username, password }: AuthTypes.SetLoginRequest) {
    console.log('masuk sini')
    try {
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

            if(data.data.user_det) {
                yield put(
                    ProfileCreators.pushProfile(
                        username,
                        data.data.user_det.pud_first_name,
                        data.data.user_det.pud_last_name,
                        data.data.user_det.pud_birth_place,
                        data.data.user_det.pud_birth_date,
                        data.data.user_det.pud_id_type,
                        data.data.user_det.pud_id_card,
                        data.data.user_det.pud_country,
                        data.data.user_det.pud_states,
                        data.data.user_det.pud_cities,
                        data.data.user_det.pud_district,
                        data.data.user_det.pud_subdistrict,
                        data.data.user_det.pud_country_rsdn,
                        data.data.user_det.pud_state_rsdn,
                        data.data.user_det.pud_cities_rsdn,
                        data.data.user_det.pud_district_rsdn,
                        data.data.user_det.pud_subdistrict_rsdn,
                        data.data.edu,
                        data.data.fam,
                        data.data.user_det.pud_phone,
                        data.data.user_det.pud_addr1,
                        data.data.user_det.pud_addr1_rsdn,
                        data.data.user_det.pud_photo
                    )
                )
            }
    
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
    } catch (error) {
        console.log(error)
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