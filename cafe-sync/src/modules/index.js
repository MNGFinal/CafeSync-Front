//src/modules/index.js

import { combineReducers } from 'redux';
import noteReducer from '../modules/NoteModule.js';

const rootReducer = combineReducers({
    noteReducer : noteReducer
});

export default rootReducer;