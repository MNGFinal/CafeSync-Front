// src/apis/brista-note/baristaNoteApi.js

import {
  GET_NOTES,
  POST_NOTE,
  PUT_NOTE,
  GET_NOTE,
  DELETE_NOTE,
} from "../../modules/NoteModule.js";

export const callBaristNotesAPI = () => {
  const requestURL = `http://localhost:8080/api/fran/notes`;

  return async (dispatch, getState) => {
    const result = await fetch(requestURL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "*/*",
      },
    }).then((response) => response.json());
    if (result.status === 200) {
      dispatch({ type: GET_NOTES, payload: result.data });
    }
  };
};

export const callBaristNoteDetailAPI = ({ noteCode }) => {
  const requestURL = `http://localhost:8080/api/fran/notes/${noteCode}`;

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
  const requestURL = `http://localhost:8080/api/fran/notes/search?search=${search}`;

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

// src/fran/pages/barista-note/BaristaNoteLayout.js (또는 관련 API 파일)

export const callNoteRegistAPI = ({
  noteTitle,
  noteDetail,
  noteDate,
  userId,
  attachment,
}) => {
  const requestURL = `http://localhost:8080/api/fran/notes`;

  return async (dispatch) => {
    const accessToken = sessionStorage.getItem("accessToken");
    if (!accessToken) {
      alert("❌ 로그인 정보가 없습니다. 다시 로그인해주세요.");
      return;
    }

    try {
      const response = await fetch(requestURL, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          noteTitle,
          noteDetail,
          noteDate,
          userId,
          attachment, // 첨부파일 URL 추가
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP 오류! 상태 코드: ${response.status}`);
      }

      const jsonData = await response.json();
      console.log("📢 노트 등록 응답:", jsonData);

      dispatch({ type: POST_NOTE, payload: jsonData });
    } catch (error) {
      console.error("🚨 API 요청 중 오류 발생:", error);
      alert(`🚨 오류 발생: ${error.message}`);
    }
  };
};

export const callNoteUpdateAPI = ({
  noteCode,
  noteTitle,
  noteDetail,
  noteDate,
  userId,
  attachment, // ✅ attachment 추가
}) => {
  const requestURL = `http://localhost:8080/api/fran/notes`;

  return async (dispatch) => {
    const accessToken = sessionStorage.getItem("accessToken");
    const sessionUser = JSON.parse(sessionStorage.getItem("user"));
    const sessionUserId = sessionUser ? sessionUser.userId : null;

    if (!accessToken) {
      alert("❌ 로그인 정보가 없습니다. 다시 로그인해주세요.");
      return;
    }

    if (sessionUserId !== userId) {
      alert("❌ 자신이 작성한 글만 수정할 수 있습니다.");
      return;
    }

    try {
      const response = await fetch(requestURL, {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          noteCode,
          noteTitle,
          noteDetail,
          noteDate,
          userId,
          attachment, // ✅ attachment 필드 추가
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP 오류! 상태 코드: ${response.status}`);
      }

      const jsonData = await response.json();
      console.log("📢 노트 수정 응답:", jsonData);

      dispatch({ type: PUT_NOTE, payload: jsonData });
    } catch (error) {
      console.error("🚨 API 요청 중 오류 발생:", error);
      alert(`🚨 오류 발생: ${error.message}`);
    }
  };
};

export const callNoteDeleteAPI = ({ noteCode }) => {
  const requestURL = `http://localhost:8080/api/fran/notes/${noteCode}`;

  return async (dispatch) => {
    const accessToken = sessionStorage.getItem("accessToken");
    const sessionUser = JSON.parse(sessionStorage.getItem("user"));
    const sessionUserId = sessionUser ? sessionUser.userId : null;

    if (!accessToken) {
      alert("❌ 로그인 정보가 없습니다. 다시 로그인해주세요.");
      return;
    }

    if (!sessionUserId) {
      alert("❌ 자신이 작성한 글만 삭제할 수 있습니다.");
      return;
    }

    try {
      const response = await fetch(requestURL, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP 오류! 상태 코드: ${response.status}`);
      }

      const jsonData = await response.json();
      console.log("📢 노트 삭제 응답:", jsonData);

      dispatch({ type: DELETE_NOTE, payload: jsonData });
    } catch (error) {
      console.error("🚨 API 요청 중 오류 발생:", error);
      alert(`🚨 오류 발생: ${error.message}`);
    }
  };
};
