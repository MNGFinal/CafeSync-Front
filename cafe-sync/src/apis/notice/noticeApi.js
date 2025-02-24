// src/apis/notice/noticeApi.js

import { GET_NOTICES , GET_NOTICE } from '../../modules/NoticeModule.js'

export const callNoticesAPI = () => {
    const requestURL = `http://localhost:8080/api/fran/notices`;

    return async(dispatch , getState) => {
        const result = await fetch(requestURL,{
            method : 'GET',
            headers: {
                'Content-Type': 'application/json',
                Accept: '*/*',
            },
        }).then((response)=>response.json());
        if(result.status === 200){
        dispatch({type:GET_NOTICES , payload : result.data})
        }
    };
};

export const callNoticeDetailAPI = ({noticeCode}) => {
    const requestURL = `http://localhost:8080/api/fran/notices/${noticeCode}`

    return async (dispatch,getState) => {
        const result = await fetch(requestURL,{
            method : 'GET',
            headers : {
                'Content-Type': 'application/json',
                Accept: '*/*',
            },
        }).then((response)=>response.json());
        if(result.status === 200){
            dispatch({type:GET_NOTICE , payload : result.data })
        }
    };
};