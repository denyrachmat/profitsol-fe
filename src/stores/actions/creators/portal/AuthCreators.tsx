import * as actions from "../../types/portal/AuthTypes"

export const SetLoginRequest = (
    username: string,
    password: string
): actions.SetLoginRequest => {
    return {
        type: actions.LOGIN_REQUEST,
        username,
        password
    }
}

export const SetLoginSuccess = (
    data: String[]|Object,
    // message: string|Object[]
): actions.SetLoginSuccess => {
    return {
        type: actions.LOGIN_SUCCESS,
        data
    }
}

export const SetLoginFailed = (
    data: String[]|Object[]
): actions.SetLoginFailed => {
    return {
        type: actions.LOGIN_FAILED,
        data
    }
}