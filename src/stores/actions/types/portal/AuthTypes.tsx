export const LOGIN_REQUEST = "LOGIN_REQUEST";
export interface SetLoginRequest {
  type: typeof LOGIN_REQUEST,
  username: string,
  password: string
}

export const LOGIN_SUCCESS = "LOGIN_SUCCESS";
export interface SetLoginSuccess {
    type: typeof LOGIN_SUCCESS,
    data: String[]| Object
}

export const LOGIN_FAILED = "LOGIN_FAILED";
export interface SetLoginFailed {
    type: typeof LOGIN_FAILED,
    data: String[]| Object
}

export type Auth = 
    SetLoginRequest |
    SetLoginSuccess |
    SetLoginFailed