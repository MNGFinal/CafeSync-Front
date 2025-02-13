import axios from 'axios'; 

// 노트 전체 조회 함수
export const getAllNotes = async () => {
  try {
    const response = await axios.get('http://localhost:8080/api/fran/notes/getAllNotes');
    return response.data; 
  } catch (error) {
    console.error('Error fetching notes:', error);
    throw error;
  }
};