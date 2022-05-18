import * as ax from 'axios'
import { store } from '../stores'
import { useNavigate } from 'react-router-dom';

interface apiResponse {
    status: boolean,
    data: Array<String> | Object,
    message: string
}

const axios: any = ax

export const apiConn = async (
    methods: string | number,
    url: string,
    root = 'api',
    data = null,
    authState = false,
    isUpload = false,
    isFile = false
): Promise<apiResponse | undefined> => {
    const state: any = store.getState();

    let header: any = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'HEAD, GET, POST, PUT, PATCH, DELETE, OPTIONS'
    }

    if (authState) {
        header = {
            ...header,
            'Authorization': `Bearer ${state.AuthInfo.token}`
        }
    } else if (isUpload) {
        header = {
            ...header,
            'Content-Type': 'multipart/form-data'
        }
    } else if (isFile) {
        header = {
            ...header,
            responseType: 'blob',
        }
    }

    let processAxios

    let rootDomain
    switch (root) {
        case 'apidev':
            rootDomain = process.env.REACT_APP_ROOT_DOMAIN_DEV
            break;
        case 'store':
            rootDomain = process.env.REACT_APP_ROOT_STORAGE_PROD
            break;
        case 'storedev':
            rootDomain = process.env.REACT_APP_ROOT_STORAGE_DEV
            break;
        case 'api':
            rootDomain = process.env.REACT_APP_ROOT_DOMAIN_PROD
            break;
        default:
            rootDomain = ''
            break;
    }

    console.log(rootDomain)
    if (data) {
        processAxios = axios({
            method: methods,
            url: `${rootDomain}${url}`,
            data: data,
            headers: header
        })
    } else {
        processAxios = axios({
            method: methods,
            url: `${rootDomain}${url}`,
            headers: header
        })
    }

    const request = await processAxios.then((result: { data: any; }) => {
        return result
    }).catch((e: any) => {
        return e.response.data
    })

    if (request) {
        console.log(request)
        return request
    }
}