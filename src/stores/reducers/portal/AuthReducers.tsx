import { AuthStates } from "../../states/portal/AuthStates";
import * as AuthTypes from "../../actions/types/portal/AuthTypes";

export const AuthReducers = (state = AuthStates, actions: AuthTypes.Auth) => {
    switch (actions.type) {
        case AuthTypes.LOGIN_REQUEST:
            return {
                ...state,
                isLoading: true
            }
        case AuthTypes.LOGIN_SUCCESS:
            return {
                ...state,
                isLoading: false,
                isLoggedIn: true,
                authData: actions.data
            }
        case AuthTypes.LOGIN_FAILED:
            return {
                ...state,
                isLoggedIn: false,
                isLoading: false
            }
        default:
            return state
    }
}