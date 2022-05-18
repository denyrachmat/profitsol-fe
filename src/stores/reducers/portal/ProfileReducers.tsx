import { ProfileStates } from "../../states/portal/ProfileStates";
import * as ProfileTypes from "../../actions/types/portal/ProfileTypes";

export const ProfileReducers = (state = ProfileStates, actions: ProfileTypes.PortalProfile) => {
    switch (actions.type) {
        case ProfileTypes.SET_PROFILE:
            return {
                [actions.input_name]: actions.input_value,
                ...state
            }
        default:
            return state
    }
}