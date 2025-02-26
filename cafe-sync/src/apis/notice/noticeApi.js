// src/apis/notice/noticeApi.js

import { GET_NOTICES , GET_NOTICE , POST_NOTICE } from '../../modules/NoticeModule.js'

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

export const callNoticeRegistAPI = ({ noticeTitle, noticeContent, noticeDate, userId, attachment }) => {
    const requestURL = `http://localhost:8080/api/fran/notices`;

    return async (dispatch) => {
        const accessToken = sessionStorage.getItem("accessToken"); // 세션에서 토큰 가져오기
        if (!accessToken) {
            alert("❌ 로그인 정보가 없습니다. 다시 로그인해주세요.");
            return;
        }

        try {
            const requestBody = {
                noticeTitle,
                noticeContent,
                noticeDate,
                userId,
                attachment,
            };

            const response = await fetch(requestURL, {
                method: 'POST',
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${accessToken}`,
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                throw new Error(`HTTP 오류! 상태 코드: ${response.status}`);
            }

            const jsonData = await response.json();
            console.log("📢 공지사항 등록 응답:", jsonData);

            // 등록한 공지사항을 리덕스 상태에 저장
            dispatch({ type: POST_NOTICE, payload: jsonData });

            // 등록 후 목록 화면으로 리다이렉트
        } catch (error) {
            console.error("🚨 API 요청 중 오류 발생:", error);
            alert(`🚨 오류 발생: ${error.message}`);
        }
    };
};
