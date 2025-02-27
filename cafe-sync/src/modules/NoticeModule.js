// src/modules/NoticeModules.js

import { createActions, handleActions } from 'redux-actions';

// 초기 상태 정의
const initialState = {
    data: [], // 공지사항 목록
    selectedNotice: null, // 선택된 공지사항
};

// 액션 타입 정의
export const GET_NOTICES = 'notice/GET_NOTICES';
export const GET_NOTICE = 'notice/GET_NOTICE';
export const POST_NOTICE = 'notice/POST_NOTICE';
export const PUT_NOTICE = 'notice/PUT_NOTICE';
export const DELETE_NOTICE = 'notice/DELETE_NOTICE';
export const RESET_NOTICE_DETAIL = 'notice/RESET_NOTICE_DETAIL';

// 액션 생성자 정의
export const actions = createActions({
    [GET_NOTICES]: () => {}, // GET_NOTICES 액션
    [GET_NOTICE]: () => {},  // GET_NOTICE 액션
    [POST_NOTICE] : () => {},
    [PUT_NOTICE] : () => {},
    [DELETE_NOTICE] : () => {},
    [RESET_NOTICE_DETAIL] : () => {},
});

// 리듀서 정의
const noticeReducer = handleActions(
    {
        [GET_NOTICES]: (state, action) => ({
            ...state,
            data: action.payload, // 공지사항 목록 업데이트
        }),
        [GET_NOTICE]: (state, action) => ({
            ...state,
            selectedNotice: action.payload, // 선택된 공지사항 업데이트
        }),
        [POST_NOTICE]: (state, action) => ({
            ...state,
            data: action.payload, // 새로 등록된 공지사항을 목록 앞에 추가  [action.payload, ...state.data]
        }),
        [PUT_NOTICE] : (state , action) => ({
            ...state,
            data : action.payload
        }),
        [DELETE_NOTICE] : (state , action) => ({
            ...state,
            data : action.payload
        }),
        [RESET_NOTICE_DETAIL]: (state) => ({
            ...state,
            selectedNotice: null, // ✅ 공지사항 변경 시 초기화
        }),
    },
    initialState
);

export default noticeReducer;
