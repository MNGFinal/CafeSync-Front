// src/apis/brista-note/baristaNoteApi.js

import { GET_NOTES } from '../../modules/NoteModule.js'
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