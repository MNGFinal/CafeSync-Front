// src/modules/NoteModules.js

import { createActions, handleActions } from 'redux-actions';

const initialState = {
    data: [],
    selectedNote: null // ✅ 상세 노트 상태 추가
};

export const GET_NOTES = 'note/GET_NOTES';
export const GET_NOTE = 'note/GET_NOTE';
export const POST_NOTE = 'note/POST_NOTE';
export const PUT_NOTE = 'note/PUT_NOTE'
export const DELETE_NOTE = 'note/DELETE_NOTE'

const actions = createActions({
    [GET_NOTES]: () => {},
    [GET_NOTE]: () => {},
    [POST_NOTE] : () => {},
    [PUT_NOTE] : () => {},
    [DELETE_NOTE] : () => {}
});

const noteReducer = handleActions(
    {
        [GET_NOTES]: (state, action) => ({
            ...state,
            data: action.payload, 
        }),
        [GET_NOTE]: (state, action) => ({ // ✅ GET_NOTE 액션을 올바르게 수정
            ...state,
            selectedNote: action.payload,
        }),
        [POST_NOTE]: (state, action) => ({
            ...state,
            date : action.payload
        }),
        [PUT_NOTE]: (state, action) => ({
            ...state,
            data : action.payload
        }),
        [DELETE_NOTE] : (state , action) => ({
            ...state,
            data : action.payload
        })
    },
    initialState // ✅ 올바른 초기 상태 전달
);

export default noteReducer;
