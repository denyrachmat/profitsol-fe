import { put, fork, all, takeEvery } from 'redux-saga/effects'
import * as Eff from 'redux-saga/effects'
import { useToast } from '@chakra-ui/react'

import { apiConn } from '../../../components/apiHelpers';

import * as ProfileTypes from '../../actions/types/portal/ProfileTypes'
import * as ProfileCreators from '../../actions/creators/portal/ProfileCreators'

const call: any = Eff.call;

function* pushingProfile({
    username,
    firstName,
    lastName,
    birthplace,
    birthday,
    IDType,
    IDNum,
    country,
    province,
    cities,
    district,
    subdistrict,
    countryCurrent,
    provinceCurrent,
    citiesCurrent,
    districtCurrent,
    subdistrictCurrent,
    educations,
    families,
    phoneNum,
    detLoc,
    detLocCurrent,
    ava
}: ProfileTypes.pushProfile) {
    try {
        // console.log('siap di store !!')
        const { data } = yield call(
            apiConn,
            'put',
            `portal/profiles/${username}`,
            'api',
            {
                firstName,
                lastName,
                birthplace,
                birthday,
                IDType,
                IDNum,
                country,
                province,
                cities,
                district,
                subdistrict,
                countryCurrent,
                provinceCurrent,
                citiesCurrent,
                districtCurrent,
                subdistrictCurrent,
                educations,
                families,
                phoneNum,
                detLoc,
                detLocCurrent,
                ava
            },
            true
        )

        console.log(data)
    } catch (error) {
        console.log(error)
    }
}

function* watchProfileUpdate() {
    yield takeEvery('PUSH_PROFILE', pushingProfile)
}

export function* ProfileSagas() {
    yield all([
        fork(watchProfileUpdate)
    ]);
}