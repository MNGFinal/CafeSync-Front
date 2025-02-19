// src/apis/brista-note/baristaNoteApi.js

import { GET_NOTES, POST_NOTE } from '../../modules/NoteModule.js'
import { GET_NOTE } from '../../modules/NoteModule.js'

export const callBaristNotesAPI = () => {
    const requestURL = `http://localhost:8080/api/fran/getAllNotes`;

    return async(dispatch , getState) => {
        const result = await fetch(requestURL,{
            method : 'GET',
            headers: {
                'Content-Type': 'application/json',
                Accept: '*/*',
            },
        }).then((response)=>response.json());
        if(result.status === 200){
        dispatch({type:GET_NOTES , payload : result.data})
        }
    };
};

export const callBaristNoteDetailAPI = ({noteCode}) => {
    const requestURL = `http://localhost:8080/api/fran/getAllNotes/${noteCode}`

    return async (dispatch,getState) => {
        const result = await fetch(requestURL,{
            method : 'GET',
            headers : {
                'Content-Type': 'application/json',
                Accept: '*/*',
            },
        }).then((response)=>response.json());
        if(result.status === 200){
            dispatch({type:GET_NOTE , payload : result.data })
        }
    };
};

export const callSearchNoteAPI = ({search}) => {
    const requestURL = `http://localhost:8080/api/fran/getAllNotes/search?search=${search}`

    return async (dispatch,getState) => {
        const result = await fetch(requestURL,{
            method : 'GET',
            headers: {
                'Content-Type': 'application/json',
                Accept: '*/*',
            },
        }).then((response) => response.json());
        dispatch({type:GET_NOTES , payload: result.data});
    };
};

export const callNoteRegistAPI = ({ noteTitle, noteDetail, noteDate, userId , attachment }) => {
    const requestURL = `http://localhost:8080/api/fran/notes`;

    return async (dispatch) => {
        const accessToken = sessionStorage.getItem("accessToken"); // ✅ 세션에서 토큰 가져오기
        if (!accessToken) {
            alert("❌ 로그인 정보가 없습니다. 다시 로그인해주세요.");
            return;
        }

        try {
            const response = await fetch(requestURL, {
                method: 'POST',
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${accessToken}`, // ✅ 세션에서 가져온 토큰 추가
                },
                body: JSON.stringify({
                    noteTitle,
                    noteDetail,
                    noteDate,
                    userId,
                    attachment,
                }), // ✅ JSON 형식으로 전송
            });

            if (!response.ok) {
                throw new Error(`HTTP 오류! 상태 코드: ${response.status}`);
            }

            const jsonData = await response.json();
            console.log("📢 노트 등록 응답:", jsonData);

            dispatch({ type: POST_NOTE, payload: jsonData });
        } catch (error) {
            console.error("🚨 API 요청 중 오류 발생:", error);
            alert(`🚨 오류 발생: ${error.message}`);
        }
    };
};


