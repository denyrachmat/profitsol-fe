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