// src/modules/NoteModules.js

import { createActions, handleActions } from 'redux-actions';

const initialState = {
    data: [],
};

export const GET_NOTES = 'note/GET_NOTES';

const actions = createActions({
    [GET_NOTES]: () => {},
});

const noteReducer = handleActions(
    {
        [GET_NOTES]: (state, action) => ({
            ...state,
            data: action.payload, 
        }),
    },
    initialState // ✅ 올바른 초기 상태 전달
);

export default noteReducer;
