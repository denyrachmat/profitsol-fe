import { ProfileStates } from "../../states/portal/ProfileStates";
import * as ProfileTypes from "../../actions/types/portal/ProfileTypes";

export const ProfileReducers = (state = ProfileStates, actions: ProfileTypes.PortalProfile) => {
    switch (actions.type) {
        case ProfileTypes.SET_PROFILE:
            return {
                [actions.input_name]: actions.input_value,
                ...state
            }
        case ProfileTypes.PUSH_PROFILE: 
            return {
                ...state,
                firstName: actions.firstName,
                lastName: actions.lastName,
                birthplace: actions.birthplace,
                birthday: actions.birthday,
                IDType: actions.IDType,
                IDNum: actions.IDNum,
                country: actions.country,
                province: actions.province,
                cities: actions.cities,
                district: actions.district,
                subdistrict: actions.subdistrict,
                countryCurrent: actions.countryCurrent,
                provinceCurrent: actions.provinceCurrent,
                citiesCurrent: actions.citiesCurrent,
                districtCurrent: actions.districtCurrent,
                subdistrictCurrent: actions.subdistrictCurrent,
                educations: actions.educations,
                families: actions.families,
                phoneNum: actions.phoneNum,
                detLoc: actions.detLoc,
                detLocCurrent: actions.detLocCurrent,
                ava: actions.ava,
            }
        default:
            return state
    }
}