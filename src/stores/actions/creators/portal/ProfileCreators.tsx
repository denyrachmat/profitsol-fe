import * as ProfileTypes from '../../types/portal/ProfileTypes'

export const setProfile = (
    input_name: string,
    input_value: string
): ProfileTypes.setProfile => {
    return {
        type: ProfileTypes.SET_PROFILE,
        input_name,
        input_value
    }
}