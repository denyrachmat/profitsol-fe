export const SET_PROFILE = 'SET_PROFILE'
export interface setProfile {
    type: typeof SET_PROFILE,
    input_name: string,
    input_value: string
}

export type PortalProfile = 
    setProfile