import * as ProfileTypes from '../../types/portal/ProfileTypes'

export const pushProfile = (
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
    Educations: Object[],
    families: Object[],
    phoneNum: string,
    detLoc: string,
    detLocCurrent: string
): ProfileTypes.pushProfile => {
    return {
        type: ProfileTypes.PUSH_PROFILE,
        firstName,
        lastName,
        birthplace,
        birthday,
        IDType,
        IDNum,
        country,
        province,
        cities,
        district,
        subdistrict,
        countryCurrent,
        provinceCurrent,
        citiesCurrent,
        districtCurrent,
        subdistrictCurrent,
        Educations,
        families,
        phoneNum,
        detLoc,
        detLocCurrent
    }
}

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