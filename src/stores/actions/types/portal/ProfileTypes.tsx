export const PUSH_PROFILE = 'PUSH_PROFILE'
export interface pushProfile {
    type: typeof PUSH_PROFILE,
    firstName: string,
    lastName: string,
    birthplace: string,
    birthday: Date,
    IDType: string,
    IDNum: string,
    country: string,
    province: string,
    cities: string,
    district: string,
    subdistrict: string,
    countryCurrent: string,
    provinceCurrent: string,
    citiesCurrent: string,
    districtCurrent: string,
    subdistrictCurrent: string,
    educations: any,
    families: any,
    phoneNum: string,
    detLoc: string,
    detLocCurrent: string,
    ava: string
}

export const SET_PROFILE = 'SET_PROFILE'
export interface setProfile {
    type: typeof SET_PROFILE,
    input_name: string,
    input_value: string
}

export type PortalProfile = 
    pushProfile |
    setProfile