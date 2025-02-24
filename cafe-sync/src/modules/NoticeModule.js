// src/modules/NoticeModules.js

import { createActions, handleActions } from 'redux-actions';

// 초기 상태 정의
const initialState = {
    data: [], // 공지사항 목록
    selectedNotice: null, // 선택된 공지사항
};

// 액션 타입 정의
export const GET_NOTICES = 'note/GET_NOTICES';
export const GET_NOTICE = 'note/GET_NOTICE';

// 액션 생성자 정의
export const actions = createActions({
    [GET_NOTICES]: () => {}, // GET_NOTICES 액션
    [GET_NOTICE]: () => {},  // GET_NOTICE 액션
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
    },
    initialState // 초기 상태
);

export default noticeReducer;
