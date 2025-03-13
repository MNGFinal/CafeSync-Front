import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout, setCredentials } from "../../redux/authSlice";
import { useNavigate } from "react-router-dom";
import "./HQcommon.css";

function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Redux에서 사용자 정보, 만료 시각, Refresh Token 가져오기
  const { user, expireTime, refreshToken } = useSelector((state) => state.auth);
  const franName = user?.franchise?.franName || "알 수 없음";
  const name = user?.employee?.empName || "알 수 없음";
  const jobName = user?.job?.jobName || "알 수 없음";

  // ✅ sessionStorage에서 expireTime 가져오기 (새로고침 후 유지 확인)
  const getStoredExpireTime = () => {
    const storedExpireTime = sessionStorage.getItem("expireTime");
    console.log("📌 sessionStorage에서 가져온 expireTime:", storedExpireTime);
    return storedExpireTime ? parseInt(storedExpireTime, 10) : 0;
  };

  // ✅ useState 초기값을 sessionStorage에서 가져오도록 설정
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    let activeExpireTime = expireTime || getStoredExpireTime();
    console.log("🟢 현재 expireTime 상태:", activeExpireTime);

    if (!activeExpireTime || activeExpireTime <= Date.now()) {
      console.log("⏰ 토큰 만료 → 자동 로그아웃 (초기 진입)");
      dispatch(logout());
      sessionStorage.clear();
      navigate("/");
      return;
    }

    // ✅ 초기화 시 즉시 반영되도록 수정
    setTimeLeft(Math.floor((activeExpireTime - Date.now()) / 1000));

    const intervalId = setInterval(() => {
      const diff = activeExpireTime - Date.now();
      if (diff <= 0) {
        console.log("⏰ 토큰 만료 → 자동 로그아웃");
        dispatch(logout());
        sessionStorage.clear();
        navigate("/");
      } else {
        const left = Math.floor(diff / 1000);
        setTimeLeft(left);
        console.log("⏳ 타이머 갱신 중, 남은 초:", left);
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [expireTime, dispatch, navigate]);

  // ✅ 시간을 mm:ss 형식으로 변환
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}분 ${secs < 10 ? "0" : ""}${secs}초`;
  };

  const handleExtendSession = async () => {
    console.log("토큰 연장 요청 시작 - refreshToken:", refreshToken);
    try {
      const response = await fetch(
        "https://cafesync-back-production.up.railway.app/api/refresh-token",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        }
      );

      console.log("Refresh Token 응답 상태:", response.status);
      if (!response.ok) {
        const errorData = await response.text();
        console.error("Refresh Token 응답 에러:", errorData);
        throw new Error("토큰 연장 실패");
      }

      const data = await response.json();
      console.log("🔄 토큰 연장 응답 데이터:", data);

      const newExpireTime = Date.now() + 15 * 60 * 1000;
      dispatch(
        setCredentials({
          accessToken: data.accessToken,
          refreshToken,
          user,
          expireTime: newExpireTime,
        })
      );

      sessionStorage.setItem("accessToken", data.accessToken);
      sessionStorage.setItem("expireTime", newExpireTime.toString());
      setTimeLeft(15 * 60); // 🔥 바로 타이머 갱신
      alert("세션이 15분 연장되었습니다!");
    } catch (error) {
      console.error("세션 연장 중 오류:", error);
      alert("세션 연장 실패, 다시 로그인해주세요.");
      dispatch(logout());
      sessionStorage.clear();
      navigate("/");
    }
  };

  const onLogout = () => {
    if (window.confirm("로그아웃 하시겠습니까?")) {
      dispatch(logout());
      sessionStorage.clear();
      navigate("/");
    }
  };

  return (
    <div className="header">
      <img src="/images/logo/cafe-sync-logo1.png" className="logo" alt="logo" />
      <div className="fran-name">
        {franName} - {name} {jobName}
      </div>
      <div>
        {timeLeft > 0 ? (
          <span
            style={{ marginRight: "10px", color: "red", fontWeight: "bold" }}
          >
            남은 시간: {formatTime(timeLeft)}
          </span>
        ) : (
          <span
            style={{ marginRight: "10px", color: "gray", fontWeight: "bold" }}
          >
            세션 만료됨
          </span>
        )}
        <button onClick={handleExtendSession} className="extend-btn">
          연장
        </button>
        <button className="logout-btn" onClick={onLogout}>
          로그아웃
        </button>
      </div>
    </div>
  );
}

export default Header;
