// src/apis/notice/noticeApi.js

import {
  GET_NOTICES,
  GET_NOTICE,
  POST_NOTICE,
  PUT_NOTICE,
  DELETE_NOTICE,
} from "../../modules/NoticeModule.js";

export const callNoticesAPI = () => {
  const requestURL = `http://localhost:8080/api/fran/notices`;

  return async (dispatch, getState) => {
    const result = await fetch(requestURL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "*/*",
      },
    }).then((response) => response.json());

    if (result.status === 200) {
      console.log("데이터 확인", result);
      dispatch({ type: GET_NOTICES, payload: result.data });

      return result.data; // 🔹 데이터를 반환하도록 추가
    } else {
      console.error("🚨 공지사항 API 호출 실패", result);
      return [];
    }
  };
};

export const callNoticeDetailAPI = ({ noticeCode }) => {
  const requestURL = `http://localhost:8080/api/fran/notices/${noticeCode}`;

  return async (dispatch, getState) => {
    const result = await fetch(requestURL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "*/*",
      },
    }).then((response) => response.json());
    if (result.status === 200) {
      dispatch({ type: GET_NOTICE, payload: result.data });
    }
  };
};

export const callIncreaseViewCountAPI = (noticeCode) => {
  const requestURL = `http://localhost:8080/api/fran/notices/${noticeCode}/increase-view`;

  return async (dispatch) => {
    const result = await fetch(requestURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "*/*",
      },
    }).then((response) => response.json());
    if (result.status === 200) {
      console.log("조회수 증가 성공");
    }
  };
};

export const callSearchNoticeAPI = ({ search }) => {
  const requestURL = `http://localhost:8080/api/fran/notices/search?search=${search}`;

  return async (dispatch, getState) => {
    const result = await fetch(requestURL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "*/*",
      },
    }).then((response) => response.json());
    dispatch({ type: GET_NOTICES, payload: result.data });
  };
};

export const callNoticeRegistAPI = ({
  noticeTitle,
  noticeContent,
  noticeDate,
  userId,
  attachment,
}) => {
  const requestURL = `http://localhost:8080/api/fran/notices`;

  return async (dispatch) => {
    const accessToken = sessionStorage.getItem("accessToken"); // 세션에서 토큰 가져오기
    if (!accessToken) {
      alert("❌ 로그인 정보가 없습니다. 다시 로그인해주세요.");
      return;
    }

    try {
      const requestBody = {
        noticeTitle,
        noticeContent,
        noticeDate,
        userId,
        attachment,
      };

      const response = await fetch(requestURL, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP 오류! 상태 코드: ${response.status}`);
      }

      const jsonData = await response.json();
      console.log("📢 공지사항 등록 응답:", jsonData);

      // 등록한 공지사항을 리덕스 상태에 저장
      dispatch({ type: POST_NOTICE, payload: jsonData });

      // 등록 후 목록 화면으로 리다이렉트
    } catch (error) {
      console.error("🚨 API 요청 중 오류 발생:", error);
      alert(`🚨 오류 발생: ${error.message}`);
    }
  };
};

export const callNoticeUpdateAPI = ({
  noticeTitle,
  noticeContent,
  noticeDate,
  userId,
  attachment,
  noticeCode,
}) => {
  const requestURL = `http://localhost:8080/api/fran/notices`;

  return async (dispatch) => {
    const accessToken = sessionStorage.getItem("accessToken"); // 세션에서 토큰 가져오기
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
          Authorization: `Bearer ${accessToken}`, // 세션에서 가져온 토큰 추가
        },
        body: JSON.stringify({
          noticeTitle,
          noticeContent,
          noticeDate,
          userId,
          attachment,
          noticeCode, // noticeCode 포함
        }), // JSON 형식으로 전송
      });

      if (!response.ok) {
        throw new Error(`HTTP 오류! 상태 코드: ${response.status}`);
      }

      const jsonData = await response.json();
      console.log("📢 공지사항 수정 응답:", jsonData);

      dispatch({ type: PUT_NOTICE, payload: jsonData });
    } catch (error) {
      console.error("🚨 API 요청 중 오류 발생:", error);
      alert(`🚨 오류 발생: ${error.message}`);
    }
  };
};

export const callNoticeDeleteAPI = ({ noticeCode }) => {
  const requestURL = `http://localhost:8080/api/fran/notices/${noticeCode}`;

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

      dispatch({ type: DELETE_NOTICE, payload: jsonData });
    } catch (error) {
      console.error("🚨 API 요청 중 오류 발생:", error);
      alert(`🚨 오류 발생: ${error.message}`);
    }
  };
};
