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

export const callIncreaseViewCountAPI = (noticeCode) => {
    const requestURL = `http://localhost:8080/api/fran/notices/${noticeCode}/increase-view`;

    return async (dispatch) => {
        const result = await fetch(requestURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: '*/*',
            },
        }).then((response) => response.json());
        if (result.status === 200) {
            console.log("조회수 증가 성공");
        }
    };
};

export const callSearchNoticeAPI = ({search}) => {
    const requestURL = `http://localhost:8080/api/fran/notices/search?search=${search}`

    return async (dispatch,getState) => {
        const result = await fetch(requestURL,{
            method : 'GET',
            headers: {
                'Content-Type': 'application/json',
                Accept: '*/*',
            },
        }).then((response) => response.json());
        dispatch({type:GET_NOTICES , payload: result.data});
    };
};