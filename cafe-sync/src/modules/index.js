//src/modules/index.js

import { combineReducers } from 'redux';
import noteReducer from '../modules/NoteModule.js';
import noticeReducer from './NoticeModule.js';

const rootReducer = combineReducers({
    noteReducer : noteReducer,
    noticeReducer : noteReducer
});

export default rootReducer;