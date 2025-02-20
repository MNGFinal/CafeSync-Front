// src/apis/brista-note/baristaNoteApi.js

import { GET_NOTES, POST_NOTE } from "../../modules/NoteModule.js";
import { GET_NOTE } from "../../modules/NoteModule.js";

export const callBaristNotesAPI = () => {
  const requestURL = `http://localhost:8080/api/fran/getAllNotes`;

  return async (dispatch, getState) => {
    try {
      const response = await fetch(requestURL, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "*/*",
        },
      });

      // 1️⃣ 응답이 200이 아니면 에러 처리
      if (!response.ok) {
        console.error(`Error: ${response.status} - ${response.statusText}`);
        return;
      }

      // 2️⃣ 응답 본문이 비어있는 경우 예외 처리
      const text = await response.text();
      if (!text) {
        console.warn("서버에서 반환된 데이터가 없습니다.");
        return;
      }

      // 3️⃣ JSON 파싱 후 상태 코드 확인
      const result = JSON.parse(text);
      if (result.status === 200) {
        dispatch({ type: GET_NOTES, payload: result.data });
      }
    } catch (error) {
      console.error("API 호출 중 오류 발생:", error);
    }
  };
};

export const callBaristNoteDetailAPI = ({ noteCode }) => {
  const requestURL = `http://localhost:8080/api/fran/getAllNotes/${noteCode}`;

  return async (dispatch, getState) => {
    const result = await fetch(requestURL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "*/*",
      },
    }).then((response) => response.json());
    if (result.status === 200) {
      dispatch({ type: GET_NOTE, payload: result.data });
    }
  };
};

export const callSearchNoteAPI = ({ search }) => {
  const requestURL = `http://localhost:8080/api/fran/getAllNotes/search?search=${search}`;

  return async (dispatch, getState) => {
    const result = await fetch(requestURL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "*/*",
      },
    }).then((response) => response.json());
    dispatch({ type: GET_NOTES, payload: result.data });
  };
};

export const callNoteRegistAPI = ({
  noteTitle,
  noteDetail,
  noteDate,
  userId,
}) => {
  const requestURL = `http://localhost:8080/api/fran/notes`;

  return async (dispatch) => {
    try {
      const response = await fetch(requestURL, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          noteTitle,
          noteDetail,
          noteDate,
          userId,
        }), // ✅ JSON 형식으로 전송
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          `❌ 서버 오류: ${response.status}, 응답 내용: ${errorText}`
        );
        throw new Error(
          `🚨 서버 오류! 상태 코드: ${response.status}, 메시지: ${errorText}`
        );
      }

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const jsonData = await response.json();
        console.log("📢 노트 등록 응답:", jsonData);
        dispatch({ type: POST_NOTE, payload: jsonData });
      } else {
        console.warn("⚠️ 예상치 못한 응답 형식 (JSON 아님)");
        const textData = await response.text();
        console.log("📢 서버 응답:", textData);
      }
    } catch (error) {
      console.error("🚨 API 요청 중 오류 발생:", error);
      alert(`🚨 오류 발생: ${error.message}`);
    }
  };
};
