//src/modules/NoteModules.js

import { createActions, handleActions } from 'redux-actions';

const initialState = {
    data: [], // 초기 상태를 객체로 변경
};
export const GET_NOTES = 'note/GET_NOTES';

const actions = createActions({
    [GET_NOTES]: () => {}
});

const noteReducer = handleActions(
    {
        [GET_NOTES]: (state, { payload }) => {
            return payload;
        }
    },
    initialState
);

export default noteReducer;