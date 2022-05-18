import { put, fork, all, takeEvery } from 'redux-saga/effects'
import * as Eff from 'redux-saga/effects'
import { useToast } from '@chakra-ui/react'

import { apiConn } from '../../../components/apiHelpers';

import * as ProfileTypes from '../../actions/types/portal/ProfileTypes'
import * as ProfileCreators from '../../actions/creators/portal/ProfileCreators'

const call: any = Eff.call;

function* findPlace({ input_name, input_value }: ProfileTypes.setProfile) {
    if (input_name === 'id_card_location') {
        const { data } = yield call(
            apiConn,
            'get',
            `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GAPI_KEY}&libraries=places&callback=initMap`,
            'ext',
            {
                input_name,
                input_value
            }
        )
    }
}

function* watchProfileUpdate() {
    yield takeEvery('SET_PROFILE', findPlace)
}

export function* ProfileSagas() {
    yield all([
        fork(watchProfileUpdate)
    ]);
}