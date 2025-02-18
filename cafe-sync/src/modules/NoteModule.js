// src/modules/NoteModules.js

import { createActions, handleActions } from 'redux-actions';

const initialState = {
    data: [],
    selectedNote: null // ✅ 상세 노트 상태 추가
};

export const GET_NOTES = 'note/GET_NOTES';
export const GET_NOTE = 'note/GET_NOTE';

const actions = createActions({
    [GET_NOTES]: () => {},
    [GET_NOTE]: () => {},
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
    },
    initialState // ✅ 올바른 초기 상태 전달
);

export default noteReducer;
