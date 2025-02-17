//src/modules/index.js

import { combineReducers } from 'redux';
import noteReducer from '../modules/NoteModule';

const rootReducer = combineReducers({
    noteReducer
});

export default rootReducer;